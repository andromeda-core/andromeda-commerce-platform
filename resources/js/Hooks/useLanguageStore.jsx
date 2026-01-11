import { create } from 'zustand';
import axios from 'axios';

export const useLanguageStore = create((set, get) => ({
    languages: [],
    translations: [],
    activeLanguageId: null,
    activeLanguageLocale: null,
    loading: false,
    isLoaded: false,


    setLanguageLocale: (locale) => set({ activeLanguageLocale: locale }),
    setLanguageId: (localeId) => set({ activeLanguageId: localeId }),
    fetchLanguages: async (force = false) => {
        if (get().isLoaded && !force) return;

        set({ loading: true });
        try {
            const response = await axios.get(route('website.languages-translations.getalljson'));
            set({
                languages: response.data.data.languages,
                translations: response.data.data.translations,
                isLoaded: true,
                loading: false
            });

        } catch (error) {
            console.error("Language fetch error:", error);
            set({ loading: false });
        }
    },
}));
