<?php

declare(strict_types=1);

namespace App\Modules\Customers\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Customers\Http\Resources\ClienteResource;
use App\Modules\Customers\Infrastructure\Persistence\Models\Cliente;
use App\Modules\Customers\Infrastructure\Persistence\Models\DireccionCliente;
use App\Modules\Customers\Infrastructure\Persistence\Models\MetodoPagoCliente;
use App\Modules\Orders\Infrastructure\Persistence\Models\CarritoPerdido;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

final class ClienteController extends Controller
{
    public function cuenta(Request $request): JsonResponse
    {
        $cliente = $this->clienteAutenticado($request);

        return response()->json(['success' => true, 'data' => [
            'cliente' => (new ClienteResource($cliente))->resolve(),
            'direcciones' => $cliente->direcciones()->latest()->get(),
            'metodosPago' => $cliente->metodosPago()->latest()->get()->map(static fn (MetodoPagoCliente $metodo): array => [
                'id' => $metodo->id,
                'type' => $metodo->tipo,
                'ownerName' => $metodo->nombre_propietario,
                'cardNumber' => $metodo->tipo === 'tarjeta' ? $metodo->numero : null,
                'last4' => $metodo->tipo === 'tarjeta' ? substr((string) $metodo->numero, -4) : null,
                'yapeNumber' => $metodo->yape_numero,
            ]),
        ]]);
    }

    public function updateCuenta(Request $request): JsonResponse
    {
        $cliente = $this->clienteAutenticado($request);
        $data = $request->validate([
            'username' => ['sometimes', 'required', 'string', 'min:3', 'max:50', 'alpha_dash', 'unique:clientes,nombre_usuario,' . $cliente->id],
            'email' => ['sometimes', 'required', 'email', 'max:255', 'unique:clientes,correo,' . $cliente->id],
            'phone' => ['nullable', 'string', 'max:50'],
            'document' => ['nullable', 'string', 'max:50'],
            'password' => ['nullable', 'string', 'min:8'],
        ]);
        $cliente->fill(array_filter([
            'nombre_usuario' => isset($data['username']) ? mb_strtolower(trim($data['username'])) : null,
            'correo' => isset($data['email']) ? mb_strtolower(trim($data['email'])) : null,
            'telefono' => $data['phone'] ?? null,
            'documento' => $data['document'] ?? null,
            'password' => $data['password'] ?? null,
        ], static fn ($value) => $value !== null));
        $cliente->save();

        return response()->json(['success' => true, 'data' => (new ClienteResource($cliente))->resolve()]);
    }

    public function storeDireccion(Request $request): JsonResponse
    {
        $cliente = $this->clienteAutenticado($request);
        $data = $request->validate([
            'name' => ['nullable', 'string', 'max:100'],
            'department' => ['required', 'string', 'max:100'], 'province' => ['required', 'string', 'max:100'],
            'district' => ['required', 'string', 'max:100'], 'address' => ['required', 'string', 'max:500'],
            'postalCode' => ['nullable', 'string', 'max:20'], 'reference' => ['required', 'string', 'max:255'],
        ]);
        $direccion = $cliente->direcciones()->create([
            'nombre' => $data['name'] ?? null,
            'departamento' => $data['department'], 'provincia' => $data['province'], 'distrito' => $data['district'],
            'direccion' => $data['address'], 'codigo_postal' => $data['postalCode'] ?? null, 'referencia' => $data['reference'],
        ]);
        return response()->json(['success' => true, 'data' => $direccion], 201);
    }

    public function storeMetodoPago(Request $request): JsonResponse
    {
        $cliente = $this->clienteAutenticado($request);
        $data = $request->validate([
            'type' => ['required', 'in:tarjeta,yape'],
            'ownerName' => ['required_if:type,tarjeta', 'nullable', 'string', 'max:255'],
            'cardNumber' => ['required_if:type,tarjeta', 'nullable', 'string', 'max:30'],
            'yapeNumber' => ['required_if:type,yape', 'nullable', 'string', 'max:30'],
        ]);
        $metodo = $cliente->metodosPago()->create([
            'tipo' => $data['type'], 'nombre_propietario' => $data['ownerName'] ?? null,
            'numero' => $data['cardNumber'] ?? null, 'yape_numero' => $data['yapeNumber'] ?? null,
        ]);
        return response()->json(['success' => true, 'data' => $metodo->makeHidden('numero')], 201);
    }

