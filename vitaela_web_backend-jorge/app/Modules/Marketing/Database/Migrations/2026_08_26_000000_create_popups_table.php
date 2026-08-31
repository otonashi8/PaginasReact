<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('popups', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('tipo_contenido', 10)->default('imagen');
            $table->string('recurso_media')->nullable();
            $table->string('imagen_desktop')->nullable();
            $table->string('imagen_mobile')->nullable();
            $table->boolean('activo')->default(true);
            $table->string('mostrar_en');
            $table->boolean('redireccion')->default(false);
            $table->string('destino')->nullable();
            $table->string('frecuencia', 20)->default('cada-vez');
            $table->unsignedInteger('retraso')->default(0);
            $table->integer('orden')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('popups');
    }
};
