<?php

namespace App\Modules\Subcategories\Providers;

use Illuminate\Support\ServiceProvider;

final class SubcategoriesServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../Database/Migrations');
    }
}
