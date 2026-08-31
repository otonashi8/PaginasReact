<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('clientes', 'nombre_usuario')) {
            Schema::table('clientes', function (Blueprint $table): void {
                $table->string('nombre_usuario', 50)->nullable()->unique()->after('nombres');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('clientes', 'nombre_usuario')) {
            Schema::table('clientes', function (Blueprint $table): void {
                $table->dropUnique(['nombre_usuario']);
                $table->dropColumn('nombre_usuario');
            });
        }
    }
};