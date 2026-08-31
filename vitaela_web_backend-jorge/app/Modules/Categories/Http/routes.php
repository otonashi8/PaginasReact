<?php

use App\Modules\Categories\Http\Controllers\CategoriaController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('categorias', [CategoriaController::class, 'index'])->middleware('permiso:categorias,ver');
    Route::post('categorias', [CategoriaController::class, 'store'])->middleware('permiso:categorias,crear');
    Route::put('categorias/{categoria}', [CategoriaController::class, 'update'])->middleware('permiso:categorias,editar');
    Route::delete('categorias/{categoria}', [CategoriaController::class, 'destroy'])->middleware('permiso:categorias,eliminar');
});
