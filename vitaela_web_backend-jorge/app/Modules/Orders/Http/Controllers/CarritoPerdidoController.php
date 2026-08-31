<?php

declare(strict_types=1);

namespace App\Modules\Orders\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Customers\Infrastructure\Persistence\Models\Cliente;
use App\Modules\Orders\Infrastructure\Persistence\Models\CarritoPerdido;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

final class CarritoPerdidoController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => CarritoPerdido::query()->with('cliente')->latest('ultima_actividad')->get()->map(fn (CarritoPerdido $carrito): array => $this->toFrontend($carrito)),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'guestId' => ['nullable', 'string', 'max:100'],
            'productos' => ['required', 'array', 'min:1'],
            'productos.*.productId' => ['required'],
            'productos.*.quantity' => ['required', 'numeric', 'min:1'],
            'cantidadItems' => ['required', 'integer', 'min:1'],
            'total' => ['required', 'numeric', 'min:0'],
            'checkoutName' => ['nullable', 'string', 'max:255'],
            'checkoutEmail' => ['nullable', 'email', 'max:255'],
            'checkoutPhone' => ['nullable', 'string', 'max:50'],
            'couponCode' => ['nullable', 'string', 'max:100'],
        ]);

        $cliente = auth('sanctum')->user();
        $clienteId = $cliente instanceof Cliente ? $cliente->id : null;
        $guestId = $clienteId ? null : ($data['guestId'] ?? null);

        if (! $clienteId && ! $guestId) {
            return response()->json(['success' => false, 'message' => 'Se requiere un identificador de visitante.'], 422);
        }

        $carrito = CarritoPerdido::query()->firstOrNew(
            $clienteId ? ['cliente_id' => $clienteId] : ['guest_id' => $guestId],
        );
        $now = Carbon::now();
        $carrito->fill([
            'cliente_id' => $clienteId,
            'guest_id' => $guestId,
            'productos' => $data['productos'],
            'cantidad_items' => $data['cantidadItems'],
            'total' => $data['total'],
            'checkout_name' => $data['checkoutName'] ?? null,
            'checkout_email' => $data['checkoutEmail'] ?? null,
            'checkout_phone' => $data['checkoutPhone'] ?? null,
            'coupon_code' => $data['couponCode'] ?? null,
            'estado' => $carrito->exists && $carrito->estado === 'recuperado' ? 'pendiente' : ($carrito->estado ?? 'pendiente'),
            'fecha_creacion' => $carrito->fecha_creacion ?? $now,
            'ultima_actividad' => $now,
        ]);
        $carrito->save();
        $carrito->loadMissing('cliente');

        return response()->json(['success' => true, 'data' => $this->toFrontend($carrito)], 201);
    }

    private function toFrontend(CarritoPerdido $carrito): array
    {
        return [
            'id' => (string) $carrito->id,
            'origen' => $carrito->cliente_id ? 'usuario' : 'guest',
            'userId' => $carrito->cliente_id ? (string) $carrito->cliente_id : null,
            'guestId' => $carrito->guest_id,
            'checkoutName' => $carrito->checkout_name,
            'checkoutEmail' => $carrito->checkout_email,
            'checkoutPhone' => $carrito->checkout_phone,
            'customerName' => $carrito->cliente?->nombres ?? $carrito->checkout_name,
            'username' => $carrito->cliente?->nombre_usuario,
            'registeredEmail' => $carrito->cliente?->correo,
            'registeredPhone' => $carrito->cliente?->telefono,
            'couponCode' => $carrito->coupon_code,
            'cantidadItems' => $carrito->cantidad_items,
            'total' => (float) $carrito->total,
            'fecha' => $carrito->fecha_creacion?->toISOString(),
            'ultimaActividad' => $carrito->ultima_actividad?->toISOString(),
            'estado' => $carrito->estado,
            'productos' => $carrito->productos,
        ];
    }
}