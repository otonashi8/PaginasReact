<?php

declare(strict_types=1);

namespace App\Modules\SocialNetworks\Providers;

use Illuminate\Support\ServiceProvider;

final class SocialNetworksServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../Database/Migrations');
    }
}
