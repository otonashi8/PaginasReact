<?php

declare(strict_types=1);

namespace App\Modules\Forms\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;

class FormSubmission extends Model
{
    protected $table = 'form_submissions';

    protected $fillable = [
        'form_type', 'name', 'document', 'email', 'phone', 'order_number',
        'subject', 'case_type', 'message', 'requested_solution', 'status',
    ];
}
