<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;

class TranslationSystemController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:Translation System View', ['only' => '__invoke']),
        ];
    }

    public function __invoke(Request $request)
    {
        return Inertia::render('Dashboard/TranslationSystem/index');
    }
}
