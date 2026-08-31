<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('redes', function (Blueprint $table): void {
            $table->string('icon_path', 500)->nullable()->after('icon_url');
        });
    }

    public function down(): void
    {
        Schema::table('redes', function (Blueprint $table): void {
            $table->dropColumn('icon_path');
        });
    }
};
