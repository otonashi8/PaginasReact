<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('clientes', 'apellidos')) {
            Schema::table('clientes', function (Blueprint $table): void {
                $table->dropColumn('apellidos');
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasColumn('clientes', 'apellidos')) {
            Schema::table('clientes', function (Blueprint $table): void {
                $table->string('apellidos')->nullable();
            });
        }
    }
};