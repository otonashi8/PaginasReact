<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tarifas_envio', function (Blueprint $table): void {
            $table->id();
            $table->string('departamento_codigo', 2)->nullable();
            $table->string('departamento_nombre')->nullable();
            $table->decimal('costo', 10, 2)->nullable();
            $table->decimal('monto_minimo_envio_gratis', 10, 2)->default(0);
            $table->decimal('tarifa_general', 10, 2)->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();

            $table->unique('departamento_codigo');
            $table->index('activo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tarifas_envio');
    }
};
