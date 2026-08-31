<?php

declare(strict_types=1);

namespace App\Modules\Rrhh\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Rrhh\Http\Resources\TrabajoResource;
use App\Modules\Rrhh\Infrastructure\Persistence\Models\Trabajo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

final class TrabajoController extends Controller
{
    public function index(): JsonResponse
    {
        $trabajos = Trabajo::query()->where('activo', true)->orderByDesc('id')->get();

        return response()->json([
            'success' => true,
            'data' => TrabajoResource::collection($trabajos)->resolve(),
        ]);
    }

    public function adminIndex(): JsonResponse
    {
        $trabajos = Trabajo::query()->orderByDesc('id')->get();

        return response()->json([
            'success' => true,
            'data' => TrabajoResource::collection($trabajos)->resolve(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);

        $trabajo = Trabajo::create([
            'puesto' => $data['puesto'],
            'nombre' => $data['nombre'],
            'descripcion_breve' => $data['descripcion_breve'],
            'horario' => $data['horario'],
            'ubicacion' => $data['ubicacion'],
            'redirecciones' => $data['redirecciones'],
            'imagen_url' => $data['imagen_url'] ?? null,
            'activo' => $data['activo'] ?? true,
        ]);

        $this->applyImage($trabajo, $request);
        $trabajo->save();

        return response()->json([
            'success' => true,
            'message' => 'Trabajo creado correctamente.',
            'data' => (new TrabajoResource($trabajo))->resolve(),
        ], 201);
    }

    public function update(Request $request, Trabajo $trabajo): JsonResponse
    {
        $data = $this->validated($request, false);

        $trabajo->update([
            'puesto' => $data['puesto'],
            'nombre' => $data['nombre'],
            'descripcion_breve' => $data['descripcion_breve'],
            'horario' => $data['horario'],
            'ubicacion' => $data['ubicacion'],
            'redirecciones' => $data['redirecciones'],
            'imagen_url' => $data['imagen_url'] ?? $trabajo->imagen_url,
            'activo' => $data['activo'] ?? $trabajo->activo,
        ]);

        $this->applyImage($trabajo, $request);
        $trabajo->save();

        return response()->json([
            'success' => true,
            'message' => 'Trabajo actualizado correctamente.',
            'data' => (new TrabajoResource($trabajo->refresh()))->resolve(),
        ]);
    }

    public function destroy(Trabajo $trabajo): JsonResponse
    {
        if ($trabajo->imagen_path) {
            Storage::disk('public')->delete($trabajo->imagen_path);
        }

        $trabajo->delete();

        return response()->json([
            'success' => true,
            'message' => 'Trabajo eliminado correctamente.',
        ]);
    }

    private function validated(Request $request, bool $creating = true): array
    {
        $puesto = trim((string) ($request->input('puesto') ?? ''));
        $nombre = trim((string) ($request->input('nombre') ?? ''));
        $descripcionBreve = trim((string) ($request->input('descripcion_breve', $request->input('descripcionBreve')) ?? ''));
        $horario = trim((string) ($request->input('horario') ?? ''));
        $ubicacion = trim((string) ($request->input('ubicacion') ?? ''));
        $imagenUrl = trim((string) ($request->input('imagen_url', $request->input('imagenUrl')) ?? '')) ?: null;
        $activo = $request->boolean('activo', true);

        $redirecciones = $this->normalizeRedirecciones($request->input('redirecciones'));

        $request->validate([
            'puesto' => ['required', 'string', 'max:120'],
            'nombre' => ['required', 'string', 'max:120'],
            'descripcion_breve' => ['required', 'string'],
            'horario' => ['nullable', 'string', 'max:120'],
            'ubicacion' => ['nullable', 'string', 'max:180'],
            'imagen_url' => ['nullable', 'string', 'max:500'],
            'imagen' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:4096'],
            'activo' => ['sometimes', 'boolean'],
        ]);

        return [
            'puesto' => $puesto,
            'nombre' => $nombre,
            'descripcion_breve' => $descripcionBreve,
            'horario' => $horario,
            'ubicacion' => $ubicacion,
            'imagen_url' => $imagenUrl,
            'redirecciones' => $redirecciones,
            'activo' => $activo,
        ];
    }

    private function normalizeRedirecciones(mixed $input): array
    {
        if (is_string($input)) {
            $input = json_decode($input, true);
        }

        if (! is_array($input)) {
            return [];
        }

        $normalized = [];

        foreach ($input as $item) {
            if (! is_array($item)) {
                continue;
            }

            $nombre = trim((string) ($item['nombre'] ?? ''));
            $url = trim((string) ($item['url'] ?? ''));

            if ($nombre === '' || $url === '') {
                continue;
            }

            $normalized[] = [
                'nombre' => $nombre,
                'url' => $url,
            ];
        }

        return $normalized;
    }

    private function applyImage(Trabajo $trabajo, Request $request): void
    {
        /** @var UploadedFile|null $file */
        $file = $request->file('imagen');

        if (! $file) {
            return;
        }

        if ($trabajo->imagen_path) {
            Storage::disk('public')->delete($trabajo->imagen_path);
        }

        $trabajo->imagen_path = $file->store('trabajos', 'public');
        $trabajo->imagen_url = null;
    }
}
