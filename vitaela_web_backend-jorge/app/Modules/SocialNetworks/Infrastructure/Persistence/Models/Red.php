<?php

declare(strict_types=1);

namespace App\Modules\SocialNetworks\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;

class Red extends Model
{
    protected $table = 'redes';

    protected $fillable = ['nombre', 'url', 'icon_url', 'icon_path', 'activo'];

    protected function casts(): array
    {
        return ['activo' => 'boolean'];
    }
}
