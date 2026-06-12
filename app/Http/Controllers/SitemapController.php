<?php

namespace App\Http\Controllers;

use App\Models\LodgingProduct;
use App\Models\Post;
use App\Models\Smartphone;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

class SitemapController extends Controller
{
    public function __invoke(): Response
    {
        $xml = Cache::remember('sitemap', now()->addHours(12), function () {

            $content  = '<?xml version="1.0" encoding="UTF-8"?>';
            $content .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

            // Home
            $content .= '<url><loc>' . url('/') . '</loc><changefreq>daily</changefreq><priority>1.0</priority></url>';

            // Products
            Smartphone::whereNotNull('public_id')
                ->whereNotNull('slug')
                ->select('public_id', 'slug', 'updated_at')
                ->latest()
                ->lazy(500)
                ->each(function ($s) use (&$content) {
                    $content .= '<url>';
                    $content .= '<loc>' . url('/product/' . $s->public_id . '/' . $s->slug) . '</loc>';
                    $content .= '<lastmod>' . $s->updated_at->toAtomString() . '</lastmod>';
                    $content .= '<changefreq>weekly</changefreq>';
                    $content .= '<priority>0.8</priority>';
                    $content .= '</url>';
                });

            // Posts
            Post::whereNotNull('public_id')
                ->whereNotNull('slug')
                ->where('status', true)
                ->select('public_id', 'slug', 'updated_at')
                ->latest()
                ->lazy(500)
                ->each(function ($p) use (&$content) {
                    $content .= '<url>';
                    $content .= '<loc>' . url('/post/' . $p->public_id . '/' . $p->slug) . '</loc>';
                    $content .= '<lastmod>' . $p->updated_at->toAtomString() . '</lastmod>';
                    $content .= '<changefreq>weekly</changefreq>';
                    $content .= '<priority>0.7</priority>';
                    $content .= '</url>';
                });

            // Lodging properties (Stage 3.2) — active + slugged only.
            LodgingProduct::whereNotNull('public_id')
                ->whereNotNull('slug')
                ->where('is_active', true)
                ->select('public_id', 'slug', 'updated_at')
                ->latest()
                ->lazy(500)
                ->each(function ($l) use (&$content) {
                    $content .= '<url>';
                    $content .= '<loc>' . url('/lodging/' . $l->public_id . '/' . $l->slug) . '</loc>';
                    $content .= '<lastmod>' . $l->updated_at->toAtomString() . '</lastmod>';
                    $content .= '<changefreq>weekly</changefreq>';
                    $content .= '<priority>0.7</priority>';
                    $content .= '</url>';
                });

            $content .= '</urlset>';
            return $content;
        });

        return response($xml, 200)->header('Content-Type', 'application/xml');
    }
}
