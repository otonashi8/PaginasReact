<?php

declare(strict_types=1);

namespace App\Modules\PricingRules\Http\Resources;

use App\Modules\PricingRules\Infrastructure\Persistence\Models\ReglaPrecio;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property ReglaPrecio $resource
 */
class ReglaPrecioResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'nombre' => $this->resource->nombre,
            'descripcion' => $this->resource->descripcion ?? '',
            'tipo' => $this->resource->tipo,
            'estado' => $this->resource->estado,
            'prioridad' => $this->resource->prioridad,
            'fechaInicio' => optional($this->resource->fecha_inicio)->format('Y-m-d') ?? '',
            'fechaFin' => optional($this->resource->fecha_fin)->format('Y-m-d') ?? '',
            'requiereCupon' => $this->resource->requiere_cupon,
            'generado' => (float) $this->resource->generado,
            'configuracion' => empty($this->resource->configuracion) ? new \stdClass : $this->resource->configuracion,
            'fechaCreacion' => $this->resource->created_at?->toIso8601String() ?? '',
            'fechaActualizacion' => $this->resource->updated_at?->toIso8601String() ?? '',
        ];
    }
}
