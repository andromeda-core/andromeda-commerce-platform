import { create } from "zustand";

export const useHomeNavStore = create((set) => ({
    navigatingHome: false,

    startHomeNavigation: () => set({ navigatingHome: true }),
    endHomeNavigation: () => set({ navigatingHome: false }),
}));
