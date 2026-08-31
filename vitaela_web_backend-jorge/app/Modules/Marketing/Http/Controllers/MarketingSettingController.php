<?php

declare(strict_types=1);

namespace App\Modules\Marketing\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Marketing\Infrastructure\Persistence\Models\MarketingSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class MarketingSettingController extends Controller
{
    public function show(): JsonResponse
    {
        $settings = MarketingSetting::current();

        return response()->json([
            'success' => true,
            'message' => 'Configuración de marketing obtenida correctamente.',
            'data' => [
                'bannerRotationSeconds' => $settings->banner_rotation_seconds,
            ],
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'bannerRotationSeconds' => ['required', 'integer', 'min:1', 'max:120'],
        ]);

        $settings = MarketingSetting::current();
        $settings->banner_rotation_seconds = $validated['bannerRotationSeconds'];
        $settings->save();

        return response()->json([
            'success' => true,
            'message' => 'Configuración de marketing actualizada correctamente.',
            'data' => [
                'bannerRotationSeconds' => $settings->banner_rotation_seconds,
            ],
        ]);
    }
}
