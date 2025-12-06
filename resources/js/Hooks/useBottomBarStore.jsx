import { create } from 'zustand';

export const useBottomBarStore = create((set) => ({
    isVisible: true,
    barHeight: 0,

    setVisible: (visible) => set({ isVisible: visible }),
    toggleVisibility: () => set((state) => ({ isVisible: !state.isVisible })),
    setBarHeight: (height) => set({ barHeight: height }),
}));
