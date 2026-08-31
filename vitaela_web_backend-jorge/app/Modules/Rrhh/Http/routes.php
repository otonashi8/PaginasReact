<?php

use App\Modules\Rrhh\Http\Controllers\TrabajoController;
use Illuminate\Support\Facades\Route;

Route::get('trabajos', [TrabajoController::class, 'index']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('trabajos-admin', [TrabajoController::class, 'adminIndex'])->middleware('permiso:rrhh,ver');
    Route::post('trabajos', [TrabajoController::class, 'store'])->middleware('permiso:rrhh,crear');
    Route::post('trabajos/{trabajo}', [TrabajoController::class, 'update'])->middleware('permiso:rrhh,editar');
    Route::put('trabajos/{trabajo}', [TrabajoController::class, 'update'])->middleware('permiso:rrhh,editar');
    Route::delete('trabajos/{trabajo}', [TrabajoController::class, 'destroy'])->middleware('permiso:rrhh,eliminar');
});
