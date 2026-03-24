<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenAi
{
    private string $key;

    public function __construct()
    {
        $this->key = config('app.openai_api_key');
    }

    /**
     * Extract barcode data from a base64-encoded image.
     *
     * Returns one of:
     *   ['found' => false, 'error' => 'multiple_barcodes']
     *   ['found' => false, 'error' => null]
     *   ['found' => true,  'value' => '359876543210123']
     *   ['found' => true,  'fields' => ['imei1' => '...', 'imei2' => '...', 'serial' => '...']]
     */
    public function getScannedBarcodeResults(string $imageBase64, string $mimeType = 'image/jpeg'): array
    {
       $prompt = <<<PROMPT
You are a barcode extraction assistant for a mobile device inventory system.

This image contains a cropped region from a barcode scanner. Your job is to read whatever barcode is visible and extract its value.

The system stores exactly 5 fields per device:
- upc : Product UPC (12 digits) or EAN (13 digits)
- imei1   : Primary IMEI, exactly 15 digits
- imei2   : Secondary IMEI, exactly 15 digits (dual-SIM only)
- serial  : Device serial number, alphanumeric, 10–15 characters
- eid     : eSIM identifier, exactly 32 digits, always starts with 89

--- CASE 1: SINGLE BARCODE WITH ONE VALUE ---
Applies to: iPhone IMEI barcode, iPhone EID barcode, UPC/EAN product barcode, standalone serial barcode.
Return exactly:
{"found": true, "value": "<extracted value>"}

--- CASE 2: SINGLE COMPOSITE BARCODE (Samsung) ---
Samsung phone boxes use ONE barcode that encodes multiple identifiers in a single string.
The raw decoded string may be tab, space, pipe, slash, or newline delimited.
It typically contains IMEI1 + IMEI2 + Serial Number together.
Parse it and return only the fields that are present:
{"found": true, "fields": {"imei1": "...", "imei2": "...", "serial": "..."}}

--- CASE 3: NO BARCODE READABLE ---
{"found": false}

ACCURACY RULES:
- IMEI  : exactly 15 digits. Never truncate. Never guess a missing digit.
- EID   : exactly 32 digits. Always starts with 89.
- UPC   : exactly 12 digits.
- EAN   : exactly 13 digits.
- Serial: preserve exact alphanumeric casing as printed.
- Samsung model numbers (e.g. SM-S918B) are NOT stored, ignore them.
- Return ONLY the JSON object. No markdown, no code fences, no explanation.
PROMPT;

        try {
            $response = Http::withToken($this->key)
                ->timeout(25)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model'      => 'gpt-4o-mini',
                    'max_tokens' => 300,
                    'messages'   => [
                        [
                            'role'    => 'user',
                            'content' => [
                                [
                                    'type'      => 'image_url',
                                    'image_url' => [
                                        'url'    => "data:{$mimeType};base64,{$imageBase64}",
                                        'detail' => 'high',
                                    ],
                                ],
                                [
                                    'type' => 'text',
                                    'text' => $prompt,
                                ],
                            ],
                        ],
                    ],
                ]);

            if ($response->failed()) {
                Log::error('[OpenAI Scanner] API request failed', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
                return ['found' => false, 'error' => null];
            }

            $raw     = $response->json('choices.0.message.content', '');

            $cleaned = trim(preg_replace(['/^```(?:json)?\s*/i', '/\s*```$/'], '', trim($raw)));
            $parsed  = json_decode($cleaned, true);

            if (json_last_error() !== JSON_ERROR_NONE || !is_array($parsed)) {
                Log::warning('[OpenAI Scanner] Failed to parse JSON response', ['raw' => $raw]);
                return ['found' => false, 'error' => null];
            }



            // Nothing found
            if (empty($parsed['found'])) {
                return ['found' => false, 'error' => null];
            }

            // Single value barcode (iPhone IMEI / EID / UPC / Serial)
            if (!empty($parsed['value'])) {
                return [
                    'found' => true,
                    'value' => trim($parsed['value']),
                ];
            }

            // Composite barcode (Samsung) - only return populated fields
            if (!empty($parsed['fields']) && is_array($parsed['fields'])) {
                $allowed   = ['upc_ean', 'imei1', 'imei2', 'serial', 'eid'];
                $populated = array_filter(
                    array_intersect_key($parsed['fields'], array_flip($allowed)),
                    fn($v) => !empty($v)
                );

                if (!empty($populated)) {
                    return [
                        'found'  => true,
                        'fields' => $populated,
                    ];
                }
            }

            return ['found' => false, 'error' => null];

        } catch (\Throwable $e) {
            Log::error('[OpenAI Scanner] Exception', ['message' => $e->getMessage()]);
            return ['found' => false, 'error' => null];
        }
    }
}
