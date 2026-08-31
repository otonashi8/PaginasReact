<?php

declare(strict_types=1);

namespace App\Modules\Benefits\Http\Resources;

use App\Modules\Benefits\Infrastructure\Persistence\Models\Beneficio;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @property Beneficio $resource */
class BeneficioResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'titulo' => $this->resource->titulo,
            'descripcion' => $this->resource->descripcion,
            'activo' => $this->resource->activo,
            'fechaCreacion' => $this->resource->created_at?->toIso8601String() ?? '',
            'fechaActualizacion' => $this->resource->updated_at?->toIso8601String() ?? '',
        ];
    }
}
