<?php

declare(strict_types=1);

namespace App\Modules\Orders\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class CarritoPerdido extends Model
{
    protected $table = 'carritos_perdidos';

    protected $fillable = [
        'cliente_id', 'guest_id', 'productos', 'cantidad_items', 'total',
        'checkout_name', 'checkout_email', 'checkout_phone', 'coupon_code',
        'estado', 'fecha_creacion', 'ultima_actividad',
    ];

    protected function casts(): array
    {
        return [
            'productos' => 'array',
            'total' => 'decimal:2',
            'fecha_creacion' => 'datetime',
            'ultima_actividad' => 'datetime',
        ];
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(\App\Modules\Customers\Infrastructure\Persistence\Models\Cliente::class);
    }
}