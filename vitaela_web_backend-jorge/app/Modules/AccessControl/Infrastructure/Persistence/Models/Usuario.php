<?php

declare(strict_types=1);

namespace App\Modules\AccessControl\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Usuario extends Authenticatable
{
    use HasApiTokens;

    protected $table = 'usuarios';

    protected $fillable = [
        'nombres',
        'apellidos',
        'usuario',
        'correo',
        'telefono',
        'password',
        'rol_id',
        'protegido',
        'estado',
        'ultimo_acceso',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'protegido' => 'boolean',
            'ultimo_acceso' => 'datetime',
        ];
    }

    public function rol(): BelongsTo
    {
        return $this->belongsTo(Rol::class, 'rol_id');
    }
}
