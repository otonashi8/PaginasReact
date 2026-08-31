<?php

declare(strict_types=1);

namespace App\Modules\AccountVerification\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RegistrationCodeMail extends Mailable
{
    use Queueable;
    use SerializesModels;

    public function __construct(public readonly string $code)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Tu código de verificación · 3X100',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.registration-code',
            with: ['code' => $this->code],
        );
    }
}
