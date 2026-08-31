<?php

declare(strict_types=1);

namespace App\Modules\Genders\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Genders\Http\Resources\GeneroResource;
use App\Modules\Genders\Infrastructure\Persistence\Models\Genero;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

final class GeneroController extends Controller
{
    public function index(): JsonResponse
    {
        $generos = Genero::query()->orderBy('nombre')->get();

        return response()->json([
            'success' => true,
            'message' => 'Géneros obtenidos correctamente.',
            'data' => GeneroResource::collection($generos)->resolve(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);

        $genero = Genero::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Género creado correctamente.',
            'data' => (new GeneroResource($genero))->resolve(),
        ], 201);
    }

    public function update(Request $request, Genero $genero): JsonResponse
    {
        $data = $this->validated($request, $genero->id);

        $genero->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Género actualizado correctamente.',
            'data' => (new GeneroResource($genero))->resolve(),
        ]);
    }

    public function destroy(Genero $genero): JsonResponse
    {
        $genero->delete();

        return response()->json(['success' => true, 'message' => 'Género eliminado correctamente.']);
    }

    private function validated(Request $request, ?int $ignoreId = null): array
    {
        $validated = $request->validate([
            'nombre' => ['required', 'string', 'max:255', Rule::unique('generos', 'nombre')->ignore($ignoreId)],
            'activo' => ['sometimes', 'boolean'],
        ]);

        return [
            'nombre' => $validated['nombre'],
            'activo' => $validated['activo'] ?? true,
        ];
    }
}
