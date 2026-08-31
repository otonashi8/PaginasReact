<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('productos', function (Blueprint $table): void {
            $table->id();
            $table->string('slug')->unique();
            $table->string('nombre');
            $table->text('descripcion')->nullable();
            $table->text('long_description')->nullable();
            $table->string('categoria')->nullable();
            $table->string('subcategoria')->nullable();
            $table->decimal('precio', 10, 2)->default(0);
            $table->decimal('precio_anterior', 10, 2)->default(0);
            $table->text('imagen')->nullable();
            $table->integer('stock')->default(0);
            $table->boolean('destacado')->default(false);
            $table->decimal('rating', 3, 2)->default(5.0);
            $table->integer('reviews')->default(0);
            $table->string('badge')->nullable();
            $table->string('presentacion')->nullable();
            $table->text('modo_de_uso')->nullable();
            $table->json('relacionados')->nullable();
            $table->json('caracteristica_ids')->nullable();
            $table->json('beneficio_ids')->nullable();
            $table->json('caracteristicas')->nullable();
            $table->json('beneficios')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('productos');
    }
};
