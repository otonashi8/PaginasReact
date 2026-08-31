<?php

use App\Modules\Forms\Http\Controllers\FormSubmissionController;
use Illuminate\Support\Facades\Route;

Route::post('formularios/contacto', [FormSubmissionController::class, 'storeContacto']);
Route::post('formularios/reclamaciones', [FormSubmissionController::class, 'storeReclamacion']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('formularios', [FormSubmissionController::class, 'index'])->middleware('permiso:clientes,ver');
    Route::patch('formularios/{formSubmission}/estado', [FormSubmissionController::class, 'updateStatus'])->middleware('permiso:clientes,editar');
});
