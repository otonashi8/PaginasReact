<?php

use App\Modules\Subcategories\Http\Controllers\SubcategoriaController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('subcategorias', [SubcategoriaController::class, 'index'])->middleware('permiso:subcategorias,ver');
    Route::post('subcategorias', [SubcategoriaController::class, 'store'])->middleware('permiso:subcategorias,crear');
    Route::put('subcategorias/{subcategoria}', [SubcategoriaController::class, 'update'])->middleware('permiso:subcategorias,editar');
    Route::delete('subcategorias/{subcategoria}', [SubcategoriaController::class, 'destroy'])->middleware('permiso:subcategorias,eliminar');
});
