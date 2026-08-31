<?php

declare(strict_types=1);

use App\Modules\Shipping\Http\Controllers\TarifaEnvioController;
use Illuminate\Support\Facades\Route;

Route::get('tarifas-envio', [TarifaEnvioController::class, 'index']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::post('tarifas-envio', [TarifaEnvioController::class, 'store'])->middleware('permiso:envio,crear');
    Route::put('tarifas-envio/{tarifaEnvio}', [TarifaEnvioController::class, 'update'])->middleware('permiso:envio,editar');
    Route::delete('tarifas-envio/{tarifaEnvio}', [TarifaEnvioController::class, 'destroy'])->middleware('permiso:envio,eliminar');
    Route::put('tarifas-envio-configuracion', [TarifaEnvioController::class, 'replace'])->middleware('permiso:envio,editar');
});
