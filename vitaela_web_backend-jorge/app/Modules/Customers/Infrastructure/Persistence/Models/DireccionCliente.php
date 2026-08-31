<?php

declare(strict_types=1);

namespace App\Modules\Customers\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DireccionCliente extends Model
{
    protected $table = 'direcciones_clientes';

    protected $fillable = ['nombre', 'departamento', 'provincia', 'distrito', 'direccion', 'codigo_postal', 'referencia'];

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }
}