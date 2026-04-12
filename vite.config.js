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
                navigateFallback: null,

                runtimeCaching: [
                    {
                        urlPattern: ({ request }) => request.destination === 'image',
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'images-cache',
                            expiration: {
                                maxEntries: 80,
                                maxAgeSeconds: 7 * 24 * 60 * 60,
                            },
                        },
                    },

                    {
                        urlPattern: ({ request }) =>
                            request.destination === 'style' || request.destination === 'script',
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'assets-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 24 * 60 * 60,
                            },
                        },
                    },

                    {
                        urlPattern: ({ request }) => request.destination === 'document',
                        handler: 'NetworkOnly',
                    },
                ],
            },
        }),
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    pdf: ['html2pdf.js'],
                    react: ['react', 'react-dom'],
                    inertia: ['@inertiajs/react', '@inertiajs/core'],
                    vendor: ['axios', 'lodash'],
                },
            },
        },
        chunkSizeWarningLimit: 1000,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
            asset: path.resolve(__dirname, 'public'),
        },
    },
});
