<?php

declare(strict_types=1);

namespace App\Modules\Customers\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MetodoPagoCliente extends Model
{
    protected $table = 'metodos_pago_clientes';

    protected $fillable = ['tipo', 'nombre_propietario', 'numero', 'yape_numero'];

    protected function casts(): array
    {
        return ['numero' => 'encrypted'];
    }

    protected $hidden = ['numero'];

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }
}