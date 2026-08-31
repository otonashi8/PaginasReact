<?php

declare(strict_types=1);

namespace App\Modules\Genders\Http\Resources;

use App\Modules\Genders\Infrastructure\Persistence\Models\Genero;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property Genero $resource
 */
class GeneroResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'nombre' => $this->resource->nombre,
            'activo' => $this->resource->activo,
            'fechaCreacion' => $this->resource->created_at?->toIso8601String() ?? '',
            'fechaActualizacion' => $this->resource->updated_at?->toIso8601String() ?? '',
        ];
    }
}
