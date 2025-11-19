<?php

namespace App\Http\Controllers\Website;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class GlobalFilterController extends Controller
{
    public function index(Request $request)
    {
        if ($request->routeIs('home')) {
            return to_route('home');

        }

        return back();
    }
}
