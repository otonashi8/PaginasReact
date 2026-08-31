<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clientes', function (Blueprint $table): void {
            $table->string('guest_id', 100)->nullable()->unique()->after('tipo');
            $table->index('correo');
        });

        Schema::table('clientes', function (Blueprint $table): void {
            $table->dropUnique(['correo']);
        });
    }

    public function down(): void
    {
        Schema::table('clientes', function (Blueprint $table): void {
            $table->dropUnique(['guest_id']);
            $table->dropIndex(['correo']);
            $table->string('correo')->unique()->change();
            $table->dropColumn('guest_id');
        });
    }
};