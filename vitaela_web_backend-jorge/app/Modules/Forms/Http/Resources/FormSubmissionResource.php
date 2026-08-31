<?php

declare(strict_types=1);

namespace App\Modules\Forms\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FormSubmissionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'formType' => $this->form_type,
            'name' => $this->name,
            'document' => $this->document,
            'email' => $this->email,
            'phone' => $this->phone,
            'orderNumber' => $this->order_number,
            'subject' => $this->subject,
            'caseType' => $this->case_type,
            'message' => $this->message,
            'requestedSolution' => $this->requested_solution,
            'status' => $this->status,
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}
