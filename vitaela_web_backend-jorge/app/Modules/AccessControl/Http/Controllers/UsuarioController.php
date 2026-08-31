<?php

declare(strict_types=1);

namespace App\Modules\AccessControl\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\AccessControl\Http\Resources\UsuarioResource;
use App\Modules\AccessControl\Infrastructure\Persistence\Models\Usuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

final class UsuarioController extends Controller
{
    public function index(): JsonResponse
    {
        $usuarios = Usuario::query()->orderByDesc('id')->get();

        return response()->json([
            'success' => true,
            'message' => 'Usuarios obtenidos correctamente.',
            'data' => UsuarioResource::collection($usuarios)->resolve(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request, isUpdate: false);

        $usuario = Usuario::create([
            'nombres' => $data['nombres'],
            'apellidos' => $data['apellidos'],
            'usuario' => $data['usuario'],
            'correo' => $data['correo'],
            'telefono' => $data['telefono'] ?? '',
            'password' => Hash::make($data['contraseña']),
            'rol_id' => $data['rolId'],
            'protegido' => $data['protegido'] ?? false,
            'estado' => $data['estado'] ?? 'activo',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Usuario creado correctamente.',
            'data' => (new UsuarioResource($usuario))->resolve(),
        ], 201);
    }

    public function update(Request $request, Usuario $usuario): JsonResponse
    {
        $data = $this->validated($request, isUpdate: true, usuarioId: $usuario->id);

        $usuario->fill([
            'nombres' => $data['nombres'],
            'apellidos' => $data['apellidos'],
            'usuario' => $data['usuario'],
            'correo' => $data['correo'],
            'telefono' => $data['telefono'] ?? '',
            'rol_id' => $data['rolId'],
            'estado' => $usuario->protegido ? 'activo' : ($data['estado'] ?? $usuario->estado),
        ]);

        if (! empty($data['contraseña'])) {
            $usuario->password = Hash::make($data['contraseña']);
        }

        $usuario->save();

        return response()->json([
            'success' => true,
            'message' => 'Usuario actualizado correctamente.',
            'data' => (new UsuarioResource($usuario))->resolve(),
        ]);
    }

    public function destroy(Usuario $usuario): JsonResponse
    {
        if ($usuario->protegido) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar un usuario protegido.',
            ], 422);
        }

        $usuario->tokens()->delete();
        $usuario->delete();

        return response()->json(['success' => true, 'message' => 'Usuario eliminado correctamente.']);
    }

    private function validated(Request $request, bool $isUpdate, ?int $usuarioId = null): array
    {
        return $request->validate([
            'nombres' => ['required', 'string', 'max:255'],
            'apellidos' => ['required', 'string', 'max:255'],
            'usuario' => ['required', 'string', 'max:255', 'unique:usuarios,usuario' . ($isUpdate ? ",{$usuarioId}" : '')],
            'correo' => ['required', 'email', 'max:255', 'unique:usuarios,correo' . ($isUpdate ? ",{$usuarioId}" : '')],
            'telefono' => ['nullable', 'string', 'max:50'],
            'contraseña' => [$isUpdate ? 'nullable' : 'required', 'string', 'min:4'],
            'rolId' => ['required', 'integer', 'exists:roles,id'],
            'protegido' => ['sometimes', 'boolean'],
            'estado' => ['sometimes', 'in:activo,inactivo,bloqueado'],
        ]);
    }
}
