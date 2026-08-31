<?php

declare(strict_types=1);

namespace App\Modules\PricingRules\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\PricingRules\Http\Resources\ReglaPrecioResource;
use App\Modules\PricingRules\Infrastructure\Persistence\Models\ReglaPrecio;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class ReglaPrecioController extends Controller
{
    public function index(): JsonResponse
    {
        $reglas = ReglaPrecio::query()->orderByDesc('id')->get();

        return response()->json([
            'success' => true,
            'message' => 'Reglas de precio obtenidas correctamente.',
            'data' => ReglaPrecioResource::collection($reglas)->resolve(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);

        $regla = ReglaPrecio::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Regla de precio creada correctamente.',
            'data' => (new ReglaPrecioResource($regla))->resolve(),
        ], 201);
    }

    public function update(Request $request, ReglaPrecio $regla): JsonResponse
    {
        $data = $this->validated($request);

        $regla->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Regla de precio actualizada correctamente.',
            'data' => (new ReglaPrecioResource($regla))->resolve(),
        ]);
    }

    public function destroy(ReglaPrecio $regla): JsonResponse
    {
        $regla->delete();

        return response()->json(['success' => true, 'message' => 'Regla de precio eliminada correctamente.']);
    }

    private function validated(Request $request): array
    {
        $validated = $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string'],
            'tipo' => ['required', 'string', 'in:producto,bogo_gratis,bogo_descuento,volumen,perfil,carrito,combo'],
            'estado' => ['sometimes', 'boolean'],
            'prioridad' => ['sometimes', 'integer', 'min:1'],
            'fechaInicio' => ['nullable', 'date_format:Y-m-d'],
            'fechaFin' => ['nullable', 'date_format:Y-m-d'],
            'requiereCupon' => ['sometimes', 'boolean'],
            'configuracion' => ['sometimes', 'array'],
        ]);

        return [
            'nombre' => $validated['nombre'],
            'descripcion' => $validated['descripcion'] ?? '',
            'tipo' => $validated['tipo'],
            'estado' => $validated['estado'] ?? true,
            'prioridad' => $validated['prioridad'] ?? 1,
            'fecha_inicio' => $validated['fechaInicio'] ?? null,
            'fecha_fin' => $validated['fechaFin'] ?? null,
            'requiere_cupon' => $validated['requiereCupon'] ?? false,
            'configuracion' => $validated['configuracion'] ?? [],
        ];
    }
}
