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

This image is a photo of a phone box or label. It contains barcodes AND printed text labels
next to them (like "IMEI", "IMEI2", "Serial No", "UPC", "EID").

Your job is to extract values using TWO methods:
1. Decode barcode stripes visually
2. Read printed alphanumeric text directly from the image

USE BOTH METHODS. Printed text is equally valid as decoded barcode values.
The printed text below a barcode is the decoded value of that barcode — trust it.

--- FIELD DEFINITIONS ---
- upc       : exactly 12 digits (UPC-A) or 13 digits (EAN-13). Pure digits only.
- imei1     : exactly 15 digits — labeled "IMEI" or "IMEI1" on the box. Pure digits only.
- imei2     : exactly 15 digits — labeled "IMEI2" on the box. Must be DIFFERENT from imei1. Pure digits only.
- serial_no : alphanumeric string, 6–20 characters. Mix of letters and digits.
              ONLY return if you can read EVERY single character with 100% certainty.
              If even ONE character is ambiguous — omit serial_no entirely.
- eid       : exactly 32 digits, always starts with 89. Pure digits only.

--- CLASSIFICATION RULES ---
1. Use printed labels (IMEI, IMEI2, Serial, UPC, EID) near the barcode to classify the value.
2. If no label is visible, classify by format:
   - 32 digits starting with 89  => eid
   - 15 digits (first found)     => imei1
   - 15 digits (second, different value) => imei2
   - 12 or 13 digits             => upc
   - alphanumeric 6–20 chars     => serial_no (only if every character is certain)
3. Samsung composite barcode: one barcode encoding IMEI1+IMEI2+Serial delimited by
   tab/space/pipe/slash/newline — split and classify each part.

--- CHARACTER DISAMBIGUATION (APPLIES TO ALL FIELDS) ---
Before returning ANY value, inspect EVERY character using shape analysis:

DIGIT vs LETTER confusion — use PHYSICAL SHAPE to decide:
- 0 (zero)    : perfect circle or oval, NO tail, NO extra stroke
- O (letter)  : slightly wider/taller than zero, NO tail
- Q (letter)  : circle WITH a visible tail or diagonal stroke at bottom-right
  → If no tail visible → it is 0 (zero), NOT Q
  → Only return Q if you can clearly see the tail

- 1 (one)     : single vertical stroke, may have small serif at base
- I (capital) : vertical stroke, serifs on top AND bottom
- l (lower L) : vertical stroke, usually same height as capitals

- 8 (eight)   : two loops, symmetric, fully closed
- B (letter)  : flat left side, two bumps on RIGHT side only

- 5 (five)    : flat top, curved bottom-left
- S (letter)  : fully curved top and bottom, no flat edges

- 2 (two)     : curved top, diagonal stroke, flat base
- Z (letter)  : flat top stroke, diagonal, flat bottom stroke

- 6 (six)     : curved top leading into closed loop at bottom
- G (letter)  : C-shape with a HORIZONTAL BAR on the right inside

- 0 (zero)    : fully rounded
- D (letter)  : flat vertical left side, curved right side

RULE: If you cannot determine which character it is from shape alone → the ENTIRE field value
must be omitted. Do NOT guess based on what "seems likely" for a serial number pattern.

For IMEI/UPC/EID (pure digit fields):
- These contain ONLY digits 0-9. No letters.
- If you see what might be a letter in an IMEI/UPC/EID → it is a misread digit.
- Common: O→0, l→1, B→8, S→5, Z→2, G→6, D→0
- Apply the shape rules above to confirm the digit.
- If still uncertain → omit that entire field.

--- STRICT RULES ---
- imei2 MUST be a different value than imei1. If same, only return imei1.
- Each field must hold a unique value. Never duplicate across fields.
- IMEI: exactly 15 digits. Never truncate or pad.
- EID: exactly 32 digits, starts with 89.
- Samsung model numbers (e.g. SM-S918B) are NOT a field — skip them.
- Discard any value that does not match its field definition exactly.

--- ANTI-HALLUCINATION RULES (MOST IMPORTANT) ---
- NEVER guess, infer, or construct any value.
- ONLY return values you can DIRECTLY read from printed text OR decode from a barcode.
- Blurry, partial, or ambiguous → SKIP that field entirely.
- 100% certainty required for EVERY character in EVERY field.
- One wrong character makes the entire value useless or harmful.
- A missing field is always better than a wrong field.
- Do NOT complete partial values. 10/15 IMEI digits → return nothing for imei1.
- Do NOT derive fields from each other.
- Do NOT use "what usually appears here" reasoning — only use what you can directly see.

--- OUTPUT RULES ---
CASE 1 — Exactly one value found:
{"found": true, "value": "<value>"}

CASE 2 — Two or more values found:
{"found": true, "fields": {"imei1": "...", "imei2": "...", "serial_no": "...", "upc": "...", "eid": "..."}}
Include only fields actually found. Omit missing fields entirely.

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
                $val = trim($parsed['value']);

                // Reject if format is clearly wrong
                $validSingle =
                    preg_match('/^\d{15}$/', $val)      // IMEI
                    || preg_match('/^\d{12,13}$/', $val) // UPC/EAN
                    || preg_match('/^89\d{30}$/', $val)  // EID
                    || preg_match('/^[A-Z0-9]{6,20}$/i', $val); // Serial

                if (! $validSingle) {
                    Log::warning('[OpenAI Scanner] Invalid single value discarded', ['value' => $val]);

                    return ['found' => false, 'error' => null];
                }

                return [
                    'found' => true,
                    'value' => $val,
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

                // ── PHP-level format validation — reject anything AI got wrong ──

                // IMEI: exactly 15 digits
                foreach (['imei1', 'imei2'] as $f) {
                    if (isset($populated[$f]) && ! preg_match('/^\d{15}$/', trim($populated[$f]))) {
                        Log::warning("[OpenAI Scanner] Invalid {$f} discarded", ['value' => $populated[$f]]);
                        unset($populated[$f]);
                    }
                }

                // UPC: exactly 12 or 13 digits
                if (isset($populated['upc']) && ! preg_match('/^\d{12,13}$/', trim($populated['upc']))) {
                    Log::warning('[OpenAI Scanner] Invalid upc discarded', ['value' => $populated['upc']]);
                    unset($populated['upc']);
                }

                // EID: exactly 32 digits starting with 89
                if (isset($populated['eid']) && ! preg_match('/^89\d{30}$/', trim($populated['eid']))) {
                    Log::warning('[OpenAI Scanner] Invalid eid discarded', ['value' => $populated['eid']]);
                    unset($populated['eid']);
                }

                // Serial: 6-20 alphanumeric only (no spaces, no special chars)
                if (isset($populated['serial_no']) && ! preg_match('/^[A-Z0-9]{6,20}$/i', trim($populated['serial_no']))) {
                    Log::warning('[OpenAI Scanner] Invalid serial_no discarded', ['value' => $populated['serial_no']]);
                    unset($populated['serial_no']);
                }

                // ── Same guards for CASE 1 single value ──
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
