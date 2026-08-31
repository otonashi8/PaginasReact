<?php

declare(strict_types=1);

namespace App\Modules\Marketing\Http\Resources;

use App\Modules\Marketing\Infrastructure\Persistence\Models\Popup;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property Popup $resource
 */
final class PopupResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->resource->id,
            'nombre' => $this->resource->nombre,
            'tipoContenido' => $this->resource->tipo_contenido,
            'recursoMedia' => $this->resource->recurso_media ?? '',
            'imagenDesktop' => $this->resource->imagen_desktop ?? '',
            'imagenMobile' => $this->resource->imagen_mobile ?? '',
            'activo' => $this->resource->activo,
            'mostrarEn' => $this->resource->mostrar_en,
            'redireccion' => $this->resource->redireccion,
            'destino' => $this->resource->destino ?? '',
            'frecuencia' => $this->resource->frecuencia,
            'retraso' => $this->resource->retraso,
            'orden' => $this->resource->orden,
        ];
    }
}