<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;

final class TarifaEnvio extends Model
{
    protected $table = 'tarifas_envio';

    protected $fillable = [
        'departamento_codigo',
        'departamento_nombre',
        'costo',
        'monto_minimo_envio_gratis',
        'tarifa_general',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'costo' => 'decimal:2',
            'monto_minimo_envio_gratis' => 'decimal:2',
            'tarifa_general' => 'decimal:2',
            'activo' => 'boolean',
        ];
    }
}
