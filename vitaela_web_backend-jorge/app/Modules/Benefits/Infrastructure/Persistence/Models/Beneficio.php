<?php

declare(strict_types=1);

namespace App\Modules\Benefits\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;

class Beneficio extends Model
{
    protected $table = 'beneficios';

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
