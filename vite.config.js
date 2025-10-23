import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';


export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),

        VitePWA({
    registerType: 'autoUpdate',
    manifest: false,
    workbox: {
        runtimeCaching: [

            {
                urlPattern: ({ request }) => request.destination === 'document',
                handler: 'NetworkFirst',
                options: {
                    cacheName: 'pages-cache',
                    networkTimeoutSeconds: 5,
                    expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 }, // 1 hour
                },
            },

            {
                urlPattern: ({ request }) =>
                    request.destination === 'script' || request.destination === 'style',
                handler: 'StaleWhileRevalidate',
                options: {
                    cacheName: 'static-assets',
                    expiration: { maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 }, // 7 days
                },
            },

            {
                urlPattern: /^https:\/\/your-bucket-name\.s3\.amazonaws\.com\/.*/i,
                handler: 'NetworkFirst',
                options: {
                    cacheName: 's3-media',
                    expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 }, // 1 hour
                },
            },

            {
                urlPattern: ({ request }) => request.destination === 'image',
                handler: 'CacheFirst',
                options: {
                    cacheName: 'local-images',
                    expiration: { maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 },
                },
            },
        ],
    },
})

    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    pdf: ["html2pdf.js"],
                    react: ["react", "react-dom"],
                    inertia: ["@inertiajs/react", "@inertiajs/core"],
                    vendor: ["axios", "lodash"],
                },
            },
        },
        chunkSizeWarningLimit: 1000,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
            'asset': path.resolve(__dirname, 'public'),
        }
    }
});

