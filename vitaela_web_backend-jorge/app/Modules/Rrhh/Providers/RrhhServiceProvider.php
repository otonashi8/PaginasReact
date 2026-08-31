<?php

declare(strict_types=1);

namespace App\Modules\Rrhh\Providers;

use Illuminate\Support\ServiceProvider;

final class RrhhServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../Database/Migrations');
    }
}
