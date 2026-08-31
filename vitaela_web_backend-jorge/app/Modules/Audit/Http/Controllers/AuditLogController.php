<?php

declare(strict_types=1);

namespace App\Modules\Audit\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Audit\Infrastructure\Persistence\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;

final class AuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $logs = AuditLog::query()->latest('fecha')->paginate(min((int) $request->integer('per_page', 10), 100));

        return response()->json(['success' => true, 'message' => 'Logs obtenidos correctamente.', 'data' => $logs]);
    }

    public function store(Request $request): JsonResponse
    {
        $log = AuditLog::create($this->attributes($request, $request->validate($this->rules())));

        return response()->json(['success' => true, 'message' => 'Log registrado correctamente.', 'data' => $log], 201);
    }

    public function import(Request $request): JsonResponse
    {
        $data = $request->validate(['logs' => ['required', 'array', 'max:1000'], 'logs.*' => ['required', 'array']]);
        $now = now();
        $rows = collect($data['logs'])->map(fn (array $log): array => $this->attributes($request, $log, $now))->all();
        AuditLog::insert($rows);

        return response()->json(['success' => true, 'message' => count($rows) . ' logs importados.', 'data' => ['imported' => count($rows)]], 201);
    }

    public function destroy(): JsonResponse
    {
        AuditLog::query()->delete();

        return response()->json(['success' => true, 'message' => 'Historial eliminado correctamente.']);
    }

    private function rules(): array
    {
        return [
            'id' => ['nullable', 'string', 'max:100'],
            'usuario' => ['nullable', 'string', 'max:255'],
            'rol' => ['nullable', 'string', 'max:255'],
            'modulo' => ['required', 'string', 'max:255'],
            'submodulo' => ['nullable', 'string', 'max:255'],
            'accion' => ['required', 'string', 'max:255'],
            'mensajeCorto' => ['nullable', 'string'],
            'descripcion' => ['nullable', 'string'],
            'objetoAfectado' => ['nullable', 'string', 'max:255'],
            'direccionIp' => ['nullable', 'ip'],
            'fecha' => ['nullable', 'date'],
            'metadatos' => ['nullable', 'array'],
        ];
    }

    private function attributes(Request $request, array $data, ?Carbon $fallbackDate = null): array
    {
        $actor = $request->user();

        return [
            'usuario_id' => $actor?->getAuthIdentifier(),
            'usuario' => (string) ($data['usuario'] ?? $actor?->usuario ?? ''),
            'rol' => (string) ($data['rol'] ?? ''),
            'modulo' => (string) ($data['modulo'] ?? ''),
            'submodulo' => $data['submodulo'] ?? null,
            'accion' => (string) ($data['accion'] ?? ''),
            'mensaje_corto' => $data['mensajeCorto'] ?? $data['descripcion'] ?? null,
            'objeto_afectado' => $data['objetoAfectado'] ?? null,
            'direccion_ip' => $data['direccionIp'] ?? $request->ip(),
            'agente_usuario' => $request->userAgent(),
            'metadatos' => Arr::except($data, ['id', 'usuario', 'rol', 'modulo', 'submodulo', 'accion', 'mensajeCorto', 'descripcion', 'objetoAfectado', 'direccionIp', 'fecha']),
            'fecha' => isset($data['fecha']) ? Carbon::parse($data['fecha']) : ($fallbackDate ?? now()),
            'created_at' => $fallbackDate ?? now(),
            'updated_at' => $fallbackDate ?? now(),
        ];
    }
}
