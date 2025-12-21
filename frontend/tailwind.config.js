/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'cyber-black': '#0a0a0a',
                'cyber-gray': '#1a1a1a',
                'neon-green': '#00ff41',
                'neon-blue': '#00f3ff',
                'neon-red': '#ff003c',
            },
            fontFamily: {
                mono: ['"Fira Code"', 'monospace'],
            },
        },
    },
    plugins: [],
}
