<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->integer('orden')->default(0);
            $table->boolean('activo')->default(true);
            $table->string('desktop_media_type', 10)->nullable();
            $table->string('desktop_media_path')->nullable();
            $table->string('mobile_media_type', 10)->nullable();
            $table->string('mobile_media_path')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('banners');
    }
};
