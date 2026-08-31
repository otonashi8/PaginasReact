<?php

use App\Modules\Characteristics\Http\Controllers\CaracteristicaController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('caracteristicas', [CaracteristicaController::class, 'index'])->middleware('permiso:caracteristicas,ver');
    Route::post('caracteristicas', [CaracteristicaController::class, 'store'])->middleware('permiso:caracteristicas,crear');
    Route::put('caracteristicas/{caracteristica}', [CaracteristicaController::class, 'update'])->middleware('permiso:caracteristicas,editar');
    Route::delete('caracteristicas/{caracteristica}', [CaracteristicaController::class, 'destroy'])->middleware('permiso:caracteristicas,eliminar');
});
