<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trabajos', function (Blueprint $table): void {
            $table->id();
            $table->string('puesto', 120);
            $table->string('nombre', 120);
            $table->text('descripcion_breve');
            $table->string('horario', 120)->nullable();
            $table->string('ubicacion', 180)->nullable();
            $table->json('redirecciones')->nullable();
            $table->string('imagen_url', 500)->nullable();
            $table->string('imagen_path', 500)->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trabajos');
    }
};
