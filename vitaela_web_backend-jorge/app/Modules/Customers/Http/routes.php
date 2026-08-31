<?php

use App\Modules\Customers\Http\Controllers\ClienteController;
use Illuminate\Support\Facades\Route;

Route::post('clientes', [ClienteController::class, 'store']);
Route::post('clientes/registro', [ClienteController::class, 'register']);
Route::post('clientes/login', [ClienteController::class, 'login']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('cliente/cuenta', [ClienteController::class, 'cuenta']);
    Route::put('cliente/cuenta', [ClienteController::class, 'updateCuenta']);
    Route::post('cliente/direcciones', [ClienteController::class, 'storeDireccion']);
    Route::put('cliente/direcciones/{direccion}', [ClienteController::class, 'updateDireccion']);
    Route::delete('cliente/direcciones/{direccion}', [ClienteController::class, 'destroyDireccion']);
    Route::post('cliente/metodos-pago', [ClienteController::class, 'storeMetodoPago']);
    Route::put('cliente/metodos-pago/{metodo}', [ClienteController::class, 'updateMetodoPago']);
    Route::delete('cliente/metodos-pago/{metodo}', [ClienteController::class, 'destroyMetodoPago']);
    Route::get('clientes', [ClienteController::class, 'index'])->middleware('permiso:clientes,ver');
    Route::put('clientes/{cliente}', [ClienteController::class, 'update'])->middleware('permiso:clientes,editar');
    Route::delete('clientes/{cliente}', [ClienteController::class, 'destroy'])->middleware('permiso:clientes,eliminar');
});
