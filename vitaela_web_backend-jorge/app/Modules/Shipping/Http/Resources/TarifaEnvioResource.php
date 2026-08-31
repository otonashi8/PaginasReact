<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Http\Resources;

use App\Modules\Shipping\Infrastructure\Persistence\Models\TarifaEnvio;
use Illuminate\Http\Resources\Json\JsonResource;

final class TarifaEnvioResource extends JsonResource
{
    public function toArray($request): array
    {
        /** @var TarifaEnvio $tarifa */
        $tarifa = $this->resource;

        return [
            'id' => $tarifa->id,
            'ubicacion' => $tarifa->departamento_nombre,
            'departamentoCodigo' => $tarifa->departamento_codigo,
            'costo' => (float) $tarifa->costo,
            'montoMinimoEnvioGratis' => (float) $tarifa->monto_minimo_envio_gratis,
            'tarifaGeneral' => $tarifa->tarifa_general !== null ? (float) $tarifa->tarifa_general : null,
            'activo' => (bool) $tarifa->activo,
        ];
    }
}
