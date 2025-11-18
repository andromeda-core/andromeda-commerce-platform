import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

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

