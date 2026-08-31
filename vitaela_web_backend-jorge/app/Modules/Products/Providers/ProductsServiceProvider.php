<?php

namespace App\Modules\Products\Providers;

use Illuminate\Support\ServiceProvider;

final class ProductsServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../Database/Migrations');
    }
}
