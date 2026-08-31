<?php

declare(strict_types=1);

namespace App\Modules\Categories\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Categories\Http\Resources\CategoriaResource;
use App\Modules\Categories\Infrastructure\Persistence\Models\Categoria;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

final class CategoriaController extends Controller
{
    public function index(): JsonResponse
    {
        $categorias = Categoria::query()->orderBy('nombre')->get();

        return response()->json([
            'success' => true,
            'message' => 'Categorías obtenidas correctamente.',
            'data' => CategoriaResource::collection($categorias)->resolve(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);

        $categoria = Categoria::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Categoría creada correctamente.',
            'data' => (new CategoriaResource($categoria))->resolve(),
        ], 201);
    }

    public function update(Request $request, Categoria $categoria): JsonResponse
    {
        $data = $this->validated($request, $categoria->id);

        $categoria->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Categoría actualizada correctamente.',
            'data' => (new CategoriaResource($categoria))->resolve(),
        ]);
    }

    public function destroy(Categoria $categoria): JsonResponse
    {
        if ($categoria->subcategorias()->exists()) {
            throw ValidationException::withMessages([
                'categoria' => 'No se puede eliminar: tiene subcategorías asociadas.',
            ]);
        }

        $categoria->delete();

        return response()->json(['success' => true, 'message' => 'Categoría eliminada correctamente.']);
    }

    private function validated(Request $request, ?int $ignoreId = null): array
    {
        $validated = $request->validate([
            'nombre' => ['required', 'string', 'max:255', Rule::unique('categorias', 'nombre')->ignore($ignoreId)],
            'activo' => ['sometimes', 'boolean'],
        ]);

        return [
            'nombre' => $validated['nombre'],
            'activo' => $validated['activo'] ?? true,
        ];
    }
}
