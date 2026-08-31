<?php

declare(strict_types=1);

namespace App\Modules\AccessControl\Http\Resources;

use App\Modules\AccessControl\Infrastructure\Persistence\Models\Rol;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property Rol $resource
 */
class RolResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'codigo' => $this->resource->codigo,
            'nombre' => $this->resource->nombre,
            'descripcion' => $this->resource->descripcion ?? '',
            'permisos' => $this->resource->permisos ?? [],
            'protegido' => $this->resource->protegido,
            'fechaCreacion' => $this->resource->created_at?->toIso8601String() ?? '',
            'fechaActualizacion' => $this->resource->updated_at?->toIso8601String() ?? '',
        ];
    }
}
