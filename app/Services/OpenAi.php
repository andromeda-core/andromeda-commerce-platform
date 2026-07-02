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

    // FIX (auto-retry): hard cap on AUTOMATIC retries for the translation calls. Total attempts
    // = 1 initial + this many retries. Never more. Used by the bounded loops below.
    private const TRANSLATION_MAX_RETRIES = 2;

    // FIX (auto-retry): HTTP statuses that are PERMANENT (auth/permission/bad-request/validation)
    // and must fail immediately without retrying. Everything else non-2xx (429, 5xx, ...) is
    // treated as transient and may be retried.
    private function isPermanentHttpStatus(int $status): bool
    {
        return in_array($status, [400, 401, 403, 422], true);
    }

    // FIX (auto-retry): backoff between retries. retry 1 => ~1s, retry 2 => ~2s. For HTTP 429
    // honor the Retry-After header when present (clamped to a sane 30s ceiling).
    private function translationBackoffSleep(int $retryNumber, $response = null): void
    {
        $seconds = max(1, $retryNumber);

        if ($response instanceof \Illuminate\Http\Client\Response && $response->status() === 429) {
            $retryAfter = $response->header('Retry-After');
            if (is_numeric($retryAfter)) {
                $seconds = (int) max(1, min((float) $retryAfter, 30));
            }
        }

        sleep($seconds);
    }

    // NEW (RTL): single source of truth for right-to-left target languages. Kept as a small
    // hardcoded list (no schema change) matching the frontend twin in resources/js/Helpers/
    // rtlLocales.js. ar = Arabic, ur = Urdu (primary use cases on this platform); the rest are
    // included for completeness. To add more RTL languages later, both lists get one line.
    private const RTL_LOCALE_CODES = ['ar', 'ur', 'he', 'fa', 'ps', 'sd', 'yi'];

    private function isRtlLocale(string $code): bool
    {
        return in_array(strtolower($code), self::RTL_LOCALE_CODES, true);
    }

    // NEW (RTL): the extra prompt clause to append when the target language is RTL. Returns an
    // EMPTY string for LTR (and when no code is supplied), so every existing prompt is byte-for-byte
    // unchanged for LTR languages — this is a pure, conditional addition. It tells the model to keep
    // Latin-script runs (numbers, URLs, emails, brand names) rendering left-to-right within the RTL
    // flow rather than reversing them, and not to inject bidi control characters on its own.
    private function buildRtlClause(string $targetLanguageCode): string
    {
        return $this->isRtlLocale($targetLanguageCode)
            ? "\nThis is a right-to-left (RTL) language. Write the translation in natural RTL reading "
                .'order. Keep numbers, URLs, emails, brand names, and any other Latin-script text '
                .'displaying left-to-right within the RTL flow, exactly as a native RTL document would '
                .'render them (do not reverse digits or Latin words character-by-character). Do not '
                .'insert manual bidi control characters unless the source already contains them.'
            : '';
    }

    // NEW (additive): domain-agnostic single-field translation generator.
    // Pure generator: returns translated text only. It NEVER writes content_translations.
    // BUGFIX (Bug 2): returns the model output as RAW TEXT (no JSON wrapper, no
    // response_format json_object). Wrapping large HTML (~50KB) in JSON was fragile and
    // failed to parse / truncated. One field per call. Uses its OWN large max_tokens
    // (16000) and long timeout (120) sized for big HTML, so the barcode method's 400/25
    // stay byte-for-byte unchanged.
    public function translateField(string $field, string $value, string $targetLanguageName, bool $isHtml = false, string $targetLanguageCode = ''): array
    {
        // Nothing to translate. Caller normally skips empties, but stay safe (Bug 3).
        if (trim($value) === '') {
            return ['status' => true, 'value' => ''];
        }

        // FIX (HTML integrity): make the HTML rule STRICT so the model never summarises,
        // drops, comments out, or substitutes any markup (e.g. replacing real CSS with a
        // "/* stay unchanged */" placeholder). It must return the WHOLE document and
        // translate ONLY visible text.
        $htmlRule = $isHtml
            ? 'The value is an HTML document or fragment. Return the ENTIRE input back, byte for byte identical, EXCEPT human-visible text nodes, which you translate into the target language. '
                .'Hard requirements: '
                .'(1) Do NOT summarise, shorten, omit, comment out, or replace ANY part of the markup. Never write placeholders such as "/* unchanged */", "All style rules stay unchanged", "stay unchanged", or "...". Output the real, complete content in full. '
                .'(2) Preserve EXACTLY and unchanged: the doctype, every tag, every attribute, the full body of every <style> and <script> (never translate or alter CSS or JS), class names, ids, inline styles, URLs in href and src, data-* attributes, HTML entities, and all whitespace and structure. '
                .'(3) Leave the <html lang="..."> attribute exactly as-is (do not change the lang code). '
                .'(4) Translate ONLY visible text between tags and human-readable attribute values that are actually shown to users (alt, title, placeholder, aria-label, and meta description or og:* content). Do NOT translate code, URLs, class or id names, or the contents of <style> or <script>. '
                .'(5) The output length must be comparable to the input. A drastically shorter output means content was dropped, which is a failure. '
                .'Output ONLY the resulting HTML, with no commentary, no markdown, and no code fences.'
            // FIX (plain-text <p> injection): the old plain-text rule only said "no markdown / no
            // code fences", which did NOT stop the model from wrapping multi-paragraph text in
            // <p> tags and did NOT ask it to keep the newlines. A single injected block tag flips
            // the frontend onto the iframe path where newlines collapse and paragraphs merge. So
            // the plain-text rule now explicitly forbids ALL HTML/markup and requires the exact
            // line-break/paragraph structure to be preserved. (Only this isHtml=false branch is
            // changed; the isHtml=true branch above is untouched.)
            : 'The value is plain text. Translate it fully and naturally into the target language. '
                .'Hard requirements: '
                .'(1) Return ONLY the translated plain text. '
                .'(2) Do NOT add any HTML tags or markup of any kind (no <p>, <div>, <br>, <span>, or any other tag). '
                .'(3) Preserve ALL line breaks and blank lines EXACTLY as in the source: keep the same number of newlines and blank lines, and the same paragraph structure. '
                .'Output ONLY the translated text, with no commentary, no markdown, and no code fences.';

        // Tag rule: keep a leading # and keep the value a single token (do not turn it into spaces).
        $tagRule = $field === 'tag'
            ? 'This value is a tag/hashtag. If it starts with "#", keep the leading "#". Do not introduce spaces; keep it as one tag token.'
            : '';

        // NEW (RTL): appended ONLY when the target language is right-to-left; an empty string
        // otherwise, so the prompt stays byte-for-byte identical for LTR languages.
        $rtlClause = $this->buildRtlClause($targetLanguageCode);

        $prompt = <<<PROMPT
You are a professional translation engine for a web application.
Translate the provided value into {$targetLanguageName}.
Rules:
- Translate ONLY the human-readable text into {$targetLanguageName}.
- {$htmlRule}
- {$tagRule}
- Do not translate brand names, URLs, emails, numbers, or code.
- Return ONLY the translated value itself. No explanation, no notes, no JSON wrapper, no code fences.{$rtlClause}
PROMPT;

        // FIX (auto-retry): run the single-field model call with a bounded retry (max 2 retries,
        // 3 attempts total) on transient failures. Returns the same { status, value|error } shape.
        $res = $this->requestSingleTranslation($prompt, $value);

        if (($res['status'] ?? false) !== true) {
            return $res; // transient retries exhausted, or a permanent failure
        }

        $cleaned = $res['value'];

        // FIX (HTML integrity): lightweight sanity guard for the HTML field (no DOM parsing).
        // If the model dropped/placeholdered markup, fail the field so the panel shows
        // Failed/Retry instead of saving corrupted HTML. Plain text skips this guard.
        if ($isHtml) {
            $srcLen = mb_strlen($value);
            $outLen = mb_strlen($cleaned);

            // (a) suspiciously short output means markup/content was dropped.
            // FIX (DOM path): HTML content now translates via DOMDocument (text nodes only),
            // so this whole-document guard only affects the rare no-DOM fallback. Relaxed
            // 0.5 -> 0.25 so legitimate length variation is not a false failure.
            $tooShort = $srcLen > 0 && $outLen < ($srcLen * 0.25);

            // (b) obvious "leave it unchanged" placeholder text the model sometimes emits
            // instead of the real markup. Only flag if the SOURCE did not already contain it
            // (a real translation of visible text would not contain these English phrases).
            $lowerOut = mb_strtolower($cleaned);
            $lowerSrc = mb_strtolower($value);
            $placeholderNeedles = [
                'stay unchanged',
                'stays unchanged',
                'remain unchanged',
                'remains unchanged',
                'styles unchanged',
                'all style rules',
                'style rules stay',
                'unchanged */',
                'rest of the styles',
                'rest of the css',
            ];
            $hasPlaceholder = false;
            foreach ($placeholderNeedles as $needle) {
                if (str_contains($lowerOut, $needle) && ! str_contains($lowerSrc, $needle)) {
                    $hasPlaceholder = true;
                    break;
                }
            }

            // (c) source had a non-empty <style>/<script> body but the output dropped it entirely.
            $bodyPattern = '/<(style|script)\b[^>]*>.*?\S.*?<\/(?:style|script)>/is';
            $lostStyleOrScript = preg_match($bodyPattern, $value) === 1
                && preg_match($bodyPattern, $cleaned) !== 1;

            if ($tooShort || $hasPlaceholder || $lostStyleOrScript) {
                Log::warning('[OpenAI Translate] HTML translation looks incomplete/corrupted', [
                    'src_len' => $srcLen,
                    'out_len' => $outLen,
                    'too_short' => $tooShort,
                    'has_placeholder' => $hasPlaceholder,
                    'lost_style_or_script' => $lostStyleOrScript,
                ]);

                return ['status' => false, 'error' => 'HTML translation incomplete'];
            }
        }

        return [
            'status' => true,
            'value' => $cleaned,
        ];
    }

    // FIX (auto-retry): single-field model call with a STRICTLY BOUNDED retry loop. Max
    // TRANSLATION_MAX_RETRIES (2) retries => 3 attempts total; the loop always terminates by then.
    // Retries TRANSIENT failures only (timeout/connection, non-200 like 429/5xx, empty output).
    // Permanent errors (auth/validation: 400/401/403/422) fail immediately. Returns the raw value.
    private function requestSingleTranslation(string $prompt, string $value): array
    {
        for ($attempt = 0; ; $attempt++) {
            try {
                $response = Http::withToken($this->key)
                    ->timeout(300) // BUGFIX (Bug 2): was 60. FIX (422 size cap): 300 for larger HTML output (nginx allows 300)
                    ->post('https://api.openai.com/v1/chat/completions', [
                        'model' => 'gpt-4.1',
                        'max_tokens' => 32000, // BUGFIX (Bug 2): was 4000 then 16000. FIX (422 size cap): 32000 (gpt-4.1 output cap is 32768) so larger HTML is not truncated
                        // BUGFIX (Bug 2): removed response_format json_object; this method returns RAW text now.
                        // 'response_format' => ['type' => 'json_object'],
                        'messages' => [
                            [
                                'role' => 'system',
                                'content' => $prompt,
                            ],
                            [
                                'role' => 'user',
                                'content' => $value,
                            ],
                        ],
                    ]);
            } catch (\Throwable $e) {
                // Transient (timeout/connection): retry until the cap, then fail.
                if ($attempt < self::TRANSLATION_MAX_RETRIES) {
                    $this->translationBackoffSleep($attempt + 1);

                    continue;
                }
                Log::error('[OpenAI Translate] Exception', ['message' => $e->getMessage()]);

                return ['status' => false, 'error' => $e->getMessage() ?? 'Translation error'];
            }

            if ($response->failed()) {
                // Permanent (auth/validation) fails now; transient (429/5xx/...) retries.
                if (! $this->isPermanentHttpStatus($response->status()) && $attempt < self::TRANSLATION_MAX_RETRIES) {
                    $this->translationBackoffSleep($attempt + 1, $response);

                    continue;
                }
                Log::error('[OpenAI Translate] API request failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return ['status' => false, 'error' => 'Translation request failed'];
            }

            $raw = $response->json('choices.0.message.content', '');
            // BUGFIX (Bug 2): the message content IS the translation now. Only strip accidental
            // code fences; do NOT json_decode (raw HTML/text round-trips as-is).
            $cleaned = trim(preg_replace(['/^```(?:json|html)?\s*/i', '/\s*```$/'], '', trim((string) $raw)));

            // Empty after trim is a transient model glitch: retry until the cap, then fail.
            if ($cleaned === '') {
                if ($attempt < self::TRANSLATION_MAX_RETRIES) {
                    $this->translationBackoffSleep($attempt + 1);

                    continue;
                }
                Log::warning('[OpenAI Translate] Empty translation response', ['raw' => $raw]);

                return ['status' => false, 'error' => 'Invalid translation response'];
            }

            return ['status' => true, 'value' => $cleaned];
        }
    }

    // NEW (additive): batch-translate an ordered list of PLAIN TEXT segments and return them in
    // the SAME order/count. Used by the DOM-based HTML translation so markup is NEVER sent to the
    // model (small payloads => no truncation). Does NOT touch the barcode method or translateField.
    public function translateTextSegments(array $segments, string $targetLanguageName, string $targetLanguageCode = ''): array
    {
        $segments = array_values($segments);
        if (count($segments) === 0) {
            return ['status' => true, 'segments' => []];
        }

        $items = [];
        foreach ($segments as $i => $text) {
            $items[] = ['id' => $i, 'text' => (string) $text];
        }
        $jsonInput = json_encode(['items' => $items], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $prompt = <<<PROMPT
You are a professional translation engine.
The user message is JSON: { "items": [ { "id": <int>, "text": "<source text>" }, ... ] }.
Translate the "text" of every item into {$targetLanguageName}.
Rules:
- Translate ONLY the human-readable text. Keep numbers, URLs, emails, and code tokens as-is.
- Do NOT add, drop, split, merge, or reorder items. Return EXACTLY the same count and the same ids.
- Do NOT add any HTML or markup. Each "text" stays plain text.
- Return STRICT JSON ONLY in this shape and nothing else: { "items": [ { "id": <int>, "text": "<translated>" }, ... ] }
PROMPT;

        // FIX (auto-retry): bounded retry (max 2) on transient failures, including a malformed or
        // count-mismatched batch response. Permanent errors fail immediately.
        return $this->requestBatchTranslation($prompt, $jsonInput, $segments);
    }

    // FIX (auto-retry): batch model call with a STRICTLY BOUNDED retry loop. Max
    // TRANSLATION_MAX_RETRIES (2) retries => 3 attempts total; always terminates. Retries
    // TRANSIENT failures only: timeout/connection, non-200 (429/5xx), unparseable JSON, or a
    // count-mismatched batch (model dropped/added items). Permanent errors (400/401/403/422) fail
    // immediately. On a FINAL count-mismatch it returns what it has (source kept for any missing
    // id) so one stray item never fails the whole document.
    private function requestBatchTranslation(string $prompt, string $jsonInput, array $segments): array
    {
        for ($attempt = 0; ; $attempt++) {
            try {
                $response = Http::withToken($this->key)
                    ->timeout(300)
                    ->post('https://api.openai.com/v1/chat/completions', [
                        'model' => 'gpt-4.1',
                        'max_tokens' => 32000,
                        'response_format' => ['type' => 'json_object'],
                        'messages' => [
                            ['role' => 'system', 'content' => $prompt],
                            ['role' => 'user', 'content' => $jsonInput],
                        ],
                    ]);
            } catch (\Throwable $e) {
                // Transient (timeout/connection): retry until the cap, then fail.
                if ($attempt < self::TRANSLATION_MAX_RETRIES) {
                    $this->translationBackoffSleep($attempt + 1);

                    continue;
                }
                Log::error('[OpenAI Translate Batch] Exception', ['message' => $e->getMessage()]);

                return ['status' => false, 'error' => $e->getMessage() ?? 'Translation error'];
            }

            if ($response->failed()) {
                // Permanent (auth/validation) fails now; transient (429/5xx/...) retries.
                if (! $this->isPermanentHttpStatus($response->status()) && $attempt < self::TRANSLATION_MAX_RETRIES) {
                    $this->translationBackoffSleep($attempt + 1, $response);

                    continue;
                }
                Log::error('[OpenAI Translate Batch] API request failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return ['status' => false, 'error' => 'Translation request failed'];
            }

            $raw = $response->json('choices.0.message.content', '');
            $cleaned = trim(preg_replace(['/^```(?:json)?\s*/i', '/\s*```$/'], '', trim((string) $raw)));
            $parsed = json_decode($cleaned, true);

            if (json_last_error() !== JSON_ERROR_NONE || ! isset($parsed['items']) || ! is_array($parsed['items'])) {
                // Unparseable / wrong shape: transient model glitch, retry then fail.
                if ($attempt < self::TRANSLATION_MAX_RETRIES) {
                    $this->translationBackoffSleep($attempt + 1);

                    continue;
                }
                Log::warning('[OpenAI Translate Batch] Failed to parse JSON response', [
                    'raw' => mb_substr((string) $raw, 0, 500),
                ]);

                return ['status' => false, 'error' => 'Invalid translation response'];
            }

            // Map results by id so any reordering by the model cannot misalign segments.
            $byId = [];
            foreach ($parsed['items'] as $item) {
                if (is_array($item) && isset($item['id']) && array_key_exists('text', $item)) {
                    $byId[(int) $item['id']] = is_string($item['text']) ? $item['text'] : '';
                }
            }

            // Count-mismatch (model dropped/added ids): retry for a complete set; on the final
            // attempt accept what we have (source kept for any missing id) rather than fail.
            $missing = 0;
            foreach ($segments as $i => $src) {
                if (! array_key_exists($i, $byId)) {
                    $missing++;
                }
            }
            if ($missing > 0 && $attempt < self::TRANSLATION_MAX_RETRIES) {
                $this->translationBackoffSleep($attempt + 1);

                continue;
            }

            $out = [];
            foreach ($segments as $i => $src) {
                // Keep the source segment if the model dropped/garbled this id (never lose text).
                $out[$i] = array_key_exists($i, $byId) ? $byId[$i] : $src;
            }

            return ['status' => true, 'segments' => $out];
        }
    }
}
