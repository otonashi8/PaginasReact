<?php

declare(strict_types=1);

namespace App\Modules\Genders\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;

class Genero extends Model
{
    protected $table = 'generos';

    protected $fillable = [
        'nombre',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'activo' => 'boolean',
        ];
    }
}
