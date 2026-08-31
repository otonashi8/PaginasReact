<?php

use App\Modules\Genders\Http\Controllers\GeneroController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('generos', [GeneroController::class, 'index'])->middleware('permiso:generos,ver');
    Route::post('generos', [GeneroController::class, 'store'])->middleware('permiso:generos,crear');
    Route::put('generos/{genero}', [GeneroController::class, 'update'])->middleware('permiso:generos,editar');
    Route::delete('generos/{genero}', [GeneroController::class, 'destroy'])->middleware('permiso:generos,eliminar');
});
