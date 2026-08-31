<?php

namespace App\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class ApiRouteServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Route::middleware('api')
            ->prefix('api')
            ->group(function (): void {
                foreach ($this->routeFiles() as $routeFile) {
                    require $routeFile;
                }
            });
    }

    private function routeFiles(): array
    {
        $routeFiles = glob(base_path('app/Modules/*/Http/routes.php')) ?: [];
        sort($routeFiles);

        return $routeFiles;
    }
}
