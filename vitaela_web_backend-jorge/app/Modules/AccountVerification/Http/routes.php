<?php

use App\Modules\AccountVerification\Http\Controllers\EmailVerificationController;
use Illuminate\Support\Facades\Route;

Route::post('registro/enviar-codigo', [EmailVerificationController::class, 'enviarCodigo'])->middleware('throttle:5,1');
Route::post('registro/verificar-codigo', [EmailVerificationController::class, 'verificarCodigo'])->middleware('throttle:10,1');
