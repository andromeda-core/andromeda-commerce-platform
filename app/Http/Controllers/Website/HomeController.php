<?php

namespace App\Http\Controllers\Website;

use App\Http\Controllers\Controller;
use App\Models\Smartphone;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        // dd(Smartphone::whereNull('videos')->whereNull('images')->whereHas('selling_info')->get()->toArray());

        return Inertia::render('Website/Home/index');
    }
}
