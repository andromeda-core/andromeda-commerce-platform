<?php

namespace App\Services;

use App\Models\Language;
use Illuminate\Support\Facades\Log; // FIX (DOM HTML translation): log DOM parse/reconstruct issues

// NEW (additive): reusable, domain-agnostic AI translation orchestrator.
// Knows nothing about Posts/Smartphones/Lodging. The caller passes its own
// allowed field whitelist and which of those fields are HTML. This is a PURE
// generator: it returns translated text and NEVER writes content_translations.
class AiTranslationService
{
    public function __construct(private OpenAi $openAi) {}

    /**
     * Translate a single field value into the target language.
     *
     * @param  string  $field             the field key being translated
     * @param  string  $value             raw source value (plain text or HTML)
     * @param  int     $targetLanguageId  languages.id of the target language
     * @param  array   $allowedFields     server-side whitelist of translatable field keys
     * @param  array   $htmlFields        subset of $allowedFields whose value is HTML
     * @return array { status, field, language_id, value } on success,
     *               { status:false, message } on failure
     */
    public function translateField(
        string $field,
        string $value,
        int $targetLanguageId,
        array $allowedFields,
        array $htmlFields = []
    ): array {
        // Whitelist guard: never translate a field the caller did not allow.
        if (! in_array($field, $allowedFields, true)) {
            return ['status' => false, 'message' => 'Field is not translatable'];
        }

        // Target language must exist and must NOT be the fallback locale.
        $fallback = config('app.fallback_locale', 'en');
        $language = Language::find($targetLanguageId);

        if (! $language || $language->code === $fallback) {
            return ['status' => false, 'message' => 'Invalid target language'];
        }

        $isHtml = in_array($field, $htmlFields, true);

        // FIX (DOM HTML translation): for HTML content, translate ONLY the visible text nodes
        // server-side (DOMDocument) and keep all markup, style, script, attributes and links
        // intact. This replaces sending the whole document to the model, which truncated large
        // HTML. Plain text / non-HTML fields keep the existing single-call path below.
        if ($isHtml && $this->looksLikeHtml($value)) {
            $dom = $this->translateHtmlViaDom($value, $language->name);

            if (($dom['status'] ?? false) !== true) {
                return ['status' => false, 'message' => $dom['message'] ?? 'Translation failed'];
            }

            return [
                'status' => true,
                'field' => $field,
                'language_id' => $targetLanguageId,
                'value' => $dom['value'] ?? '',
            ];
        }

        // Plain text (or an HTML field whose value has no tags): single-call plain translation.
        $result = $this->openAi->translateField($field, $value, $language->name, false);

        if (($result['status'] ?? false) !== true) {
            return ['status' => false, 'message' => $result['error'] ?? 'Translation failed'];
        }

        $translatedValue = $result['value'] ?? '';

        // FIX (plain-text <p> injection): deterministic backstop, STRICTLY GATED on a TAGLESS
        // source. Even with the tightened plain-text prompt the model can still wrap a plain-text
        // body in block tags (e.g. <p>...</p>); a single block tag flips the frontend onto the
        // iframe render path where newlines collapse and paragraphs merge. When the ORIGINAL
        // $value had NO tags but the translation came back WITH tags, convert that injected markup
        // back to plain text so the paragraph breaks survive as real newlines on the inline path.
        // GATING IS CRITICAL: a genuine HTML source (looksLikeHtml($value) === true) is handled
        // above by translateHtmlViaDom and NEVER reaches this branch, so real HTML markup, styles
        // and structure are never stripped or altered by this backstop.
        if (! $this->looksLikeHtml($value) && $this->looksLikeHtml($translatedValue)) {
            $translatedValue = $this->normalizeInjectedHtmlToPlainText($translatedValue);
        }

        return [
            'status' => true,
            'field' => $field,
            'language_id' => $targetLanguageId,
            'value' => $translatedValue,
        ];
    }

    // FIX (DOM HTML translation): true when the value contains at least one HTML tag.
    private function looksLikeHtml(string $value): bool
    {
        return preg_match('/<\/?[a-zA-Z][^>]*>/', $value) === 1;
    }

