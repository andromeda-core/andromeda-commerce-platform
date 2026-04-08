<?php

namespace App\Console\Commands;

use App\Models\Translation;
use App\Models\TranslationKey;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class FixDuplicateTranslationKeys extends Command
{
    protected $signature = 'translations:fix-duplicate-keys {--dry-run : Preview without making changes}';

    protected $description = 'Detect and merge translation keys that are duplicates due to ligature/invisible characters';

    private array $ligatures = [
        "\u{FB00}" => 'ff',
        "\u{FB01}" => 'fi',
        "\u{FB02}" => 'fl',
        "\u{FB03}" => 'ffi',
        "\u{FB04}" => 'ffl',
        "\u{FB05}" => 'st',
        "\u{FB06}" => 'st',
    ];

    public function handle(): void
    {
        $isDryRun = $this->option('dry-run');

        $this->info($isDryRun ? '[DRY RUN] Scanning for duplicate translation keys...' : 'Scanning for duplicate translation keys...');

        $allKeys = TranslationKey::all();

        // Build a map: normalizedKey => [list of TranslationKey models]
        $grouped = [];
        foreach ($allKeys as $keyModel) {
            $normalized = $this->normalizeKey($keyModel->key);
            $grouped[$normalized][] = $keyModel;
        }

        $duplicateGroups = array_filter($grouped, fn ($g) => count($g) > 1);

        if (empty($duplicateGroups)) {
            $this->info('No duplicate keys found. Database is clean.');

            return;
        }

        $this->warn(count($duplicateGroups).' duplicate group(s) found:');

        foreach ($duplicateGroups as $normalized => $keyModels) {
            $this->line('');
            $this->line("Normalized key: [{$normalized}]");

            foreach ($keyModels as $km) {
                $hex = bin2hex($km->key);
                $this->line("  ID: {$km->id} | Raw: [{$km->key}] | Hex: {$hex}");
            }

            if ($isDryRun) {
                continue;
            }

            // Keep the one with the clean ASCII key (no ligatures), merge others into it
            usort($keyModels, function ($a, $b) {
                // Prefer the one whose key matches the normalized form exactly
                $aNorm = $this->normalizeKey($a->key) === $a->key;
                $bNorm = $this->normalizeKey($b->key) === $b->key;
                if ($aNorm && ! $bNorm) {
                    return -1;
                }
                if (! $aNorm && $bNorm) {
                    return 1;
                }

                return $a->id <=> $b->id; // fallback: keep older
            });

            $keepKey = $keyModels[0];
            $mergeKeys = array_slice($keyModels, 1);
            $mergeIds = array_column($mergeKeys, 'id');

            $this->info("  Keeping ID: {$keepKey->id} [{$keepKey->key}]");
            $this->warn('  Merging IDs: '.implode(', ', $mergeIds));

            DB::transaction(function () use ($keepKey, $mergeIds) {
                foreach ($mergeIds as $duplicateKeyId) {
                    // Re-point translations that don't already exist on $keepKey
                    $translationsToMigrate = Translation::where('translation_key_id', $duplicateKeyId)->get();

                    foreach ($translationsToMigrate as $translation) {
                        $alreadyExists = Translation::where('translation_key_id', $keepKey->id)
                            ->where('language_id', $translation->language_id)
                            ->exists();

                        if (! $alreadyExists) {
                            $translation->update(['translation_key_id' => $keepKey->id]);
                            $this->line("    Migrated translation (lang_id: {$translation->language_id}) to key ID {$keepKey->id}");
                        } else {
                            $translation->delete();
                            $this->line("    Deleted orphaned translation (lang_id: {$translation->language_id}) - target already had a value");
                        }
                    }

                    // Now safe to delete the duplicate key
                    TranslationKey::destroy($duplicateKeyId);
                    $this->info("    Deleted duplicate key ID: {$duplicateKeyId}");
                }

                // Optionally fix the kept key's own value to be clean
                $keepKey->update(['key' => $this->normalizeKey($keepKey->key)]);
            });
        }

        $this->line('');
        $this->info('Done. Run `php artisan translations:fix-duplicate-keys --dry-run` anytime to verify.');
    }

    private function normalizeKey(string $value): string
    {
        $value = str_replace(array_keys($this->ligatures), array_values($this->ligatures), $value);
        $value = preg_replace('/^\xEF\xBB\xBF/u', '', $value);

        if (class_exists(\Normalizer::class)) {
            $value = \Normalizer::normalize($value, \Normalizer::FORM_C);
        }

        $value = preg_replace('/[\p{Cc}\p{Cf}]/u', '', $value);
        $value = preg_replace('/[\p{Z}\s]+/u', ' ', $value);

        return trim($value);
    }
}
