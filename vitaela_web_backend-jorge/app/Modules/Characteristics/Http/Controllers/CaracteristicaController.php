<?php

declare(strict_types=1);

namespace App\Modules\Characteristics\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Characteristics\Http\Resources\CaracteristicaResource;
use App\Modules\Characteristics\Infrastructure\Persistence\Models\Caracteristica;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class CaracteristicaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min(max($request->integer('per_page', 10), 1), 100);
        $caracteristicas = Caracteristica::query()->orderByDesc('id')->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Características obtenidas correctamente.',
            'data' => [
                'items' => CaracteristicaResource::collection($caracteristicas->getCollection())->resolve(),
                'currentPage' => $caracteristicas->currentPage(),
                'totalPages' => $caracteristicas->lastPage(),
                'total' => $caracteristicas->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $caracteristica = Caracteristica::create($this->validated($request));
        return response()->json(['success' => true, 'message' => 'Característica creada correctamente.', 'data' => (new CaracteristicaResource($caracteristica))->resolve()], 201);
    }

    public function update(Request $request, Caracteristica $caracteristica): JsonResponse
    {
        $caracteristica->update($this->validated($request, false));
        return response()->json(['success' => true, 'message' => 'Característica actualizada correctamente.', 'data' => (new CaracteristicaResource($caracteristica))->resolve()]);
    }

    public function destroy(Caracteristica $caracteristica): JsonResponse
    {
        $caracteristica->delete();
        return response()->json(['success' => true, 'message' => 'Característica eliminada correctamente.']);
    }

    private function validated(Request $request, bool $allowId = true): array
    {
        $rules = ['titulo' => ['required', 'string', 'max:255'], 'descripcion' => ['required', 'string'], 'activo' => ['sometimes', 'boolean']];
        if ($allowId) $rules['id'] = ['sometimes', 'integer', 'min:1'];
        $data = $request->validate($rules);
        return ['id' => $data['id'] ?? null, 'titulo' => $data['titulo'], 'descripcion' => $data['descripcion'], 'activo' => $data['activo'] ?? true];
    }
}
