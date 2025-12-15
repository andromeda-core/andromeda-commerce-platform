<?php

namespace App\Http\Controllers;

use App\Services\MetaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class MetaController extends Controller
{
    public function webhook(Request $request)
    {
        $meta_setting = Cache::get('meta_setting');

        if (empty($meta_setting)) {
            return response('Forbidden', 403);
        }

        $meta_service = new MetaService($meta_setting);
        $event = $meta_service->webHookEvent($request);

        return $event;
    }
}
