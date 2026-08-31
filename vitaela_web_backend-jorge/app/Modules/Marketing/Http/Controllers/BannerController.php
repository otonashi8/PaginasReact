<?php

declare(strict_types=1);

namespace App\Modules\Marketing\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Marketing\Http\Resources\BannerResource;
use App\Modules\Marketing\Infrastructure\Persistence\Models\Banner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

final class BannerController extends Controller
{
    private const MEDIA_MIMES = 'jpg,jpeg,png,webp,gif,mp4,webm,mov';

    public function index(): JsonResponse
    {
        $banners = Banner::query()->orderBy('orden')->orderBy('nombre')->get();

        return response()->json([
            'success' => true,
            'message' => 'Banners obtenidos correctamente.',
            'data' => BannerResource::collection($banners)->resolve(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $fields = $this->validatedFields($request);

        $banner = new Banner([
            'nombre' => $fields['nombre'],
            'orden' => $fields['orden'] ?? ((int) (Banner::query()->max('orden') ?? -1) + 1),
            'activo' => $fields['activo'] ?? true,
        ]);

        $this->applyMedia($banner, $request, 'desktop');
        $this->applyMedia($banner, $request, 'mobile');
        $this->ensureHasMedia($banner);

        $banner->save();

        return response()->json([
            'success' => true,
            'message' => 'Banner creado correctamente.',
            'data' => (new BannerResource($banner))->resolve(),
        ], 201);
    }

    public function update(Request $request, Banner $banner): JsonResponse
    {
        $fields = $this->validatedFields($request, isUpdate: true);

        if (array_key_exists('nombre', $fields)) {
            $banner->nombre = $fields['nombre'];
        }
        if (array_key_exists('orden', $fields)) {
            $banner->orden = $fields['orden'];
        }
        if (array_key_exists('activo', $fields)) {
            $banner->activo = $fields['activo'];
        }

        $this->applyMedia($banner, $request, 'desktop');
        $this->applyMedia($banner, $request, 'mobile');
        $this->ensureHasMedia($banner);

        $banner->save();

        return response()->json([
            'success' => true,
            'message' => 'Banner actualizado correctamente.',
            'data' => (new BannerResource($banner))->resolve(),
        ]);
    }

    public function destroy(Banner $banner): JsonResponse
    {
        $this->deleteMediaFile($banner->desktop_media_path);
        $this->deleteMediaFile($banner->mobile_media_path);
        $banner->delete();

        return response()->json(['success' => true, 'message' => 'Banner eliminado correctamente.']);
    }

    private function validatedFields(Request $request, bool $isUpdate = false): array
    {
        $validated = $request->validate([
            'nombre' => [$isUpdate ? 'sometimes' : 'required', 'string', 'max:255'],
            'orden' => ['sometimes', 'integer', 'min:0'],
            'activo' => ['sometimes'],
            'desktopMedia' => ['nullable', 'file', 'mimes:' . self::MEDIA_MIMES, 'max:25600'],
            'mobileMedia' => ['nullable', 'file', 'mimes:' . self::MEDIA_MIMES, 'max:25600'],
            'removeDesktopMedia' => ['sometimes'],
            'removeMobileMedia' => ['sometimes'],
        ]);

        $fields = [];
        if (array_key_exists('nombre', $validated)) {
            $fields['nombre'] = $validated['nombre'];
        }
        if ($request->filled('orden')) {
            $fields['orden'] = (int) $validated['orden'];
        }
        if ($request->has('activo')) {
            $fields['activo'] = $request->boolean('activo');
        }

        return $fields;
    }

    private function applyMedia(Banner $banner, Request $request, string $slot): void
    {
        $typeColumn = "{$slot}_media_type";
        $pathColumn = "{$slot}_media_path";
        $fileField = $slot . 'Media';
        $removeField = 'remove' . ucfirst($slot) . 'Media';

        /** @var UploadedFile|null $file */
        $file = $request->file($fileField);

        if ($file) {
            $this->deleteMediaFile($banner->{$pathColumn});

            $mime = (string) $file->getMimeType();
            $banner->{$typeColumn} = str_starts_with($mime, 'video/') ? 'video' : 'imagen';
            $banner->{$pathColumn} = $file->store('banners', 'public');

            return;
        }

        if ($request->boolean($removeField)) {
            $this->deleteMediaFile($banner->{$pathColumn});
            $banner->{$typeColumn} = null;
            $banner->{$pathColumn} = null;
        }
    }

    private function ensureHasMedia(Banner $banner): void
    {
        if (! $banner->desktop_media_path && ! $banner->mobile_media_path) {
            throw ValidationException::withMessages([
                'desktopMedia' => ['Debes tener al menos un archivo para desktop o mobile.'],
            ]);
        }
    }

    private function deleteMediaFile(?string $path): void
    {
        if ($path) {
            Storage::disk('public')->delete($path);
        }
    }
}
