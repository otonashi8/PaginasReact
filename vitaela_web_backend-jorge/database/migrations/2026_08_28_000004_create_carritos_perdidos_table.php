<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('carritos_perdidos', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('cliente_id')->nullable()->constrained('clientes')->nullOnDelete();
            $table->string('guest_id', 100)->nullable();
            $table->json('productos');
            $table->unsignedInteger('cantidad_items');
            $table->decimal('total', 12, 2);
            $table->string('checkout_name')->nullable();
            $table->string('checkout_email')->nullable();
            $table->string('checkout_phone', 50)->nullable();
            $table->string('coupon_code')->nullable();
            $table->string('estado', 20)->default('pendiente')->index();
            $table->timestamp('fecha_creacion');
            $table->timestamp('ultima_actividad');
            $table->timestamps();

            $table->unique('cliente_id');
            $table->unique('guest_id');
            $table->index(['checkout_email', 'estado']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('carritos_perdidos');
    }
};