    // FIX (plain-text <p> injection): deterministic backstop for the PLAIN-TEXT path only. Turns
    // HTML that the model injected into a TAGLESS source back into plain text with real newlines,
    // so paragraph breaks survive on the frontend inline render path. The caller gates this on
    // ! looksLikeHtml($source), so a genuine HTML source (translated via translateHtmlViaDom)
    // NEVER reaches here and its real markup/styles are never touched.
    private function normalizeInjectedHtmlToPlainText(string $value): string
    {
        // <br> and closing block tags become a newline so line/paragraph breaks are preserved.
        $value = preg_replace('/<\s*br\s*\/?\s*>/i', "\n", $value);
        $value = preg_replace(
            '/<\s*\/\s*(p|div|section|article|header|footer|h[1-6]|li|ul|ol|blockquote|pre|table|tr)\s*>/i',
            "\n",
            $value
        );

        // Opening block tags are removed outright (their break role is handled by the closing tag).
        $value = preg_replace(
            '/<\s*(p|div|section|article|header|footer|h[1-6]|li|ul|ol|blockquote|pre|table|tr)\b[^>]*>/i',
            '',
            $value
        );

        // Strip any remaining tags (e.g. a stray <span>) so nothing HTML-like survives.
        $value = preg_replace('/<\/?[a-zA-Z][^>]*>/', '', $value);

        // Decode any HTML entities the model may have introduced (e.g. &amp;, &#39;, &nbsp;).
        $value = html_entity_decode($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');

        // Collapse 3+ consecutive newlines to at most 2 so paragraph spacing stays sane.
        $value = preg_replace('/\n{3,}/', "\n\n", $value);

        return $value;
    }

    // FIX (DOM HTML translation): parse the HTML, translate ONLY visible text nodes (never the
    // contents of <script>/<style>), then reconstruct. Tags, attributes, CSS, JS, links, ids,
    // classes and structure are left untouched at the code level. Domain-agnostic and reusable.
    private function translateHtmlViaDom(string $html, string $targetLanguageName): array
    {
        // Without ext-dom we cannot parse safely; fall back to a single whole-document call.
        if (! class_exists(\DOMDocument::class)) {
            $fallback = $this->openAi->translateField('content', $html, $targetLanguageName, true);

            return ($fallback['status'] ?? false) === true
                ? ['status' => true, 'value' => $fallback['value'] ?? '']
                : ['status' => false, 'message' => $fallback['error'] ?? 'Translation failed'];
        }

        try {
            $dom = new \DOMDocument('1.0', 'UTF-8');
            $previousErrors = libxml_use_internal_errors(true);

            // Prefix an XML encoding PI so libxml reads the bytes as UTF-8 (the PI is removed
            // after load).
            // FIX (full-document strip): NOIMPLIED is for FRAGMENTS only. On a FULL document
            // (<!doctype>/<html>) it makes libxml keep just the first element and DROP the
            // <head>/<style>/<body> (output collapses to a bare <p>). So branch: load a full
            // document with default flags (whole structure survives); use NOIMPLIED|NODEFDTD
            // only for a fragment so no <html>/<body> wrapper or doctype is injected.
            // OLD (stripped full documents): loadHTML was called unconditionally with the flags
            // NOIMPLIED | NODEFDTD | NOERROR | NOWARNING, which collapsed full documents.
            // FIX (preamble): a full document may carry stray text/markup BEFORE the doctype or
            // <html> (a data-entry artifact). With that preamble present, libxml fails to build
            // <head> and collapses the structure into <body>. Split the preamble off, parse ONLY
            // the document part (structure then survives), and re-attach the separately translated
            // preamble at the end.
            $preamble = '';
            $documentHtml = $html;
            $isFullDocument = false;
            if (preg_match('/<!doctype\s+html|<html[\s>]/i', $html, $mDoc, PREG_OFFSET_CAPTURE)) {
                $isFullDocument = true;
                $docOffset = (int) $mDoc[0][1];
                if ($docOffset > 0) {
                    $preamble = substr($html, 0, $docOffset);
                    $documentHtml = substr($html, $docOffset);
                }
            }

            $loadFlags = LIBXML_NOERROR | LIBXML_NOWARNING;
            if (! $isFullDocument) {
                $loadFlags |= LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD;
            }

            $loaded = $dom->loadHTML('<?xml encoding="UTF-8" ?>'.$documentHtml, $loadFlags);

            libxml_clear_errors();
            libxml_use_internal_errors($previousErrors);

            if (! $loaded) {
                return ['status' => false, 'message' => 'HTML parse failed'];
            }

            // Drop the injected XML processing instruction so it never appears in the output.
            foreach (iterator_to_array($dom->childNodes) as $child) {
                if ($child->nodeType === XML_PI_NODE) {
                    $dom->removeChild($child);
                }
            }

            // FIX (full-document strip): never proceed if the parse collapsed the structure.
            // Checks the document part (preamble excluded) against the parsed DOM. If the source
            // had <head>/<style>/<body> but the DOM lost it, fail to Retry rather than saving a
            // stripped document.
            if ($this->htmlStructureLost($documentHtml, $dom)) {
                Log::warning('[AiTranslation DOM] Parse lost document structure');

                return ['status' => false, 'message' => 'HTML structure lost on parse'];
            }

            // Collect visible text nodes only (exclude anything inside <script>/<style> and
            // whitespace-only nodes). Attribute values (alt/title/placeholder/meta) are a
            // deliberate TODO: text nodes first, attributes can be added later without breakage.
            $xpath = new \DOMXPath($dom);
            $nodeList = $xpath->query(
                '//text()[not(ancestor::script) and not(ancestor::style) and normalize-space(.) != ""]'
            );

            $textNodes = [];
            foreach ($nodeList as $node) {
                $textNodes[] = $node;
            }

            // Nothing visible to translate (pure markup/scripts/styles): return unchanged.
            if (count($textNodes) === 0) {
                return ['status' => true, 'value' => $html];
            }

            // Split each node into leading whitespace + core + trailing whitespace; translate
            // only the core and re-attach the original whitespace so spacing/indentation holds.
            $segments = [];
            $affixes = [];
            foreach ($textNodes as $i => $node) {
                $original = (string) $node->nodeValue;
                preg_match('/^(\s*)([\s\S]*?)(\s*)$/u', $original, $m);
                $affixes[$i] = ['lead' => $m[1] ?? '', 'trail' => $m[3] ?? ''];
                $segments[$i] = $m[2] ?? $original;
            }

            $translated = $this->translateSegmentsChunked($segments, $targetLanguageName);
            if (($translated['status'] ?? false) !== true) {
                return ['status' => false, 'message' => $translated['message'] ?? 'Translation failed'];
            }
            $values = $translated['segments'];

            // Write translated cores back into the exact original text nodes.
            foreach ($textNodes as $i => $node) {
                $core = array_key_exists($i, $values) ? $values[$i] : $segments[$i];
                $node->nodeValue = $affixes[$i]['lead'].$core.$affixes[$i]['trail'];
            }

            $rebuilt = $dom->saveHTML();
            if ($rebuilt === false || trim((string) $rebuilt) === '') {
                return ['status' => false, 'message' => 'HTML reconstruction failed'];
            }

            // saveHTML emits non-ASCII as NUMERIC entities (e.g. Arabic -> &#1575;). Decode ONLY
            // numeric character references back to real UTF-8 so translated text is stored and
            // edited as characters, not entities. Named entities (&amp; &lt; &gt; &quot; &nbsp;)
            // are intentionally left untouched so markup, URLs and CSS/JS stay valid.
            $rebuilt = preg_replace_callback(
                '/&#(\d+);|&#x([0-9A-Fa-f]+);/',
                function ($m) {
                    $dec = $m[1] ?? '';
                    $hex = $m[2] ?? '';
                    if ($dec !== '') {
                        $code = (int) $dec;
                    } elseif ($hex !== '') {
                        $code = hexdec($hex);
                    } else {
                        return $m[0];
                    }
                    $ch = mb_chr($code, 'UTF-8');

                    return $ch !== false ? $ch : $m[0];
                },
                (string) $rebuilt
            );

            // FIX (full-document strip): final structural guard. If the document part had a
            // closing </head>/</style>/</body> but the output does not, it was stripped; fail to
            // Retry instead of saving a broken/partial document.
            foreach (['head', 'style', 'body'] as $tag) {
                $closing = '</'.$tag.'>';
                if (stripos($documentHtml, $closing) !== false && stripos((string) $rebuilt, $closing) === false) {
                    Log::warning('[AiTranslation DOM] Output lost structure', ['missing' => $closing]);

                    return ['status' => false, 'message' => 'HTML translation incomplete'];
                }
            }

            // FIX (preamble): translate the preamble's visible text and re-attach it in front of
            // the reconstructed document so the leading line is not lost or left untranslated.
            // If the preamble translation fails, keep the original preamble (never fail the doc).
            $finalPreamble = $preamble;
            if (trim($preamble) !== '') {
                preg_match('/^(\s*)([\s\S]*?)(\s*)$/u', $preamble, $pm);
                $preLead = $pm[1] ?? '';
                $preCore = $pm[2] ?? $preamble;
                $preTrail = $pm[3] ?? '';
                $preRes = $this->openAi->translateTextSegments([$preCore], $targetLanguageName);
                if (($preRes['status'] ?? false) === true && isset($preRes['segments'][0]) && is_string($preRes['segments'][0])) {
                    $finalPreamble = $preLead.$preRes['segments'][0].$preTrail;
                }
            }

            return ['status' => true, 'value' => $finalPreamble.trim((string) $rebuilt)];
        } catch (\Throwable $e) {
            Log::error('[AiTranslation DOM] Exception', ['message' => $e->getMessage()]);

            return ['status' => false, 'message' => 'HTML translation failed'];
        }
    }

    // FIX (full-document strip): true when the parsed DOM lost a major element the source had
    // (e.g. NOIMPLIED collapsing a full document). Used to bail before wasting translation calls.
    private function htmlStructureLost(string $source, \DOMDocument $dom): bool
    {
        $xpath = new \DOMXPath($dom);
        foreach (['head', 'style', 'body'] as $tag) {
            $sourceHas = (bool) preg_match('/<'.$tag.'[\s>]/i', $source);
            if ($sourceHas && $xpath->query('//'.$tag)->length === 0) {
                return true;
            }
        }

        return false;
    }

    // FIX (DOM HTML translation): translate segments in small SEQUENTIAL batches so each model
    // call stays well under its output limit (no truncation), preserving order.
    private function translateSegmentsChunked(array $segments, string $targetLanguageName): array
    {
        $maxCharsPerCall = 4000; // small batches keep non-Latin (Arabic/Chinese) output safe
        $maxItemsPerCall = 80;

        $result = [];
        $batch = [];
        $batchKeys = [];
        $batchLen = 0;

        foreach ($segments as $key => $text) {
            $len = mb_strlen((string) $text);

            if (count($batch) > 0 && (($batchLen + $len) > $maxCharsPerCall || count($batch) >= $maxItemsPerCall)) {
                $flushed = $this->flushSegmentBatch($batch, $batchKeys, $targetLanguageName, $result);
                if (($flushed['status'] ?? false) !== true) {
                    return $flushed;
                }
                $batch = [];
                $batchKeys = [];
                $batchLen = 0;
            }

            $batch[] = $text;
            $batchKeys[] = $key;
            $batchLen += $len;
        }

        $flushed = $this->flushSegmentBatch($batch, $batchKeys, $targetLanguageName, $result);
        if (($flushed['status'] ?? false) !== true) {
            return $flushed;
        }

        return ['status' => true, 'segments' => $result];
    }

    // FIX (DOM HTML translation): translate one batch and merge results back by original key.
    private function flushSegmentBatch(array $batch, array $batchKeys, string $targetLanguageName, array &$result): array
    {
        if (count($batch) === 0) {
            return ['status' => true];
        }

        $res = $this->openAi->translateTextSegments($batch, $targetLanguageName);
        if (($res['status'] ?? false) !== true) {
            return ['status' => false, 'message' => $res['error'] ?? 'Translation failed'];
        }

        $segmentsOut = $res['segments'] ?? [];
        foreach ($batchKeys as $localPos => $originalKey) {
            // Fall back to the source segment if the model dropped this local position.
            $result[$originalKey] = $segmentsOut[$localPos] ?? $batch[$localPos];
        }

        return ['status' => true];
    }
}
