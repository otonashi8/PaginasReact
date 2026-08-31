<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Modules\AccessControl\Infrastructure\Persistence\Models\Rol;
use App\Modules\AccessControl\Infrastructure\Persistence\Models\Usuario;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AccessControlSeeder extends Seeder
{
    private const MODULOS = [
        'estadísticas', 'productos', 'categorias', 'generos', 'subcategorias', 'reglas', 'pedidos', 'ventas', 'clientes',
        'usuarios', 'roles', 'configuracion', 'envio', 'logs', 'planes', 'marketing', 'redes', 'rrhh',
    ];

    private const ACCIONES = ['ver', 'crear', 'editar', 'eliminar', 'exportar'];

    public function run(): void
    {
        $rolAdmin = Rol::query()->updateOrCreate(
            ['codigo' => 'ADMIN'],
            [
                'nombre' => 'Administrador',
                'descripcion' => 'Acceso completo al sistema.',
                'permisos' => array_map(
                    fn (string $modulo) => ['modulo' => $modulo, 'acciones' => self::ACCIONES],
                    self::MODULOS
                ),
                'protegido' => true,
            ]
        );

        Usuario::query()->updateOrCreate(
            ['usuario' => 'admin'],
            [
                'nombres' => 'Administrador',
                'apellidos' => 'Sistema',
                'correo' => 'admin@empresa.com',
                'telefono' => '',
                'password' => Hash::make('admin123'),
                'rol_id' => $rolAdmin->id,
                'protegido' => true,
                'estado' => 'activo',
            ]
        );
    }
}
