<?php

use App\Modules\Audit\Http\Controllers\AuditLogController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('audit-logs', [AuditLogController::class, 'index']);
    Route::post('audit-logs', [AuditLogController::class, 'store']);
    Route::post('audit-logs/import', [AuditLogController::class, 'import']);
    Route::delete('audit-logs', [AuditLogController::class, 'destroy']);
});
