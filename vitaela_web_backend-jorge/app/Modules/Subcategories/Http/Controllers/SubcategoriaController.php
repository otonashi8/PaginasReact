<?php

declare(strict_types=1);

namespace App\Modules\Subcategories\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Subcategories\Http\Resources\SubcategoriaResource;
use App\Modules\Subcategories\Infrastructure\Persistence\Models\Subcategoria;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

final class SubcategoriaController extends Controller
{
    public function index(): JsonResponse
    {
        $subcategorias = Subcategoria::query()->with('categoria')->orderBy('nombre')->get();

        return response()->json([
            'success' => true,
            'message' => 'Subcategorías obtenidas correctamente.',
            'data' => SubcategoriaResource::collection($subcategorias)->resolve(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);

        $subcategoria = Subcategoria::create($data);
        $subcategoria->load('categoria');

        return response()->json([
            'success' => true,
            'message' => 'Subcategoría creada correctamente.',
            'data' => (new SubcategoriaResource($subcategoria))->resolve(),
        ], 201);
    }

    public function update(Request $request, Subcategoria $subcategoria): JsonResponse
    {
        $data = $this->validated($request, $subcategoria);

        $subcategoria->update($data);
        $subcategoria->load('categoria');

        return response()->json([
            'success' => true,
            'message' => 'Subcategoría actualizada correctamente.',
            'data' => (new SubcategoriaResource($subcategoria))->resolve(),
        ]);
    }

    public function destroy(Subcategoria $subcategoria): JsonResponse
    {
        $subcategoria->delete();

        return response()->json(['success' => true, 'message' => 'Subcategoría eliminada correctamente.']);
    }

    private function validated(Request $request, ?Subcategoria $existing = null): array
    {
        $categoriaIdRules = $existing ? ['sometimes', 'integer', 'exists:categorias,id'] : ['required', 'integer', 'exists:categorias,id'];
        $categoriaId = $request->input('categoriaId', $existing?->categoria_id);

        $validated = $request->validate([
            'categoriaId' => $categoriaIdRules,
            'nombre' => [
                $existing ? 'sometimes' : 'required',
                'string',
                'max:255',
                Rule::unique('subcategorias', 'nombre')
                    ->where(fn ($query) => $query->where('categoria_id', $categoriaId))
                    ->ignore($existing?->id),
            ],
            'activo' => ['sometimes', 'boolean'],
        ]);

        return [
            'categoria_id' => $validated['categoriaId'] ?? $existing?->categoria_id,
            'nombre' => $validated['nombre'] ?? $existing?->nombre,
            'activo' => $validated['activo'] ?? $existing?->activo ?? true,
        ];
    }
}
