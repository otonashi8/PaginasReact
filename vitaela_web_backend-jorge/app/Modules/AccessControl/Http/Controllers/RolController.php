<?php

declare(strict_types=1);

namespace App\Modules\AccessControl\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\AccessControl\Http\Resources\RolResource;
use App\Modules\AccessControl\Infrastructure\Persistence\Models\Rol;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class RolController extends Controller
{
    public function index(): JsonResponse
    {
        $roles = Rol::query()->orderBy('id')->get();

        return response()->json([
            'success' => true,
            'message' => 'Roles obtenidos correctamente.',
            'data' => RolResource::collection($roles)->resolve(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request, isUpdate: false);

        $rol = Rol::create([
            'codigo' => $data['codigo'],
            'nombre' => $data['nombre'],
            'descripcion' => $data['descripcion'] ?? '',
            'permisos' => $data['permisos'],
            'protegido' => $data['protegido'] ?? false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Rol creado correctamente.',
            'data' => (new RolResource($rol))->resolve(),
        ], 201);
    }

    public function update(Request $request, Rol $rol): JsonResponse
    {
        $data = $this->validated($request, isUpdate: true, rolId: $rol->id);

        $rol->update([
            'nombre' => $data['nombre'],
            'descripcion' => $data['descripcion'] ?? '',
            'permisos' => $data['permisos'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Rol actualizado correctamente.',
            'data' => (new RolResource($rol))->resolve(),
        ]);
    }

    public function destroy(Rol $rol): JsonResponse
    {
        if ($rol->protegido) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar un rol protegido.',
            ], 422);
        }

        $rol->delete();

        return response()->json(['success' => true, 'message' => 'Rol eliminado correctamente.']);
    }

    private function validated(Request $request, bool $isUpdate, ?int $rolId = null): array
    {
        return $request->validate([
            'codigo' => [$isUpdate ? 'sometimes' : 'required', 'string', 'max:100', 'unique:roles,codigo' . ($isUpdate ? ",{$rolId}" : '')],
            'nombre' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string'],
            'permisos' => ['required', 'array'],
            'protegido' => ['sometimes', 'boolean'],
        ]);
    }
}
