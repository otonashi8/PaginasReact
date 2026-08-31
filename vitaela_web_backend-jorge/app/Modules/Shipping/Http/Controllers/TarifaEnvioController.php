<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Shipping\Http\Resources\TarifaEnvioResource;
use App\Modules\Shipping\Infrastructure\Persistence\Models\TarifaEnvio;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class TarifaEnvioController extends Controller
{
    public function index(): JsonResponse
    {
        $registros = TarifaEnvio::query()
            ->where('activo', true)
            ->orderBy('departamento_nombre')
            ->get();

        $primeraTarifa = $registros->first();
        $tarifas = $registros->filter(fn (TarifaEnvio $tarifa): bool => $tarifa->departamento_nombre !== null);

        return response()->json([
            'success' => true,
            'message' => 'Configuración de envío obtenida correctamente.',
            'data' => [
                'montoMinimoEnvioGratis' => (float) ($primeraTarifa?->monto_minimo_envio_gratis ?? 0),
                'tarifaGeneral' => $primeraTarifa?->tarifa_general !== null ? (float) $primeraTarifa->tarifa_general : null,
                'tarifas' => TarifaEnvioResource::collection($tarifas)->resolve(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $tarifa = TarifaEnvio::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Tarifa de envío creada correctamente.',
            'data' => (new TarifaEnvioResource($tarifa))->resolve(),
        ], 201);
    }

    public function update(Request $request, TarifaEnvio $tarifaEnvio): JsonResponse
    {
        $tarifaEnvio->update($this->validated($request));

        return response()->json([
            'success' => true,
            'message' => 'Tarifa de envío actualizada correctamente.',
            'data' => (new TarifaEnvioResource($tarifaEnvio->fresh()))->resolve(),
        ]);
    }

    public function destroy(TarifaEnvio $tarifaEnvio): JsonResponse
    {
        $tarifaEnvio->update(['activo' => false]);

        return response()->json(['success' => true, 'message' => 'Tarifa de envío eliminada correctamente.']);
    }

    public function replace(Request $request): JsonResponse
    {
        $data = $request->validate([
            'montoMinimoEnvioGratis' => ['required', 'numeric', 'min:0'],
            'tarifaGeneral' => ['nullable', 'numeric', 'min:0'],
            'tarifas' => ['array'],
            'tarifas.*.departamentoCodigo' => ['nullable', 'string', 'size:2'],
            'tarifas.*.ubicacion' => ['required', 'string', 'max:255'],
            'tarifas.*.costo' => ['required', 'numeric', 'min:0'],
        ]);

        DB::transaction(function () use ($data): void {
            TarifaEnvio::query()->update(['activo' => false]);

            foreach ($data['tarifas'] ?? [] as $tarifa) {
                TarifaEnvio::updateOrCreate(
                    ['departamento_codigo' => $tarifa['departamentoCodigo'] ?? null, 'departamento_nombre' => $tarifa['ubicacion']],
                    [
                        'costo' => $tarifa['costo'],
                        'monto_minimo_envio_gratis' => $data['montoMinimoEnvioGratis'],
                        'tarifa_general' => $data['tarifaGeneral'],
                        'activo' => true,
                    ],
                );
            }

            if (count($data['tarifas'] ?? []) === 0) {
                TarifaEnvio::create([
                    'monto_minimo_envio_gratis' => $data['montoMinimoEnvioGratis'],
                    'tarifa_general' => $data['tarifaGeneral'],
                    'activo' => true,
                ]);
            }
        });

        return response()->json(['success' => true, 'message' => 'Configuración de envío guardada correctamente.']);
    }

    private function validated(Request $request): array
    {
        $data = $request->validate([
            'departamentoCodigo' => ['nullable', 'string', 'size:2'],
            'ubicacion' => ['required', 'string', 'max:255'],
            'costo' => ['required', 'numeric', 'min:0'],
            'montoMinimoEnvioGratis' => ['sometimes', 'numeric', 'min:0'],
            'tarifaGeneral' => ['nullable', 'numeric', 'min:0'],
            'activo' => ['sometimes', 'boolean'],
        ]);

        return [
            'departamento_codigo' => $data['departamentoCodigo'] ?? null,
            'departamento_nombre' => $data['ubicacion'],
            'costo' => $data['costo'],
            'monto_minimo_envio_gratis' => $data['montoMinimoEnvioGratis'] ?? 0,
            'tarifa_general' => $data['tarifaGeneral'] ?? null,
            'activo' => $data['activo'] ?? true,
        ];
    }
}
