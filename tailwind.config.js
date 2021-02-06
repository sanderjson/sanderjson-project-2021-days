module.exports = {
	purge: {
		content: [
			"./src/**/*.svelte",
			// may also want to include base index.html
		],
		// enabled: production,
	},
	theme: {
		extend: {
			fontSize: {
				"10xl": "10.25rem",
				"11xl": "12.75rem",
				"12xl": "15.50rem",
			},
		},
	},
	variants: {},
	// plugins: [require("@tailwindcss/aspect-ratio")],
	plugins: [require("@tailwindcss/forms")],
};
