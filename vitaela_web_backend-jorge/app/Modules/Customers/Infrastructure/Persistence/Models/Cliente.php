<?php

declare(strict_types=1);

namespace App\Modules\Customers\Infrastructure\Persistence\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;

class Cliente extends Authenticatable
{
    use HasApiTokens;

    protected $table = 'clientes';

    protected $fillable = [
        'tipo', 'guest_id', 'nombres', 'nombre_usuario', 'correo', 'password', 'telefono', 'documento',
        'departamento', 'provincia', 'distrito', 'direccion', 'estado',
    ];

    protected $hidden = ['password'];

    protected function casts(): array
    {
        return ['password' => 'hashed'];
    }

    public function direcciones(): HasMany
    {
        return $this->hasMany(DireccionCliente::class);
    }

    public function metodosPago(): HasMany
    {
        return $this->hasMany(MetodoPagoCliente::class);
    }

    public function carritosPerdidos(): HasMany
    {
        return $this->hasMany(\App\Modules\Orders\Infrastructure\Persistence\Models\CarritoPerdido::class);
    }
}
