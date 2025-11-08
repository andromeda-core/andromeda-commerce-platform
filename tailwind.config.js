import forms from '@tailwindcss/forms';
import scrollbar from 'tailwind-scrollbar';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    darkMode: 'class',

    theme: {
        extend: {
            fontFamily: {
                outfit: ['Outfit', 'sans-serif'],
            },

            keyframes: {
                fadeInDown: {
                    '0%': { opacity: 0, transform: 'translateY(-20px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                },
                fadeOutUp: {
                    '0%': { opacity: 1, transform: 'translateY(0)' },
                    '100%': { opacity: 0, transform: 'translateY(-20px)' },
                },

                slideDown: {
                '0%': { transform: 'translateY(-100%)', opacity: '0' },
                '100%': { transform: 'translateY(0)', opacity: '1' },
            },
            scaleIn: {
                '0%': { transform: 'scale(0.9)', opacity: '0' },
                '100%': { transform: 'scale(1)', opacity: '1' },
            },
            'slide-up': {
                    '0%': { transform: 'translateY(100%)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
            },

            'fade-in-up': {
                    '0%': { opacity: '0', transform: 'translateY(50px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
            },

            },
            animation: {
                fadeInDown: 'fadeInDown 0.5s ease-in-out forwards',
                fadeOutUp: 'fadeOutUp 0.5s ease-in-out forwards',
                'slide-down': 'slideDown 0.3s ease-out',
                'scale-in': 'scaleIn 0.2s ease-out',
                'slide-up': 'slide-up 0.3s ease-out',
                'fade-in-up': 'fade-in-up 0.3s ease-out',


            },
            colors: {
                deepcharcoal: '#0D0E12',
            }
        },
    },

    plugins: [
        forms,
        scrollbar,
        typography,
        function ({ addUtilities }) {
            addUtilities({
                '.page-break': {
                    'page-break-before': 'always',
                },
                '.no-break': {
                    'page-break-inside': 'avoid',
                    'break-inside': 'avoid',
                },
            });
        },
    ],
};
