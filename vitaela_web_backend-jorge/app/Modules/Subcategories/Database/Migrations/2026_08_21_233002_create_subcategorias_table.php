<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subcategorias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('categoria_id')->constrained('categorias')->restrictOnDelete();
            $table->string('nombre');
            $table->boolean('activo')->default(true);
            $table->timestamps();

            $table->unique(['categoria_id', 'nombre']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subcategorias');
    }
};
