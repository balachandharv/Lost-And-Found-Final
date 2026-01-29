/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Add custom colors here to match "Antigravity" aesthetic if needed later
                // For now, we'll rely on Tailwind's palette and add custom ones as we see the component designs
            },
        },
    },
    plugins: [],
}
