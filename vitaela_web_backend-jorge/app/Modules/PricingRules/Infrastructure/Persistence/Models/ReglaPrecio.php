<?php

declare(strict_types=1);

namespace App\Modules\PricingRules\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;

class ReglaPrecio extends Model
{
    protected $table = 'reglas_precios';

    protected $fillable = [
        'nombre',
        'descripcion',
        'tipo',
        'estado',
        'prioridad',
        'fecha_inicio',
        'fecha_fin',
        'requiere_cupon',
        'generado',
        'configuracion',
    ];

    protected function casts(): array
    {
        return [
            'estado' => 'boolean',
            'requiere_cupon' => 'boolean',
            'generado' => 'decimal:2',
            'configuracion' => 'array',
            'fecha_inicio' => 'date:Y-m-d',
            'fecha_fin' => 'date:Y-m-d',
        ];
    }
}
