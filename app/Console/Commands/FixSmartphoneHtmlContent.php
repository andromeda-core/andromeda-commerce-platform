<?php

namespace App\Console\Commands;

use App\Models\Smartphone;
use Illuminate\Console\Command;

class FixSmartphoneHtmlContent extends Command
{
    protected $signature = 'app:fix-smartphone-content {--dry-run}';

    protected $description = 'Repairs smartphone content mangled by the TipTap editor';

    public function handle()
    {
        $dryRun = $this->option('dry-run');
        $count = 0;

        Smartphone::whereNotNull('content')->chunkById(100, function ($phones) use (&$count, $dryRun) {
            foreach ($phones as $phone) {
                $raw = $phone->content;

                // Only touch rows that look entity-escaped (mangled)
                if (! preg_match('/&lt;|&gt;/i', $raw)) {
                    continue;
                }

                $clean = $this->repair($raw);

                $this->line("ID {$phone->id}: " . ($dryRun ? 'WOULD repair' : 'repaired'));

                if (! $dryRun) {
                    $phone->content = $clean;
                    $phone->saveQuietly(); // skip model events / AWS jobs
                }

                $count++;
            }
        });

        $this->info(($dryRun ? '[DRY RUN] ' : '') . "{$count} smartphone(s) processed.");

        return self::SUCCESS;
    }

    private function repair(string $s): string
    {
        // 1. Unwrap TipTap auto-links: <a ...>TEXT</a> -> TEXT
        $s = preg_replace('/<a\b[^>]*>(.*?)<\/a>/is', '$1', $s);

        // 2. Turn TipTap's per-line <p> wrappers into newlines
        $s = preg_replace('/<\/p>\s*<p[^>]*>/i', "\n", $s);
        $s = preg_replace('/<p[^>]*>/i', '', $s);
        $s = preg_replace('/<\/p>/i', "\n", $s);
        $s = preg_replace('/<br\s*\/?>/i', "\n", $s);

        // 3. Decode escaped entities back into real HTML
        $s = html_entity_decode($s, ENT_QUOTES | ENT_HTML5, 'UTF-8');

        return trim($s);
    }
}
