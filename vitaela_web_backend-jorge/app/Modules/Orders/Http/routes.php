<?php

use App\Modules\Orders\Http\Controllers\PedidoController;
use App\Modules\Orders\Http\Controllers\CarritoPerdidoController;
use Illuminate\Support\Facades\Route;

Route::get('pedidos', [PedidoController::class, 'index']);
Route::post('pedidos', [PedidoController::class, 'store']);
Route::post('carritos-perdidos', [CarritoPerdidoController::class, 'store']);

Route::middleware(['auth:sanctum', 'permiso:ventas,ver'])->group(function (): void {
	Route::get('carritos-perdidos', [CarritoPerdidoController::class, 'index']);
});