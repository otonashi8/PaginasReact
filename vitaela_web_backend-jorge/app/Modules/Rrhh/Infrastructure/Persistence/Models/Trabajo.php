<?php

declare(strict_types=1);

namespace App\Modules\Rrhh\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;

class Trabajo extends Model
{
    protected $table = 'trabajos';

    protected $fillable = [
        'puesto',
        'nombre',
        'descripcion_breve',
        'horario',
        'ubicacion',
        'redirecciones',
        'imagen_url',
        'imagen_path',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'redirecciones' => 'array',
            'activo' => 'boolean',
        ];
    }
}
