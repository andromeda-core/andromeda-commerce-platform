<?php

namespace App\Http\Controllers\Website;

use App\Helpers\Trans;
use App\Http\Controllers\Controller;
use App\Models\ProductLink;
use Illuminate\Http\Request;

class AttributionController extends Controller
{
    public function entry(Request $request, string $link_public_id)
    {

        $user = $request->user();


        if (!empty($user)) {
            if (!$user->hasRole('Customer')) {
                return to_route('home')->with('info', Trans::get('You are not a customer to use this feature.'));
            }
        }

        $link = ProductLink::where('link_public_id', $link_public_id)
            ->where('status', 'active')
            ->with('smartphone')
            ->first();

        if (empty($link) || empty($link->smartphone)) {
            return to_route('website.shop.index')->with('info', Trans::get('Invalid Link Provided'));
        }

        $attribution = json_encode([
            'link_public_id' => $link->link_public_id,
            'clicked_at'     => now()->toISOString(),
        ]);


        return redirect()
            ->to(
                route('home')
                    . "?m-slug={$link->smartphone->slug}&direct=true&single_page=true"
            )
            ->withCookie(
                cookie('attribution_context', $attribution, 60 * 24 * 30)
            );
    }
}
