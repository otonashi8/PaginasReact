<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pedidos', function (Blueprint $table): void {
            $table->id();
            $table->string('numero_pedido')->unique();
            $table->json('cliente');
            $table->json('direccion');
            $table->json('productos');
            $table->json('descuentos')->nullable();
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('descuento_total', 12, 2)->default(0);
            $table->decimal('costo_envio', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);
            $table->string('metodo_pago', 40);
            $table->string('estado', 30)->index();
            $table->json('historial')->nullable();
            $table->timestamp('fecha_pedido')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pedidos');
    }
};