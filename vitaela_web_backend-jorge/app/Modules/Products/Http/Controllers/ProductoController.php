<?php

declare(strict_types=1);

namespace App\Modules\Products\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Products\Http\Resources\ProductoResource;
use App\Modules\Products\Infrastructure\Persistence\Models\Producto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

final class ProductoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Producto::query();

        if (! $request->boolean('all')) {
            $query->where('activo', true);
        }

        if ($request->filled('categoria')) {
            $query->where('categoria', $request->query('categoria'));
        }

        $productos = $query->orderBy('id', 'asc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Productos obtenidos correctamente.',
            'data' => ProductoResource::collection($productos)->resolve(),
        ]);
    }

    public function show(string $idOrSlug): JsonResponse
    {
        $producto = is_numeric($idOrSlug)
            ? Producto::find((int) $idOrSlug)
            : Producto::where('slug', $idOrSlug)->first();

        if (! $producto) {
            return response()->json([
                'success' => false,
                'message' => 'Producto no encontrado.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Producto obtenido correctamente.',
            'data' => (new ProductoResource($producto))->resolve(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validatedData($request);

        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['nombre']);
        }

        $producto = Producto::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Producto creado correctamente.',
            'data' => (new ProductoResource($producto))->resolve(),
        ], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $producto = Producto::find((int) $id) ?? Producto::where('slug', $id)->firstOrFail();
        $data = $this->validatedData($request, $producto->id);

        $producto->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Producto actualizado correctamente.',
            'data' => (new ProductoResource($producto))->resolve(),
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $producto = Producto::find((int) $id) ?? Producto::where('slug', $id)->first();
        if ($producto) {
            $producto->delete();
        }

        return response()->json(['success' => true, 'message' => 'Producto eliminado correctamente.']);
    }

    private function validatedData(Request $request, ?int $ignoreId = null): array
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:productos,slug,'.$ignoreId],
            'description' => ['nullable', 'string'],
            'longDescription' => ['nullable', 'string'],
            'category' => ['nullable', 'string'],
            'subcategory' => ['nullable', 'string'],
            'unitPrice' => ['nullable', 'numeric', 'min:0'],
            'previousPrice' => ['nullable', 'numeric', 'min:0'],
            'image' => ['nullable', 'string'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'featured' => ['nullable', 'boolean'],
            'rating' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'reviews' => ['nullable', 'integer', 'min:0'],
            'badge' => ['nullable', 'string'],
            'presentacion' => ['nullable', 'string'],
            'modoDeUso' => ['nullable', 'string'],
            'relatedIds' => ['nullable', 'array'],
            'characteristicIds' => ['nullable', 'array'],
            'benefitIds' => ['nullable', 'array'],
            'characteristics' => ['nullable', 'array'],
            'benefits' => ['nullable', 'array'],
            'active' => ['nullable', 'boolean'],
        ]);

        $nombre = $validated['name'];
        $slug = $validated['slug'] ?? Str::slug($nombre);

        return [
            'nombre' => $nombre,
            'slug' => $slug,
            'descripcion' => $validated['description'] ?? '',
            'long_description' => $validated['longDescription'] ?? $validated['description'] ?? '',
            'categoria' => $validated['category'] ?? 'bienestar',
            'subcategoria' => $validated['subcategory'] ?? '',
            'precio' => $validated['unitPrice'] ?? 0,
            'precio_anterior' => $validated['previousPrice'] ?? 0,
            'imagen' => $validated['image'] ?? '',
            'stock' => $validated['stock'] ?? 0,
            'destacado' => $validated['featured'] ?? false,
            'rating' => $validated['rating'] ?? 5.0,
            'reviews' => $validated['reviews'] ?? 0,
            'badge' => $validated['badge'] ?? null,
            'presentacion' => $validated['presentacion'] ?? 'Producto Vitaela',
            'modo_de_uso' => $validated['modoDeUso'] ?? '',
            'relacionados' => $validated['relatedIds'] ?? [],
            'caracteristica_ids' => $validated['characteristicIds'] ?? [],
            'beneficio_ids' => $validated['benefitIds'] ?? [],
            'caracteristicas' => $validated['characteristics'] ?? [],
            'beneficios' => $validated['benefits'] ?? [],
            'activo' => $validated['active'] ?? true,
        ];
    }
}
