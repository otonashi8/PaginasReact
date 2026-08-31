<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clientes', function (Blueprint $table): void {
            $table->id();
            $table->string('tipo', 20)->default('guest')->index();
            $table->string('nombres');
            $table->string('apellidos')->nullable();
            $table->string('correo')->unique();
            $table->string('telefono', 50)->nullable();
            $table->string('documento', 50)->nullable();
            $table->string('departamento', 100)->nullable();
            $table->string('provincia', 100)->nullable();
            $table->string('distrito', 100)->nullable();
            $table->string('direccion', 500)->nullable();
            $table->string('estado', 20)->default('activo')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clientes');
    }
};
