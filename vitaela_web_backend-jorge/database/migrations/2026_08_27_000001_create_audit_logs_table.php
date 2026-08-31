<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('usuario_id')->nullable()->index();
            $table->string('usuario')->nullable();
            $table->string('rol')->nullable();
            $table->string('modulo')->index();
            $table->string('submodulo')->nullable();
            $table->string('accion');
            $table->text('mensaje_corto')->nullable();
            $table->string('objeto_afectado')->nullable();
            $table->string('direccion_ip', 45)->nullable();
            $table->text('agente_usuario')->nullable();
            $table->json('metadatos')->nullable();
            $table->timestamp('fecha')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
