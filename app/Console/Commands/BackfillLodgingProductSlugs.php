<?php

namespace App\Console\Commands;

use App\Models\LodgingProduct;
use Illuminate\Console\Command;
use Str;

/**
 * Stage 3.2 — one-time backfill of slug for lodging_products created before the slug column.
 * Idempotent: only touches rows where slug is null. Uses saveQuietly so it does not retrigger
 * model events (and does not regenerate already-slugged rows). Mirrors the smartphone/post slug shape.
 */
class BackfillLodgingProductSlugs extends Command
{
    protected $signature = 'app:backfill-lodging-slugs {--dry-run}';

    protected $description = 'Backfill slug for lodging_products that have no slug';

    public function handle()
    {
        $products = LodgingProduct::whereNull('slug')->get();
        $this->info("Found {$products->count()} products without slug.");

        foreach ($products as $product) {
            $slug = Str::slug($product->property_name) . '-' . $product->id . '-' . Str::lower(Str::random(6));

            if ($this->option('dry-run')) {
                $this->line("Would set: [{$product->id}] {$product->property_name} => {$slug}");
            } else {
                $product->slug = $slug;
                $product->saveQuietly();
                $this->line("Set: [{$product->id}] => {$slug}");
            }
        }

        $this->info('Done.');

        return self::SUCCESS;
    }
}
