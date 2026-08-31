<?php

declare(strict_types=1);

namespace App\Modules\Characteristics\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;

class Caracteristica extends Model
{
    protected $table = 'caracteristicas';

    protected $fillable = [
        'id',
        'titulo',
        'descripcion',
        'activo',
    ];

    protected function casts(): array
    {
        return ['activo' => 'boolean'];
    }
}
