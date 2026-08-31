<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('form_submissions', function (Blueprint $table): void {
            $table->id();
            $table->string('form_type', 30)->index();
            $table->string('name');
            $table->string('document', 50)->nullable();
            $table->string('email');
            $table->string('phone', 50)->nullable();
            $table->string('order_number', 100)->nullable();
            $table->string('subject')->nullable();
            $table->string('case_type', 30)->nullable();
            $table->text('message');
            $table->text('requested_solution')->nullable();
            $table->string('status', 30)->default('Pendiente')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('form_submissions');
    }
};
