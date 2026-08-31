<?php

declare(strict_types=1);

namespace App\Modules\AccountVerification\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;

class EmailVerificationCode extends Model
{
    protected $table = 'email_verification_codes';

    protected $fillable = [
        'email',
        'code_hash',
        'attempts',
        'expires_at',
        'verified_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'verified_at' => 'datetime',
        ];
    }
}
