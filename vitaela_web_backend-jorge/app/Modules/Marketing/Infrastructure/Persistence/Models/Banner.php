<?php

declare(strict_types=1);

namespace App\Modules\Marketing\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    protected $table = 'banners';

    protected $fillable = [
        'nombre',
        'orden',
        'activo',
        'desktop_media_type',
        'desktop_media_path',
        'mobile_media_type',
        'mobile_media_path',
    ];

    protected function casts(): array
    {
        return [
            'activo' => 'boolean',
            'orden' => 'integer',
        ];
    }
}
