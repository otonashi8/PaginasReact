<?php

namespace App\Modules\Genders\Providers;

use Illuminate\Support\ServiceProvider;

final class GendersServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../Database/Migrations');
    }
}
