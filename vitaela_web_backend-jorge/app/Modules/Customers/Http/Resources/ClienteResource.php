<?php

declare(strict_types=1);

namespace App\Modules\Customers\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClienteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->tipo,
            'firstName' => $this->nombres,
            'username' => $this->nombre_usuario,
            'email' => $this->correo,
            'phone' => $this->telefono,
            'document' => $this->documento,
            'department' => $this->departamento,
            'province' => $this->provincia,
            'district' => $this->distrito,
            'address' => $this->direccion,
            'status' => $this->estado,
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}
