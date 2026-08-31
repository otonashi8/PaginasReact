<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('clientes', 'password')) {
            Schema::table('clientes', function (Blueprint $table): void {
                $table->string('password')->nullable()->after('correo');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('clientes', 'password')) {
            Schema::table('clientes', function (Blueprint $table): void {
                $table->dropColumn('password');
            });
        }
    }
};