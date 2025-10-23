import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import Swal from 'sweetalert2';

import { registerSW } from 'virtual:pwa-register';
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

        root.render(<App {...props} />);
    },
    progress: {
        color: '#ffffff',
        showSpinner: true,
    },
});

registerSW({
    immediate: true,

    onNeedRefresh() {
        Swal.fire({
            icon: 'info',
            title: 'New version available',
            text: 'A newer version of this app is available. Refresh to update?',
            confirmButtonText: 'Refresh Now',
            showCancelButton: true,
            cancelButtonText: 'Later',
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#64748b',
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.reload(true);
            }
        });
    },

    onOfflineReady() {
        Swal.fire({
            icon: 'success',
            title: 'Offline Ready',
            text: 'You can now use the app even without an internet connection!',
            confirmButtonColor: '#4f46e5',
        });
    },
});

window.addEventListener('offline', () => {
    Swal.fire({
        icon: 'warning',
        title: "You're offline",
        text: 'No internet connection detected, but you can still browse saved pages and content.',
        confirmButtonColor: '#4f46e5',
    });
});

window.addEventListener('online', () => {
    Swal.fire({
        icon: 'success',
        title: 'Back Online',
        text: 'Internet connection restored. You’re now browsing live content.',
        timer: 3000,
        showConfirmButton: false,
    });
});
