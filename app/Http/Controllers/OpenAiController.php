<?php

namespace App\Http\Controllers;

use App\Services\OpenAi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OpenAiController extends Controller
{

    public function aiDecode(Request $request, OpenAi $openAi): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'mimes:jpeg,jpg,png,webp', 'max:8192'],
        ]);

        $file      = $request->file('image');
        $imageData = base64_encode(file_get_contents($file->getRealPath()));
        $mimeType  = $file->getMimeType();

        $result = $openAi->getScannedBarcodeResults($imageData, $mimeType);

        return response()->json($result);
    }
}
