<?php

declare(strict_types=1);

namespace App\Modules\SocialNetworks\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\SocialNetworks\Http\Resources\RedResource;
use App\Modules\SocialNetworks\Infrastructure\Persistence\Models\Red;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

final class RedController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Red::query()->where('activo', true)->orderBy('nombre');

        return response()->json([
            'success' => true,
            'data' => RedResource::collection($query->get())->resolve(),
        ]);
    }

    public function adminIndex(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => RedResource::collection(Red::query()->orderBy('nombre')->get())->resolve(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $red = Red::create($this->validated($request));
        $this->applyIcon($red, $request);
        $red->save();
        return response()->json(['success' => true, 'message' => 'Red creada correctamente.', 'data' => (new RedResource($red))->resolve()], 201);
    }

    public function update(Request $request, Red $red): JsonResponse
    {
        $red->update($this->validated($request, false));
        $this->applyIcon($red, $request);
        $red->save();
        return response()->json(['success' => true, 'message' => 'Red actualizada correctamente.', 'data' => (new RedResource($red->refresh()))->resolve()]);
    }

    public function destroy(Red $red): JsonResponse
    {
        if ($red->icon_path) {
            Storage::disk('public')->delete($red->icon_path);
        }
        $red->delete();
        return response()->json(['success' => true, 'message' => 'Red eliminada correctamente.']);
    }

    private function validated(Request $request, bool $creating = true): array
    {
        $rules = [
            'nombre' => ['required', 'string', 'max:80', 'unique:redes,nombre'.($creating ? '' : ','.$request->route('red')->id)],
            'url' => ['required', 'url', 'max:500'],
            'icon_url' => ['nullable', 'url', 'max:500'],
            'icon' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:2048'],
            'activo' => ['sometimes', 'boolean'],
        ];
        $data = $request->validate($rules);
        return ['nombre' => $data['nombre'], 'url' => $data['url'], 'icon_url' => $data['icon_url'] ?? null, 'activo' => $data['activo'] ?? true];
    }

    private function applyIcon(Red $red, Request $request): void
    {
        /** @var UploadedFile|null $file */
        $file = $request->file('icon');
        if ($file) {
            if ($red->icon_path) {
                Storage::disk('public')->delete($red->icon_path);
            }
            $red->icon_path = $file->store('redes', 'public');
            $red->icon_url = null;
        }
    }
}
