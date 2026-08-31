<?php

declare(strict_types=1);

namespace App\Modules\AccessControl\Http\Resources;

use App\Modules\AccessControl\Infrastructure\Persistence\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property Usuario $resource
 */
class UsuarioResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'nombres' => $this->resource->nombres,
            'apellidos' => $this->resource->apellidos,
            'usuario' => $this->resource->usuario,
            'correo' => $this->resource->correo,
            'telefono' => $this->resource->telefono ?? '',
            'contraseña' => '',
            'rolId' => $this->resource->rol_id,
            'protegido' => $this->resource->protegido,
            'estado' => $this->resource->estado,
            'ultimoAcceso' => optional($this->resource->ultimo_acceso)->toIso8601String() ?? '',
            'fechaCreacion' => $this->resource->created_at?->toIso8601String() ?? '',
            'fechaActualizacion' => $this->resource->updated_at?->toIso8601String() ?? '',
        ];
    }
}
