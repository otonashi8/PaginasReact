<?php

declare(strict_types=1);

namespace App\Modules\Marketing\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;

class MarketingSetting extends Model
{
    protected $table = 'marketing_settings';

    protected $fillable = [
        'banner_rotation_seconds',
    ];

    protected function casts(): array
    {
        return [
            'banner_rotation_seconds' => 'integer',
        ];
    }

    public static function current(): self
    {
        return static::query()->firstOrCreate(['id' => 1], ['banner_rotation_seconds' => 5]);
    }
}
