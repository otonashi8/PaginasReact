<?php

declare(strict_types=1);

namespace App\Modules\Marketing\Http\Resources;

use App\Modules\Marketing\Infrastructure\Persistence\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * @property Banner $resource
 */
class BannerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'nombre' => $this->resource->nombre,
            'orden' => $this->resource->orden,
            'activo' => $this->resource->activo,
            'desktopMediaType' => $this->resource->desktop_media_type,
            'desktopMediaUrl' => $this->resource->desktop_media_path
                ? Storage::disk('public')->url($this->resource->desktop_media_path)
                : null,
            'mobileMediaType' => $this->resource->mobile_media_type,
            'mobileMediaUrl' => $this->resource->mobile_media_path
                ? Storage::disk('public')->url($this->resource->mobile_media_path)
                : null,
            'fechaCreacion' => $this->resource->created_at?->toIso8601String() ?? '',
            'fechaActualizacion' => $this->resource->updated_at?->toIso8601String() ?? '',
        ];
    }
}
