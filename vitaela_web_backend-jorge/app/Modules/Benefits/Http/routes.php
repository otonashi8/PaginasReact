<?php

use App\Modules\Benefits\Http\Controllers\BeneficioController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('beneficios', [BeneficioController::class, 'index'])->middleware('permiso:beneficios,ver');
    Route::post('beneficios', [BeneficioController::class, 'store'])->middleware('permiso:beneficios,crear');
    Route::put('beneficios/{beneficio}', [BeneficioController::class, 'update'])->middleware('permiso:beneficios,editar');
    Route::delete('beneficios/{beneficio}', [BeneficioController::class, 'destroy'])->middleware('permiso:beneficios,eliminar');
});
