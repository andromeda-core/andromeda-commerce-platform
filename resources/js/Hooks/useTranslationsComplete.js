// Pure, framework-agnostic guard helper for the translations repeater.
// Returns true if EVERY open translation block is complete (or there are no blocks).
// State is derived from data.translations only — no localStorage/sessionStorage.
export function areTranslationsComplete(translations, requiredFields) {
    if (!Array.isArray(translations) || translations.length === 0) return true;

    const isEmpty = (v) => {
        if (v === null || v === undefined) return true;
        let s = String(v);
        // strip HTML tags + nbsp for richtext, then trim
        s = s.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
        return s.length === 0;
    };

    return translations.every((block) => {
        if (!block || !block.language_id) return false;
        const fields = block.fields || {};

        // required text fields
        for (const key of requiredFields) {
            if (isEmpty(fields[key])) return false;
        }

        // product_details: optional, but any present row must be fully filled
        const pd = fields.product_details;
        if (Array.isArray(pd) && pd.length > 0) {
            for (const row of pd) {
                if (isEmpty(row?.title) || isEmpty(row?.value)) return false;
            }
        }

        return true;
    });
}
