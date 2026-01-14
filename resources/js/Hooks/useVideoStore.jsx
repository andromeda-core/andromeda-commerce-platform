import { create } from 'zustand';
import getCookie from './useGetCookie';

export const useVideoStore = create((set, get) => ({
    videoRefs: {},
    activeVideoSlug: null,
    autoplay: false,

    // Register a video player instance
    registerVideo: (instanceId, playerMethods) => {
        set((state) => ({
            videoRefs: {
                ...state.videoRefs,
                [instanceId]: playerMethods
            }
        }));
    },

    // Unregister a video player instance
    unregisterVideo: (instanceId) => {
        set((state) => {
            const { [instanceId]: _, ...rest } = state.videoRefs;
            return { videoRefs: rest };
        });
    },

    // Set active video by slug (controls all instances with matching slug)
    setActiveVideo: (slug) => {
        const state = get();

        // Early return if no change
        if (state.activeVideoSlug === slug) return;

        const { videoRefs, autoplay } = state;
        const entries = Object.entries(videoRefs);

        // Batch pause operations
        entries.forEach(([instanceId, methods]) => {
            if (!methods?.getSlug) return;

            if (methods.getSlug() !== slug) {
                try {
                    methods.pause();
                } catch (e) {
                    console.error('[VideoStore] Pause error:', instanceId, e);
                }
            }
        });

        set({ activeVideoSlug: slug });

        // Auto-play if enabled
        if (autoplay && slug) {
            setTimeout(() => {
                const currentRefs = get().videoRefs;

                Object.entries(currentRefs).forEach(([instanceId, methods]) => {
                    if (!methods?.getSlug) return;

                    if (methods.getSlug() === slug) {
                        methods.play().catch(e => {
                            console.error('[VideoStore] Autoplay error:', instanceId, e);
                        });
                    }
                });
            }, 200);
        }
    },

    // Pause all video instances
    pauseAll: () => {
        const { videoRefs } = get();

        Object.entries(videoRefs).forEach(([instanceId, methods]) => {
            if (methods?.pause) {
                try {
                    methods.pause();
                } catch (e) {
                    console.error('[VideoStore] Pause all error:', instanceId, e);
                }
            }
        });

        set({ activeVideoSlug: null });
    },

    // Pause specific instance
    pauseVideo: (instanceId) => {
        const methods = get().videoRefs[instanceId];

        if (methods?.pause) {
            try {
                methods.pause();
            } catch (e) {
                console.error('[VideoStore] Pause error:', instanceId, e);
            }
        }
    },

    // Play specific instance
    playVideo: async (instanceId) => {
        const methods = get().videoRefs[instanceId];

        if (methods?.play) {
            try {
                await methods.play();
            } catch (e) {
                console.error('[VideoStore] Play error:', instanceId, e);
            }
        }
    },



    // Initialize autoplay from cookie
    initAutoplay: () => {
        try {
            const raw = getCookie('post_preferences');
            if (!raw) {
                set({ autoplay: false });
                return;
            }

            const prefs = JSON.parse(raw);
            set({ autoplay: Boolean(prefs.video_autoplay) });

        } catch (e) {
            console.error('initAutoplay error', e);
            set({ autoplay: false });
        }
    },
}));
