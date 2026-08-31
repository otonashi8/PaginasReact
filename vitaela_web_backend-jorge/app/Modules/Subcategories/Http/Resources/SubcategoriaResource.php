<?php

declare(strict_types=1);

namespace App\Modules\Subcategories\Http\Resources;

use App\Modules\Subcategories\Infrastructure\Persistence\Models\Subcategoria;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property Subcategoria $resource
 */
class SubcategoriaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'nombre' => $this->resource->nombre,
            'activo' => $this->resource->activo,
            'categoriaId' => $this->resource->categoria_id,
            'categoriaNombre' => $this->resource->categoria?->nombre ?? '',
            'fechaCreacion' => $this->resource->created_at?->toIso8601String() ?? '',
            'fechaActualizacion' => $this->resource->updated_at?->toIso8601String() ?? '',
        ];
    }
}
