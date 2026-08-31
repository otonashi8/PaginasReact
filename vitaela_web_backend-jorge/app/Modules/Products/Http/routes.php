<?php

use App\Modules\Products\Http\Controllers\ProductoController;
use Illuminate\Support\Facades\Route;

// Lectura pública: tienda y catálogo consumen estos endpoints
Route::get('productos', [ProductoController::class, 'index']);
Route::get('productos/{id}', [ProductoController::class, 'show']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::post('productos', [ProductoController::class, 'store'])->middleware('permiso:productos,crear');
    Route::put('productos/{id}', [ProductoController::class, 'update'])->middleware('permiso:productos,editar');
    Route::delete('productos/{id}', [ProductoController::class, 'destroy'])->middleware('permiso:productos,eliminar');
});
