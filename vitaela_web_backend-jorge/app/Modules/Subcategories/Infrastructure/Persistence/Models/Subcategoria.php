<?php

declare(strict_types=1);

namespace App\Modules\Subcategories\Infrastructure\Persistence\Models;

use App\Modules\Categories\Infrastructure\Persistence\Models\Categoria;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subcategoria extends Model
{
    protected $table = 'subcategorias';

    protected $fillable = [
        'categoria_id',
        'nombre',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'categoria_id' => 'integer',
            'activo' => 'boolean',
        ];
    }

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class);
    }
}
