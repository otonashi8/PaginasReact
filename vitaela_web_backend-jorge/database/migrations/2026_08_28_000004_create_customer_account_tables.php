<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('direcciones_clientes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('cliente_id')->constrained('clientes')->cascadeOnDelete();
            $table->string('departamento', 100);
            $table->string('provincia', 100);
            $table->string('distrito', 100);
            $table->string('direccion', 500);
            $table->string('codigo_postal', 20)->nullable();
            $table->string('referencia', 255);
            $table->timestamps();
        });

        Schema::create('metodos_pago_clientes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('cliente_id')->constrained('clientes')->cascadeOnDelete();
            $table->string('tipo', 20);
            $table->string('nombre_propietario')->nullable();
            $table->text('numero')->nullable();
            $table->string('yape_numero', 30)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('metodos_pago_clientes');
        Schema::dropIfExists('direcciones_clientes');
    }
};