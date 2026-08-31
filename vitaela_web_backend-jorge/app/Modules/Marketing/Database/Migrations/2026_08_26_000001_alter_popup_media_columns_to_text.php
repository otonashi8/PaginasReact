<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('popups', function (Blueprint $table): void {
            $table->text('recurso_media')->nullable()->change();
            $table->text('imagen_desktop')->nullable()->change();
            $table->text('imagen_mobile')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('popups', function (Blueprint $table): void {
            $table->string('recurso_media')->nullable()->change();
            $table->string('imagen_desktop')->nullable()->change();
            $table->string('imagen_mobile')->nullable()->change();
        });
    }
};