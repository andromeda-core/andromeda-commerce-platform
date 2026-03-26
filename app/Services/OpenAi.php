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

    public function getScannedBarcodeResults(string $imageBase64, string $mimeType = 'image/jpeg'): array
    {
        $prompt = <<<'PROMPT'
You are a barcode extraction assistant for a mobile device inventory system.

This image is a photo of a phone box or label. It contains barcodes AND printed text labels next to them (like "IMEI", "IMEI2", "Serial No", "UPC", "EID").

Your job is to extract values using TWO methods:
1. Decode barcode stripes visually
2. Read printed alphanumeric text directly from the image (the human-readable numbers printed below or beside each barcode)

USE BOTH METHODS. Printed text is equally valid as decoded barcode values.
The printed text below a barcode is the decoded value of that barcode — trust it.

--- FIELD DEFINITIONS ---
- upc       : exactly 12 digits (UPC-A) or 13 digits (EAN-13)
- imei1     : exactly 15 digits — labeled "IMEI" or "IMEI1" on the box
- imei2     : exactly 15 digits — labeled "IMEI2" on the box (only if a DIFFERENT value than imei1)
- serial_no : An alphanumeric value (mix of letters and digits) found on the label that
              does NOT match any other field format below.
              Elimination rule — if a value is:
                - NOT exactly 15 digits        (would be imei)
                - NOT exactly 32 digits        (would be eid)
                - NOT exactly 12 or 13 digits  (would be upc)
                - NOT a pure model number      (e.g. SM-XXXXX)
              ...then it IS the serial_no. Length: 6–20 characters.
              Common patterns: starts with letters then digits (e.g. CSSDM0196940,
              R5CNA0BCDEF, RFTXA1234), but ANY alphanumeric mix qualifies.
              There is always exactly ONE serial_no per device label — find it.
- eid       : exactly 32 digits, always starts with 89 — labeled "EID" or "eSIM"

--- CLASSIFICATION RULES ---
1. Use printed labels (IMEI, IMEI2, Serial, UPC, EID) near the barcode to classify the value
2. If no label is visible, classify by format:
   - 32 digits starting with 89  => eid
   - 15 digits (first found)     => imei1
   - 15 digits (second, different value) => imei2
   - 12 digits                   => upc
   - 13 digits                   => upc
   - alphanumeric 10–15 chars    => serial_no
3. Samsung composite barcode: one barcode encoding IMEI1+IMEI2+Serial delimited by tab/space/pipe/slash/newline — split and classify each part

--- STRICT RULES ---
- imei2 MUST be a different value than imei1. If they are the same, only return imei1.
- Each field must hold a unique value. Never duplicate a value across fields.
- IMEI: exactly 15 digits. Never truncate or guess.
- EID: exactly 32 digits, starts with 89.
- Samsung model numbers (e.g. SM-S918B) are NOT a field, skip them.
- Discard any value that does not match a field definition.
- Read every barcode and every printed number in the image.
- There is always exactly ONE serial_no on every Samsung/Apple device label.
  You MUST return it. If you cannot find it using labels, use elimination:
  the only alphanumeric value that is not an IMEI, EID, or UPC is the serial_no.

--- OUTPUT RULES ---

CASE 1 — Exactly one value found:
{"found": true, "value": "<value>"}

CASE 2 — Two or more values found:
{"found": true, "fields": {"imei1": "...", "imei2": "...", "serial_no": "...", "upc": "...", "eid": "..."}}
Include only fields that were actually found. Omit missing fields entirely.

CASE 3 — Nothing readable:
{"found": false}

Return ONLY the JSON object. No markdown, no code fences, no explanation.
PROMPT;

        try {
            $response = Http::withToken($this->key)
                ->timeout(25)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => 'gpt-4.1',
                    'max_tokens' => 400,
                    'messages' => [
                        [
                            'role' => 'user',
                            'content' => [
                                [
                                    'type' => 'image_url',
                                    'image_url' => [
                                        'url' => "data:{$mimeType};base64,{$imageBase64}",
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
                    'body' => $response->body(),
                ]);

                return ['found' => false, 'error' => null];
            }

            $raw = $response->json('choices.0.message.content', '');
            $cleaned = trim(preg_replace(['/^```(?:json)?\s*/i', '/\s*```$/'], '', trim($raw)));
            $parsed = json_decode($cleaned, true);

            if (json_last_error() !== JSON_ERROR_NONE || ! is_array($parsed)) {
                Log::warning('[OpenAI Scanner] Failed to parse JSON response', ['raw' => $raw]);

                return ['found' => false, 'error' => null];
            }

            // No barcode found
            if (empty($parsed['found'])) {
                return ['found' => false, 'error' => null];
            }

            // CASE 1: Single barcode, single value
            if (isset($parsed['value']) && ! empty(trim($parsed['value']))) {
                return [
                    'found' => true,
                    'value' => trim($parsed['value']),
                ];
            }

            // CASE 2: Multiple barcodes or composite — return populated fields only
            if (! empty($parsed['fields']) && is_array($parsed['fields'])) {
                $allowed = ['upc', 'imei1', 'imei2', 'serial_no', 'eid'];
                $populated = array_filter(
                    array_intersect_key($parsed['fields'], array_flip($allowed)),
                    fn ($v) => is_string($v) && trim($v) !== ''
                );

                // Hard guard: never return imei2 if same as imei1
                if (
                    isset($populated['imei1'], $populated['imei2']) &&
                    trim($populated['imei1']) === trim($populated['imei2'])
                ) {
                    unset($populated['imei2']);
                }

                if (! empty($populated)) {
                    return [
                        'found' => true,
                        'fields' => $populated,
                    ];
                }
            }

            return ['found' => false, 'error' => null];

        } catch (\Throwable $e) {
            Log::error('[OpenAI Scanner] Exception', ['message' => $e->getMessage()]);

            return ['found' => false, 'error' => $e->getMessage() ?? null];
        }
    }
}
