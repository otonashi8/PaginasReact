<?php

use App\Modules\Marketing\Http\Controllers\BannerController;
use App\Modules\Marketing\Http\Controllers\MarketingSettingController;
use App\Modules\Marketing\Http\Controllers\PopupController;
use Illuminate\Support\Facades\Route;

// Lectura pública: el home de la tienda consume estos endpoints para mostrar
// los banners activos sin que el visitante esté logueado en el panel admin.
Route::get('banners', [BannerController::class, 'index']);
Route::get('banners-config', [MarketingSettingController::class, 'show']);
Route::get('popups', [PopupController::class, 'index']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::post('banners', [BannerController::class, 'store'])->middleware('permiso:marketing,crear');
    Route::put('banners/{banner}', [BannerController::class, 'update'])->middleware('permiso:marketing,editar');
    Route::delete('banners/{banner}', [BannerController::class, 'destroy'])->middleware('permiso:marketing,eliminar');

    Route::post('popups', [PopupController::class, 'store'])->middleware('permiso:marketing,crear');
    Route::put('popups/{popup}', [PopupController::class, 'update'])->middleware('permiso:marketing,editar');
    Route::delete('popups/{popup}', [PopupController::class, 'destroy'])->middleware('permiso:marketing,eliminar');

    Route::put('banners-config', [MarketingSettingController::class, 'update'])->middleware('permiso:marketing,editar');
});
