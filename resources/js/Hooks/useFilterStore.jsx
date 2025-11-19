import { create } from "zustand";

export const useFilterStore = create((set) => ({
    isOpen: false,

    setIsOpen: (value) => set({ isOpen: value }),
}));
