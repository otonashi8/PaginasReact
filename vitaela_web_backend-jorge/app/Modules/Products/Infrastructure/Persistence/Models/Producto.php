<?php

declare(strict_types=1);

namespace App\Modules\Products\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    protected $table = 'productos';

    protected $fillable = [
        'slug',
        'nombre',
        'descripcion',
        'long_description',
        'categoria',
        'subcategoria',
        'precio',
        'precio_anterior',
        'imagen',
        'stock',
        'destacado',
        'rating',
        'reviews',
        'badge',
        'presentacion',
        'modo_de_uso',
        'relacionados',
        'caracteristica_ids',
        'beneficio_ids',
        'caracteristicas',
        'beneficios',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'precio' => 'decimal:2',
            'precio_anterior' => 'decimal:2',
            'stock' => 'integer',
            'destacado' => 'boolean',
            'rating' => 'decimal:2',
            'reviews' => 'integer',
            'relacionados' => 'array',
            'caracteristica_ids' => 'array',
            'beneficio_ids' => 'array',
            'caracteristicas' => 'array',
            'beneficios' => 'array',
            'activo' => 'boolean',
        ];
    }
}
