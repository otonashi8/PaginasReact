<?php

namespace App\Modules\AccessControl\Providers;

use Illuminate\Support\ServiceProvider;

final class AccessControlServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../Database/Migrations');
    }
}
