import '../css/app.css';
import './bootstrap';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

router.on('before', () => {
    try {
        const current = window.location.pathname + window.location.search;
        // Sirf shop/bookmarks origins store karo, feed/product/post nahi
        if (current.includes('/shop') || current.includes('/bookmarks')) {
            sessionStorage.setItem('andromeda_prev_url', current);
        } else if (
            current === '/' ||
            current.startsWith('/post/') ||
            current.startsWith('/product/')
        ) {
            sessionStorage.removeItem('andromeda_prev_url');
        }
    } catch (e) {}
});
function generateDeviceFingerprint() {
    const raw = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        Intl.DateTimeFormat().resolvedOptions().timeZone,
    ].join('|');

    return btoa(raw).substring(0, 128);
}

createInertiaApp({
    title: (title) => {
        // Get the app name from the current page props if available
        const page = document.getElementById('app')?.dataset?.page;
        let appName = import.meta.env.VITE_APP_NAME || 'Laravel';

        if (page) {
            try {
                const parsed = JSON.parse(page);

                appName = parsed.props.generalSetting?.app_name || 'Laravel';
            } catch (e) {
                console.warn('Failed to parse Inertia page:', e);
            }
        }

        return `${title} - ${appName}`;
    },
    resolve: (name) =>
        resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),

    setup({ el, App, props }) {
        const root = createRoot(el);

        if (!window.__fingerprintSent) {
            window.__fingerprintSent = true;

            const fingerprint = generateDeviceFingerprint();

            axios
                .post(route('device-fingerprint.store'), { device_fingerprint: fingerprint })
                .catch(() => {});
        }

        root.render(<App {...props} />);
    },
    progress: {
        color: 'var(--primary-progress-color)',
        showSpinner: true,
    },
});
