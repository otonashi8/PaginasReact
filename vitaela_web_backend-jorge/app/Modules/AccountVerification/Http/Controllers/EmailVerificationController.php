<?php

declare(strict_types=1);

namespace App\Modules\AccountVerification\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\AccountVerification\Infrastructure\Persistence\Models\EmailVerificationCode;
use App\Modules\AccountVerification\Mail\RegistrationCodeMail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

final class EmailVerificationController extends Controller
{
    private const MAX_ATTEMPTS = 5;

    public function enviarCodigo(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $email = mb_strtolower(trim($data['email']));

        EmailVerificationCode::query()
            ->where('email', $email)
            ->whereNull('verified_at')
            ->delete();

        $code = (string) random_int(100000, 999999);

        EmailVerificationCode::query()->create([
            'email' => $email,
            'code_hash' => Hash::make($code),
            'attempts' => 0,
            'expires_at' => now()->addMinutes(10),
        ]);

        Mail::to($email)->send(new RegistrationCodeMail($code));

        return response()->json([
            'success' => true,
            'message' => 'Código enviado.',
        ]);
    }

    public function verificarCodigo(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'code' => ['required', 'string'],
        ]);

        $email = mb_strtolower(trim($data['email']));

        $record = EmailVerificationCode::query()
            ->where('email', $email)
            ->whereNull('verified_at')
            ->where('expires_at', '>', now())
            ->latest('id')
            ->first();

        if (! $record) {
            return response()->json([
                'success' => false,
                'message' => 'El código venció o no existe. Solicita uno nuevo.',
            ], 422);
        }

        if ($record->attempts >= self::MAX_ATTEMPTS) {
            return response()->json([
                'success' => false,
                'message' => 'Demasiados intentos. Solicita un código nuevo.',
            ], 422);
        }

        if (! Hash::check($data['code'], $record->code_hash)) {
            $record->increment('attempts');

            return response()->json([
                'success' => false,
                'message' => 'Código incorrecto.',
            ], 422);
        }

        $record->forceFill(['verified_at' => now()])->save();

        return response()->json([
            'success' => true,
            'message' => 'Correo verificado.',
        ]);
    }
}
