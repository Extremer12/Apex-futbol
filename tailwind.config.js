/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                apex: {
                    dark: '#0A0E17',
                    darker: '#060A12',
                    card: 'rgba(15, 20, 35, 0.8)',
                    border: 'rgba(200, 168, 78, 0.15)',
                    'border-active': 'rgba(200, 168, 78, 0.4)',
                    gold: '#C8A84E',
                    'gold-light': '#FFD700',
                    'gold-dim': 'rgba(200, 168, 78, 0.3)',
                    'text-secondary': '#8A8FA3',
                    'text-muted': '#5A5F73',
                    green: '#4CAF50',
                    'green-light': '#66BB6A',
                    red: '#EF5350',
                    'red-dim': 'rgba(239, 83, 80, 0.15)',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fade-in 0.3s ease-out',
                'slide-up': 'slide-up 0.4s ease-out',
                'slide-down': 'slide-down 0.3s ease-out',
                'scale-in': 'scale-in 0.3s ease-out',
                'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
                'shimmer-gold': 'shimmer-gold 3s infinite',
                'float': 'float 3s ease-in-out infinite',
            },
            keyframes: {
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'slide-up': {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'slide-down': {
                    '0%': { opacity: '0', transform: 'translateY(-10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'scale-in': {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                'glow-pulse': {
                    '0%, 100%': { boxShadow: '0 0 15px rgba(200, 168, 78, 0.1)' },
                    '50%': { boxShadow: '0 0 25px rgba(200, 168, 78, 0.25)' },
                },
                'shimmer-gold': {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' },
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-6px)' },
                },
            },
            borderRadius: {
                '2xl': '1rem',
                '3xl': '1.5rem',
            },
        },
    },
    plugins: [],
}
