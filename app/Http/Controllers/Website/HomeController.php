<?php

namespace App\Http\Controllers\Website;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Str;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        // dd(Smartphone::whereNull('videos')->whereNull('images')->whereHas('selling_info')->get()->toArray());

        $previous_url = url()->previous();

        if (! Str::of($previous_url)->contains('shop') && ! Str::of($previous_url)->contains('bookmarks') && ! Str::of($previous_url)->contains('stay')) {
            $previous_url = null;
        }

        return Inertia::render('Website/Home/index', compact('previous_url'));
    }
}
