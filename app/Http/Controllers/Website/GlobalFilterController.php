<?php

namespace App\Http\Controllers\Website;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class GlobalFilterController extends Controller
{
    public function index()
    {
        return Inertia::render('Website/GlobalFilters/index');
    }
}
