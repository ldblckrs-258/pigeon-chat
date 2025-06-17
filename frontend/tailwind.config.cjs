/** @type {import('tailwindcss').Config} */
const fluid = require('fluid-tailwind')
const containerQueries = require('@tailwindcss/container-queries')

const { extract, screens, fontSize } = fluid

module.exports = {
	content: {
		files: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
		extract,
	},
	// Add safelist to ensure fluid classes are not purged
	safelist: [
		// Safelist common fluid patterns
		{ pattern: /~size-.+/ },
		{ pattern: /~w-.+/ },
		{ pattern: /~h-.+/ },
		{ pattern: /~p-.+/ },
		{ pattern: /~m-.+/ },
		{ pattern: /~text-.+/ },
		{ pattern: /~gap-.+/ },
		{ pattern: /~space-.+/ },
		{ pattern: /~rounded-.+/ },
		// Add specific classes used in your components
		'~size-2/2.5',
		'~size-6/7',
		'~size-8/9',
		'~size-8/10',
		'~size-9/10',
		'~size-10/12',
		'~size-12/16',
		'~w-[24rem]/[28rem]',
		'~py-4/6',
	],
	theme: {
		screens,
		fontSize,
		extend: {
			screens: {
				xs: '28rem',
			},
			fontFamily: {
				sans: ['Open Sans', 'sans-serif'],
				lora: ['Lora', 'serif'],
				oxygenMono: ['Oxygen Mono', 'monospace'],
			},
			colors: {
				primary: {
					50: '#f1f9fa',
					100: '#dbedf2',
					200: '#bbdce6',
					300: '#8cc2d4',
					400: '#4793af',
					500: '#3a83a0',
					600: '#336c87',
					700: '#2f586f',
					800: '#2d4a5d',
					900: '#2a404f',
					950: '#172835',
				},
				secondary: {
					50: '#fdf4f3',
					100: '#fbe7e5',
					200: '#f9d4cf',
					300: '#f4b5ad',
					400: '#ec897d',
					500: '#dd5746',
					600: '#cb4837',
					700: '#ab392a',
					800: '#8e3226',
					900: '#762f26',
					950: '#40150f',
				},
				mantis: {
					50: '#f5faf3',
					100: '#e8f5e3',
					200: '#d1eac8',
					300: '#add89d',
					400: '#88c273',
					500: '#5ea245',
					600: '#498534',
					700: '#3b692c',
					800: '#325427',
					900: '#2a4522',
					950: '#13250e',
				},
			},
			boxShadow: {
				custom: '2px 2px 8px 0px rgba(0, 0, 0, 0.25)',
			},
		},
	},
	plugins: [fluid, containerQueries],
}
