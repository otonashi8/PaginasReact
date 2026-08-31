<?php

namespace App\Modules\Characteristics\Providers;

use Illuminate\Support\ServiceProvider;

final class CharacteristicsServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../Database/Migrations');
    }
}
