/** @type {import('tailwindcss').Config} */
module.exports = {
    // Asegúrate de que tus rutas de archivos de contenido sean correctas
    content: [
        './app/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
        './pages/**/*.{js,ts,jsx,tsx}',
        './src/**/*.{js,ts,jsx,tsx}',
        './public/**/*.html',
        './node_modules/some-external-library/**/*.js',
    ],
    theme: {
        extend: {},
    },
    // Plugins vacío, compatible con v3.x
    plugins: [],
};
