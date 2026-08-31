<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('marketing_settings', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('banner_rotation_seconds')->default(5);
            $table->timestamps();
        });

        DB::table('marketing_settings')->insert([
            'banner_rotation_seconds' => 5,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('marketing_settings');
    }
};
