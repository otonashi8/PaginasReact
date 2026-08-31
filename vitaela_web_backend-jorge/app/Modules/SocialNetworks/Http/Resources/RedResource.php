<?php

declare(strict_types=1);

namespace App\Modules\SocialNetworks\Http\Resources;

use App\Modules\SocialNetworks\Infrastructure\Persistence\Models\Red;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/** @property Red $resource */
class RedResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'nombre' => $this->resource->nombre,
            'url' => $this->resource->url,
            'iconUrl' => $this->resource->icon_url
                ?: ($this->resource->icon_path ? Storage::disk('public')->url($this->resource->icon_path) : null),
            'activo' => $this->resource->activo,
            'fechaCreacion' => $this->resource->created_at?->toIso8601String() ?? '',
            'fechaActualizacion' => $this->resource->updated_at?->toIso8601String() ?? '',
        ];
    }
}
