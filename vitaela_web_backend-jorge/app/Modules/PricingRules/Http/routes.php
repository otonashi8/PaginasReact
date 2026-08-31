<?php

use App\Modules\PricingRules\Http\Controllers\ReglaPrecioController;
use Illuminate\Support\Facades\Route;

Route::get('reglas-precios', [ReglaPrecioController::class, 'index']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::post('reglas-precios', [ReglaPrecioController::class, 'store'])->middleware('permiso:reglas,crear');
    Route::put('reglas-precios/{regla}', [ReglaPrecioController::class, 'update'])->middleware('permiso:reglas,editar');
    Route::delete('reglas-precios/{regla}', [ReglaPrecioController::class, 'destroy'])->middleware('permiso:reglas,eliminar');
});
