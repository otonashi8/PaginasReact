<?php

declare(strict_types=1);

namespace App\Modules\Rrhh\Http\Resources;

use App\Modules\Rrhh\Infrastructure\Persistence\Models\Trabajo;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/** @property Trabajo $resource */
class TrabajoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $imagenUrl = $this->resource->imagen_url;

        if (! $imagenUrl && $this->resource->imagen_path) {
            $imagenUrl = Storage::disk('public')->url($this->resource->imagen_path);
        }

        return [
            'id' => $this->resource->id,
            'puesto' => $this->resource->puesto,
            'nombre' => $this->resource->nombre,
            'descripcionBreve' => $this->resource->descripcion_breve,
            'horario' => $this->resource->horario,
            'ubicacion' => $this->resource->ubicacion,
            'redirecciones' => $this->resource->redirecciones ?? [],
            'imagenUrl' => $imagenUrl,
            'activo' => $this->resource->activo,
            'fechaCreacion' => $this->resource->created_at?->toIso8601String() ?? '',
            'fechaActualizacion' => $this->resource->updated_at?->toIso8601String() ?? '',
        ];
    }
}
