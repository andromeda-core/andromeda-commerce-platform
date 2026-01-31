<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DeviceFingerPrintController extends Controller
{
    public function __invoke(Request $request)
    {

        if ($request->session()->has('device_fingerprint')) {
            return response()->json(['success' => true], 200);
        }

        $request->validate([
            'device_fingerprint' => 'required|string',
        ]);

        $request->session()->put(
            'device_fingerprint',
            $request->input('device_fingerprint')
        );

        return response()->json(['success' => true], 200);
    }
}
