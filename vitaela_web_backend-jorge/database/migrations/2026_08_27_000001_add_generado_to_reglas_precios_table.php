<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('reglas_precios', 'generado')) {
            Schema::table('reglas_precios', function (Blueprint $table): void {
                $table->decimal('generado', 12, 2)->default(0)->after('requiere_cupon');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('reglas_precios', 'generado')) {
            Schema::table('reglas_precios', function (Blueprint $table): void {
                $table->dropColumn('generado');
            });
        }
    }
};