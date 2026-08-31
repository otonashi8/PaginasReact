<?php

use App\Modules\SocialNetworks\Http\Controllers\RedController;
use Illuminate\Support\Facades\Route;

Route::get('redes', [RedController::class, 'index']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('redes-admin', [RedController::class, 'adminIndex'])->middleware('permiso:redes,ver');
    Route::post('redes', [RedController::class, 'store'])->middleware('permiso:redes,crear');
    Route::post('redes/{red}', [RedController::class, 'update'])->middleware('permiso:redes,editar');
    Route::put('redes/{red}', [RedController::class, 'update'])->middleware('permiso:redes,editar');
    Route::delete('redes/{red}', [RedController::class, 'destroy'])->middleware('permiso:redes,eliminar');
});
