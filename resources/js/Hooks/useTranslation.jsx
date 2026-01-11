import { useLanguageStore } from "./useLanguageStore";


export function useTranslation() {
    const { translations, loading } = useLanguageStore();

    const __ = (key, normalize = false) => {
        if (loading) {
            if (normalize) {
                return 'Loading';
            } else {
                return <span className="animate-pulse">Loading....</span>;
            }
        };
        if (translations) {
            const match = translations.find(
                t => t.translation_keys?.key === key
            );

            if (match && match.value) {
                return match.value;
            }
        }

        return key;
    };

    return { __ };
}
