<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Providers;

use Illuminate\Support\ServiceProvider;

final class ShippingServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../Database/Migrations');
    }
}
