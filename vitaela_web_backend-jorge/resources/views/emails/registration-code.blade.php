<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Tu código de verificación</title>
</head>
<body style="margin:0;padding:32px 16px;background:#f4f4f5;font-family:Helvetica,Arial,sans-serif;color:#0a0a0a;">
    <table role="presentation" width="100%" style="max-width:440px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e4e4e7;">
        <tr>
            <td style="background:#0a0a0a;padding:30px 28px;text-align:left;">
                <img src="{{ $message->embed(resource_path('mail-assets/logo-3x100.png')) }}" alt="3x100.pe" height="48" style="height:48px;width:auto;display:inline-block;">
            </td>
        </tr>
        <tr>
            <td style="padding:32px 32px 28px;">
                <p style="margin:0 0 20px;font-size:13px;font-weight:700;color:#0a0a0a;">3x100.pe</p>

                <h1 style="margin:0 0 20px;font-size:22px;font-weight:600;color:#0a0a0a;">Verifica tu correo electrónico</h1>

                <p style="margin:0 0 4px;font-size:14px;line-height:1.6;color:#27272a;">Estimado cliente:</p>
                <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#27272a;">
                    Para verificar tu dirección de correo, introduce el código de verificación a continuación. Vence en 10 minutos.
                </p>

                <p style="margin:0 0 6px;font-size:13px;color:#71717a;">Aquí está tu código:</p>
                <p style="margin:0 0 28px;font-size:34px;font-weight:700;letter-spacing:0.08em;color:#ea580c;">
                    {{ $code }}
                </p>

                <p style="margin:0 0 4px;font-size:14px;line-height:1.6;color:#27272a;">Tu equipo de 3x100.pe</p>

                <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#a1a1aa;">
                    Nota: No respondas a este correo electrónico. Si no solicitaste esto, puedes ignorarlo con confianza.
                </p>
            </td>
        </tr>
        <tr>
            <td style="padding:16px 32px;background:#fafafa;border-top:1px solid #e4e4e7;">
                <p style="margin:0;font-size:11px;color:#a1a1aa;">3x100.pe</p>
                <p style="margin:2px 0 0;font-size:11px;color:#a1a1aa;">Copyright © {{ date('Y') }} 3x100.pe. Todos los derechos reservados.</p>
            </td>
        </tr>
    </table>
</body>
</html>
