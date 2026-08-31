<?php

namespace App\Modules\AccountVerification\Providers;

use Illuminate\Support\ServiceProvider;

final class AccountVerificationServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../Database/Migrations');
    }
}
