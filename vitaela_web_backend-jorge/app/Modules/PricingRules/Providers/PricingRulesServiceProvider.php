<?php

namespace App\Modules\PricingRules\Providers;

use Illuminate\Support\ServiceProvider;

final class PricingRulesServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../Database/Migrations');
    }
}
