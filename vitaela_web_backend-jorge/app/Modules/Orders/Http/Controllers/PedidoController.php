<?php

declare(strict_types=1);

namespace App\Modules\Orders\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Orders\Infrastructure\Persistence\Models\Pedido;
use App\Modules\PricingRules\Infrastructure\Persistence\Models\ReglaPrecio;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class PedidoController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Pedidos obtenidos correctamente.',
            'data' => Pedido::query()->latest('fecha_pedido')->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'numeroPedido' => ['required', 'string', 'max:100'],
            'cliente' => ['required', 'array'],
            'direccion' => ['required', 'array'],
            'productos' => ['required', 'array', 'min:1'],
            'descuentos' => ['nullable', 'array'],
            'subtotal' => ['required', 'numeric', 'min:0'],
            'descuentoTotal' => ['nullable', 'numeric', 'min:0'],
            'costoEnvio' => ['nullable', 'numeric', 'min:0'],
            'total' => ['required', 'numeric', 'min:0'],
            'metodoPago' => ['required', 'string', 'max:40'],
            'estado' => ['required', 'string', 'max:30'],
            'historial' => ['nullable', 'array'],
            'fechaPedido' => ['required', 'date'],
        ]);

        $pedido = Pedido::create([
            'numero_pedido' => $data['numeroPedido'], 'cliente' => $data['cliente'],
            'direccion' => $data['direccion'], 'productos' => $data['productos'],
            'descuentos' => $data['descuentos'] ?? [], 'subtotal' => $data['subtotal'],
            'descuento_total' => $data['descuentoTotal'] ?? 0, 'costo_envio' => $data['costoEnvio'] ?? 0,
            'total' => $data['total'], 'metodo_pago' => $data['metodoPago'],
            'estado' => $data['estado'], 'historial' => $data['historial'] ?? [],
            'fecha_pedido' => $data['fechaPedido'],
        ]);

        foreach ($pedido->descuentos ?? [] as $descuento) {
            $reglaId = (int) ($descuento['reglaId'] ?? 0);
            if ($reglaId > 0) {
                ReglaPrecio::query()->whereKey($reglaId)->increment(
                    'generado',
                    (float) ($descuento['generado'] ?? $pedido->subtotal),
                );
            }
        }

        return response()->json(['success' => true, 'message' => 'Pedido guardado correctamente.', 'data' => $pedido], 201);
    }
}