<?php

declare(strict_types=1);

namespace App\Modules\Categories\Infrastructure\Persistence\Models;

use App\Modules\Subcategories\Infrastructure\Persistence\Models\Subcategoria;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Categoria extends Model
{
    protected $table = 'categorias';

    protected $fillable = [
        'nombre',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'activo' => 'boolean',
        ];
    }

    public function subcategorias(): HasMany
    {
        return $this->hasMany(Subcategoria::class);
    }
}
