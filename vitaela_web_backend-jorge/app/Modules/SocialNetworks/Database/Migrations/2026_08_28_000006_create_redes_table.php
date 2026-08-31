<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('redes', function (Blueprint $table): void {
            $table->id();
            $table->string('nombre', 80)->unique();
            $table->string('url', 500);
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        $now = now();
        DB::table('redes')->insert([
            ['nombre' => 'Instagram', 'url' => 'https://instagram.com/vitaella.pe', 'activo' => true, 'created_at' => $now, 'updated_at' => $now],
            ['nombre' => 'Facebook', 'url' => 'https://facebook.com/vitaella.pe', 'activo' => true, 'created_at' => $now, 'updated_at' => $now],
            ['nombre' => 'TikTok', 'url' => 'https://tiktok.com/@vitaella.pe', 'activo' => true, 'created_at' => $now, 'updated_at' => $now],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('redes');
    }
};