    public function updateDireccion(Request $request, DireccionCliente $direccion): JsonResponse
    {
        $cliente = $this->clienteAutenticado($request);
        abort_unless($direccion->cliente_id === $cliente->id, 404);
        $data = $request->validate([
            'name' => ['nullable', 'string', 'max:100'],
            'department' => ['required', 'string', 'max:100'], 'province' => ['required', 'string', 'max:100'],
            'district' => ['required', 'string', 'max:100'], 'address' => ['required', 'string', 'max:500'],
            'postalCode' => ['nullable', 'string', 'max:20'], 'reference' => ['required', 'string', 'max:255'],
        ]);
        $direccion->update([
            'nombre' => $data['name'] ?? null, 'departamento' => $data['department'], 'provincia' => $data['province'],
            'distrito' => $data['district'], 'direccion' => $data['address'], 'codigo_postal' => $data['postalCode'] ?? null,
            'referencia' => $data['reference'],
        ]);
        return response()->json(['success' => true, 'data' => $direccion]);
    }

    public function updateMetodoPago(Request $request, MetodoPagoCliente $metodo): JsonResponse
    {
        $cliente = $this->clienteAutenticado($request);
        abort_unless($metodo->cliente_id === $cliente->id, 404);
        $data = $request->validate([
            'type' => ['required', 'in:tarjeta,yape'],
            'ownerName' => ['required_if:type,tarjeta', 'nullable', 'string', 'max:255'],
            'cardNumber' => ['nullable', 'string', 'max:30'],
            'yapeNumber' => ['required_if:type,yape', 'nullable', 'string', 'max:30'],
        ]);
        $metodo->fill([
            'tipo' => $data['type'], 'nombre_propietario' => $data['ownerName'] ?? null,
            'yape_numero' => $data['yapeNumber'] ?? null,
        ]);
        if (($data['type'] === 'yape') || filled($data['cardNumber'] ?? null)) {
            $metodo->numero = $data['type'] === 'tarjeta' ? ($data['cardNumber'] ?? null) : null;
        }
        $metodo->save();
        return response()->json(['success' => true, 'data' => [
            'id' => $metodo->id, 'type' => $metodo->tipo, 'ownerName' => $metodo->nombre_propietario,
            'cardNumber' => $metodo->tipo === 'tarjeta' ? $metodo->numero : null,
            'last4' => $metodo->tipo === 'tarjeta' ? substr((string) $metodo->numero, -4) : null,
            'yapeNumber' => $metodo->yape_numero,
        ]]);
    }

    public function destroyMetodoPago(Request $request, MetodoPagoCliente $metodo): JsonResponse
    {
        $cliente = $this->clienteAutenticado($request);
        abort_unless($metodo->cliente_id === $cliente->id, 404);
        $metodo->delete();
        return response()->json(['success' => true, 'message' => 'Método de pago eliminado correctamente.']);
    }

