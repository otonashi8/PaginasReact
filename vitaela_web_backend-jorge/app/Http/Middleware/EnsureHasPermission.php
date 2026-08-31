<?php

namespace App\Http\Middleware;

use App\Modules\AccessControl\Infrastructure\Persistence\Models\Usuario;
use Closure;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureHasPermission
{
    public function handle(Request $request, Closure $next, string $modulo, string $accion): Response
    {
        /** @var Usuario|null $usuario */
        $usuario = $request->user();

        if (! $usuario) {
            throw new AuthenticationException;
        }

        if ($usuario->protegido) {
            return $next($request);
        }

        $rol = $usuario->rol;
        $permisos = $rol?->permisos ?? [];

        foreach ($permisos as $permiso) {
            if (($permiso['modulo'] ?? null) === $modulo) {
                $acciones = $permiso['acciones'] ?? [];
                if (in_array($accion, $acciones, true)) {
                    return $next($request);
                }
                break;
            }
        }

        throw new AuthorizationException('No tienes permiso para realizar esta acción.');
    }
}
