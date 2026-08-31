<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reglas_precios', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->text('descripcion')->nullable();
            $table->string('tipo');
            $table->boolean('estado')->default(true);
            $table->integer('prioridad')->default(1);
            $table->date('fecha_inicio')->nullable();
            $table->date('fecha_fin')->nullable();
            $table->boolean('requiere_cupon')->default(false);
            $table->decimal('generado', 12, 2)->default(0);
            $table->json('configuracion')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reglas_precios');
    }
};
