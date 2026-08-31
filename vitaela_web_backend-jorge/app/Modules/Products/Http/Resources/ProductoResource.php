<?php

declare(strict_types=1);

namespace App\Modules\Products\Http\Resources;

use App\Modules\Products\Infrastructure\Persistence\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class ProductoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->nombre,
            'description' => $this->descripcion ?? '',
            'longDescription' => $this->long_description ?? $this->descripcion ?? '',
            'category' => $this->categoria ?? 'bienestar',
            'subcategory' => $this->subcategoria ?? '',
            'unitPrice' => (float) $this->precio,
            'price' => (float) $this->precio,
            'originalPrice' => $this->precio_anterior > 0 ? (float) $this->precio_anterior : null,
            'previousPrice' => (float) ($this->precio_anterior ?? 0),
            'image' => $this->imagen ?? '',
            'stock' => (int) $this->stock,
            'featured' => (bool) $this->destacado,
            'badge' => $this->badge ?? ($this->destacado ? 'Bestseller' : null),
            'rating' => (float) ($this->rating ?? 5.0),
            'reviews' => (int) ($this->reviews ?? 0),
            'presentation' => $this->presentacion ?? 'Producto Vitaela',
            'modoDeUso' => $this->modo_de_uso ?? '',
            'relatedIds' => $this->relacionados ?? [],
            'characteristicIds' => $this->caracteristica_ids ?? [],
            'benefitIds' => $this->beneficio_ids ?? [],
            'characteristics' => $this->caracteristicas ?? [],
            'benefits' => $this->beneficios ?? [],
            'relatedProducts' => $this->relatedProducts(),
            'active' => (bool) $this->activo,
            'createdAt' => $this->created_at?->toISOString() ?? '',
            'updatedAt' => $this->updated_at?->toISOString() ?? '',
        ];
    }

    private function relatedProducts(): array
    {
        $ids = collect($this->relacionados ?? [])
            ->map(fn (mixed $id): int => (int) $id)
            ->filter(fn (int $id): bool => $id > 0 && $id !== (int) $this->id)
            ->values();

        if ($ids->isEmpty()) {
            return [];
        }

        return Producto::query()
            ->whereIn('id', $ids)
            ->where('activo', true)
            ->get()
            ->map(fn (Producto $producto): array => [
                'id' => $producto->id,
                'slug' => $producto->slug,
                'name' => $producto->nombre,
                'image' => $producto->imagen ?? '',
                'price' => (float) $producto->precio,
            ])
            ->all();
    }
}
