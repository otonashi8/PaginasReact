<?php

declare(strict_types=1);

namespace App\Modules\Marketing\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;

class Popup extends Model
{
    protected $table = 'popups';

    protected $fillable = [
        'nombre',
        'tipo_contenido',
        'recurso_media',
        'imagen_desktop',
        'imagen_mobile',
        'activo',
        'mostrar_en',
        'redireccion',
        'destino',
        'frecuencia',
        'retraso',
        'orden',
    ];

    protected function casts(): array
    {
        return [
            'activo' => 'boolean',
            'redireccion' => 'boolean',
            'retraso' => 'integer',
            'orden' => 'integer',
        ];
    }
}
