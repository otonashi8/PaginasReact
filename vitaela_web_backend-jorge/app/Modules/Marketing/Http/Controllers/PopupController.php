<?php

declare(strict_types=1);

namespace App\Modules\Marketing\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Marketing\Http\Resources\PopupResource;
use App\Modules\Marketing\Infrastructure\Persistence\Models\Popup;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class PopupController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Pop-Ups obtenidos correctamente.',
            'data' => PopupResource::collection(Popup::query()->orderBy('orden')->orderBy('nombre')->get())->resolve(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $popup = Popup::create($this->validated($request));

        return response()->json([
            'success' => true,
            'message' => 'Pop-Up creado correctamente.',
            'data' => (new PopupResource($popup))->resolve(),
        ], 201);
    }

    public function update(Request $request, Popup $popup): JsonResponse
    {
        $popup->update($this->validated($request, true));

        return response()->json([
            'success' => true,
            'message' => 'Pop-Up actualizado correctamente.',
            'data' => (new PopupResource($popup->refresh()))->resolve(),
        ]);
    }

    public function destroy(Popup $popup): JsonResponse
    {
        $popup->delete();

        return response()->json(['success' => true, 'message' => 'Pop-Up eliminado correctamente.']);
    }

    private function validated(Request $request, bool $isUpdate = false): array
    {
        $validated = $request->validate([
            'nombre' => [$isUpdate ? 'sometimes' : 'required', 'string', 'max:255'],
            'tipoContenido' => [$isUpdate ? 'sometimes' : 'required', 'in:imagen,video'],
            'recursoMedia' => ['nullable', 'string'],
            'imagenDesktop' => ['nullable', 'string'],
            'imagenMobile' => ['nullable', 'string'],
            'activo' => ['sometimes', 'boolean'],
            'mostrarEn' => [$isUpdate ? 'sometimes' : 'required', 'string', 'max:255'],
            'redireccion' => ['sometimes', 'boolean'],
            'destino' => ['nullable', 'string', 'max:255'],
            'frecuencia' => ['sometimes', 'in:cada-vez,una-vez-sesion'],
            'retraso' => ['sometimes', 'integer', 'min:0'],
            'orden' => ['sometimes', 'integer', 'min:0'],
        ]);

        return [
            'nombre' => $validated['nombre'] ?? null,
            'tipo_contenido' => $validated['tipoContenido'] ?? null,
            'recurso_media' => $validated['recursoMedia'] ?? null,
            'imagen_desktop' => $validated['imagenDesktop'] ?? null,
            'imagen_mobile' => $validated['imagenMobile'] ?? null,
            'activo' => $validated['activo'] ?? true,
            'mostrar_en' => $validated['mostrarEn'] ?? '/',
            'redireccion' => $validated['redireccion'] ?? false,
            'destino' => $validated['destino'] ?? null,
            'frecuencia' => $validated['frecuencia'] ?? 'cada-vez',
            'retraso' => $validated['retraso'] ?? 0,
            'orden' => $validated['orden'] ?? ((int) (Popup::query()->max('orden') ?? -1) + 1),
        ];
    }
}