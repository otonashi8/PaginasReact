<?php

declare(strict_types=1);

namespace App\Modules\Orders\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;

final class Pedido extends Model
{
    protected $table = 'pedidos';

    protected $fillable = [
        'numero_pedido', 'cliente', 'direccion', 'productos', 'descuentos',
        'subtotal', 'descuento_total', 'costo_envio', 'total', 'metodo_pago',
        'estado', 'historial', 'fecha_pedido',
    ];

    protected function casts(): array
    {
        return [
            'cliente' => 'array', 'direccion' => 'array', 'productos' => 'array',
            'descuentos' => 'array', 'historial' => 'array',
            'subtotal' => 'decimal:2', 'descuento_total' => 'decimal:2',
            'costo_envio' => 'decimal:2', 'total' => 'decimal:2',
            'fecha_pedido' => 'datetime',
        ];
    }
}