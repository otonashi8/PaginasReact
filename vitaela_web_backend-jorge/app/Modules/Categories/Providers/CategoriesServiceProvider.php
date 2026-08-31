<?php

namespace App\Modules\Categories\Providers;

use Illuminate\Support\ServiceProvider;

final class CategoriesServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../Database/Migrations');
    }
}
