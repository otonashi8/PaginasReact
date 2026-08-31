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
            $table->string('icon_url', 500)->nullable()->after('url');
        });
    }

    public function down(): void
    {
        Schema::table('redes', function (Blueprint $table): void {
            $table->dropColumn('icon_url');
        });
    }
};
