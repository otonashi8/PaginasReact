<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id();
            $table->string('nombres');
            $table->string('apellidos');
            $table->string('usuario')->unique();
            $table->string('correo')->unique();
            $table->string('telefono')->nullable();
            $table->string('password');
            $table->foreignId('rol_id')->constrained('roles')->restrictOnDelete();
            $table->boolean('protegido')->default(false);
            $table->string('estado')->default('activo');
            $table->timestamp('ultimo_acceso')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usuarios');
    }
};
