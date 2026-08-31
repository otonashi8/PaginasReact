<?php

declare(strict_types=1);

namespace App\Modules\Audit\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;

final class AuditLog extends Model
{
    protected $table = 'audit_logs';

    protected $fillable = [
        'usuario_id', 'usuario', 'rol', 'modulo', 'submodulo', 'accion',
        'mensaje_corto', 'objeto_afectado', 'direccion_ip', 'agente_usuario',
        'metadatos', 'fecha',
    ];

    protected function casts(): array
    {
        return [
            'metadatos' => 'array',
            'fecha' => 'datetime',
        ];
    }
}
