/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				scaryHalloween: ['ScaryHalloweenFont']
			},
			colors: {
				'orange-primary': '#E57F31',
				'orange-primary-darken': '#DC701D',
				'white-secondary': '#E5E2D9'
			}
		}
	},
	plugins: []
};
