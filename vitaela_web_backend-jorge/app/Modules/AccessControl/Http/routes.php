<?php

use App\Modules\AccessControl\Http\Controllers\AuthController;
use App\Modules\AccessControl\Http\Controllers\RolController;
use App\Modules\AccessControl\Http\Controllers\UsuarioController;
use Illuminate\Support\Facades\Route;

Route::post('login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [AuthController::class, 'me']);

    Route::get('usuarios', [UsuarioController::class, 'index'])->middleware('permiso:usuarios,ver');
    Route::post('usuarios', [UsuarioController::class, 'store'])->middleware('permiso:usuarios,crear');
    Route::put('usuarios/{usuario}', [UsuarioController::class, 'update'])->middleware('permiso:usuarios,editar');
    Route::delete('usuarios/{usuario}', [UsuarioController::class, 'destroy'])->middleware('permiso:usuarios,eliminar');

    Route::get('roles', [RolController::class, 'index'])->middleware('permiso:roles,ver');
    Route::post('roles', [RolController::class, 'store'])->middleware('permiso:roles,crear');
    Route::put('roles/{rol}', [RolController::class, 'update'])->middleware('permiso:roles,editar');
    Route::delete('roles/{rol}', [RolController::class, 'destroy'])->middleware('permiso:roles,eliminar');
});
