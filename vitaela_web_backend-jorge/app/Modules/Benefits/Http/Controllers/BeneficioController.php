<?php

declare(strict_types=1);

namespace App\Modules\Benefits\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Benefits\Http\Resources\BeneficioResource;
use App\Modules\Benefits\Infrastructure\Persistence\Models\Beneficio;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class BeneficioController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min(max($request->integer('per_page', 10), 1), 100);
        $beneficios = Beneficio::query()->orderByDesc('id')->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Beneficios obtenidos correctamente.',
            'data' => [
                'items' => BeneficioResource::collection($beneficios->getCollection())->resolve(),
                'currentPage' => $beneficios->currentPage(),
                'totalPages' => $beneficios->lastPage(),
                'total' => $beneficios->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $beneficio = Beneficio::create($this->validated($request));

        return response()->json(['success' => true, 'message' => 'Beneficio creado correctamente.', 'data' => (new BeneficioResource($beneficio))->resolve()], 201);
    }

    public function update(Request $request, Beneficio $beneficio): JsonResponse
    {
        $beneficio->update($this->validated($request, false));

        return response()->json(['success' => true, 'message' => 'Beneficio actualizado correctamente.', 'data' => (new BeneficioResource($beneficio))->resolve()]);
    }

    public function destroy(Beneficio $beneficio): JsonResponse
    {
        $beneficio->delete();
        return response()->json(['success' => true, 'message' => 'Beneficio eliminado correctamente.']);
    }

    private function validated(Request $request, bool $allowId = true): array
    {
        $rules = [
            'titulo' => ['required', 'string', 'max:255'],
            'descripcion' => ['required', 'string'],
            'activo' => ['sometimes', 'boolean'],
        ];
        if ($allowId) $rules['id'] = ['sometimes', 'integer', 'min:1'];
        $data = $request->validate($rules);
        return ['id' => $data['id'] ?? null, 'titulo' => $data['titulo'], 'descripcion' => $data['descripcion'], 'activo' => $data['activo'] ?? true];
    }
}
