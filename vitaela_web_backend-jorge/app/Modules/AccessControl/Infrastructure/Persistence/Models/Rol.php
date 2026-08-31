<?php

declare(strict_types=1);

namespace App\Modules\AccessControl\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;

class Rol extends Model
{
    protected $table = 'roles';

    protected $fillable = [
        'codigo',
        'nombre',
        'descripcion',
        'permisos',
        'protegido',
    ];

    protected function casts(): array
    {
        return [
            'permisos' => 'array',
            'protegido' => 'boolean',
        ];
    }
}