    public function destroyDireccion(Request $request, DireccionCliente $direccion): JsonResponse
    {
        $cliente = $this->clienteAutenticado($request);
        abort_unless($direccion->cliente_id === $cliente->id, 404);
        $direccion->delete();

        return response()->json(['success' => true, 'message' => 'Dirección eliminada correctamente.']);
    }

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'username' => ['required', 'string', 'min:3', 'max:50', 'alpha_dash', 'unique:clientes,nombre_usuario'],
            'email' => ['required', 'email', 'max:255', 'unique:clientes,correo'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $cliente = Cliente::query()->create([
            'tipo' => 'registrado',
            'nombres' => null,
            'nombre_usuario' => mb_strtolower(trim($data['username'])),
            'correo' => mb_strtolower(trim($data['email'])),
            'password' => $data['password'],
            'estado' => 'activo',
        ]);

        return $this->authenticatedResponse($cliente, 'Cuenta creada correctamente.', 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $cliente = Cliente::query()
            ->whereRaw('lower(nombre_usuario) = ?', [mb_strtolower(trim($data['username']))])
            ->where('tipo', 'registrado')
            ->first();

        if (! $cliente || ! $cliente->password || ! Hash::check($data['password'], $cliente->password)) {
            throw ValidationException::withMessages(['username' => ['Credenciales inválidas.']]);
        }

        if ($cliente->estado !== 'activo') {
            throw ValidationException::withMessages(['username' => ['Tu cuenta no está activa.']]);
        }

        return $this->authenticatedResponse($cliente, 'Sesión iniciada correctamente.');
    }

    public function index(): JsonResponse
    {
        return response()->json(['success' => true, 'data' => ClienteResource::collection(Cliente::query()->latest()->get())->resolve()]);
    }

    public function store(Request $request): JsonResponse
    {
        $clienteAutenticado = auth('sanctum')->user();
        if ($clienteAutenticado instanceof Cliente) {
            return response()->json(['success' => true, 'data' => (new ClienteResource($clienteAutenticado))->resolve()]);
        }

        $data = $this->validated($request);
        $cliente = Cliente::query()->updateOrCreate(
            ['guest_id' => $data['guestId']],
            $this->toDatabaseData($data),
        );
        $this->syncGuestCart($cliente);

        return response()->json(['success' => true, 'data' => (new ClienteResource($cliente))->resolve()], 201);
    }

    public function update(Request $request, Cliente $cliente): JsonResponse
    {
        $cliente->update($this->toDatabaseData($this->validated($request, $cliente->id)));

        return response()->json(['success' => true, 'data' => (new ClienteResource($cliente))->resolve()]);
    }

    public function destroy(Cliente $cliente): JsonResponse
    {
        $cliente->delete();
        return response()->json(['success' => true, 'message' => 'Cliente eliminado correctamente.']);
    }

    private function validated(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'type' => ['sometimes', 'in:registrado,guest'],
            'guestId' => ['required', 'string', 'max:100'],
            'firstName' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:clientes,correo' . ($ignoreId ? ",{$ignoreId}" : '')],
            'phone' => ['nullable', 'string', 'max:50'],
            'document' => ['nullable', 'string', 'max:50'],
            'department' => ['nullable', 'string', 'max:100'],
            'province' => ['nullable', 'string', 'max:100'],
            'district' => ['nullable', 'string', 'max:100'],
            'address' => ['nullable', 'string', 'max:500'],
            'status' => ['sometimes', 'in:activo,inactivo,suspendido'],
        ]);
    }

    private function toDatabaseData(array $data): array
    {
        return [
            'tipo' => 'guest',
            'guest_id' => $data['guestId'],
            'nombres' => $data['firstName'],
            'correo' => $data['email'],
            'telefono' => $data['phone'] ?? null,
            'documento' => $data['document'] ?? null,
            'departamento' => $data['department'] ?? null,
            'provincia' => $data['province'] ?? null,
            'distrito' => $data['district'] ?? null,
            'direccion' => $data['address'] ?? null,
            'estado' => $data['status'] ?? 'activo',
        ];
    }

    private function syncGuestCart(Cliente $cliente): void
    {
        CarritoPerdido::query()
            ->where('guest_id', $cliente->guest_id)
            ->update([
                'checkout_name' => $cliente->nombres,
                'checkout_email' => $cliente->correo,
                'checkout_phone' => $cliente->telefono,
            ]);
    }

    private function authenticatedResponse(Cliente $cliente, string $message, int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => [
                'token' => $cliente->createToken('cliente')->plainTextToken,
                'cliente' => (new ClienteResource($cliente))->resolve(),
            ],
        ], $status);
    }

    private function clienteAutenticado(Request $request): Cliente
    {
        $cliente = $request->user();
        abort_unless($cliente instanceof Cliente, 403, 'Esta acción requiere una cuenta de cliente.');
        return $cliente;
    }
}
