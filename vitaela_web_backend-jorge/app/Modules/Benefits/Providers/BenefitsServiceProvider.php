<?php

namespace App\Modules\Benefits\Providers;

use Illuminate\Support\ServiceProvider;

final class BenefitsServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../Database/Migrations');
    }
}
