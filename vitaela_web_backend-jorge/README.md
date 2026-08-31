# VitaElla Web Backend

Backend API de VitaElla construido con PHP y Laravel 13.

La aplicación usa una arquitectura modular en `app/Modules`. Cada módulo agrupa
sus rutas, controladores, recursos, migraciones, modelos de persistencia y
proveedor de servicios. Las rutas de los módulos se registran automáticamente
con el prefijo `/api` mediante `ApiRouteServiceProvider`.

## Desarrollo

```bash
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```
