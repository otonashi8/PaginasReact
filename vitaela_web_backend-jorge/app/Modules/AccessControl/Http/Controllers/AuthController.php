<?php

declare(strict_types=1);

namespace App\Modules\AccessControl\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Customers\Http\Resources\ClienteResource;
use App\Modules\Customers\Infrastructure\Persistence\Models\Cliente;
use App\Modules\AccessControl\Http\Resources\UsuarioResource;
use App\Modules\AccessControl\Infrastructure\Persistence\Models\Usuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

final class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'identifier' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $identifier = mb_strtolower(trim($data['identifier']));

        $usuario = Usuario::query()
            ->whereRaw('lower(usuario) = ?', [$identifier])
            ->orWhereRaw('lower(correo) = ?', [$identifier])
            ->first();

        if (! $usuario || ! Hash::check($data['password'], $usuario->password)) {
            throw ValidationException::withMessages([
                'identifier' => ['Credenciales inválidas.'],
            ]);
        }

        if ($usuario->estado !== 'activo') {
            throw ValidationException::withMessages([
                'identifier' => [$this->mensajeEstado($usuario->estado)],
            ]);
        }

        $usuario->forceFill(['ultimo_acceso' => now()])->save();

        $token = $usuario->createToken('admin')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Sesión iniciada correctamente.',
            'data' => [
                'token' => $token,
                'usuario' => (new UsuarioResource($usuario))->resolve(),
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json(['success' => true, 'message' => 'Sesión cerrada.']);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'message' => 'Usuario autenticado.',
            'data' => $user instanceof Cliente
                ? (new ClienteResource($user))->resolve()
                : (new UsuarioResource($user))->resolve(),
        ]);
    }

    private function mensajeEstado(string $estado): string
    {
        return match ($estado) {
            'bloqueado' => 'Haz sido bloqueado.',
            'inactivo' => 'Tu usuario está inactivo.',
            default => 'Tu usuario está activo.',
        };
    }
}
