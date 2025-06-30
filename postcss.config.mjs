import postcssImport from "postcss-import";
import tailwindcss from "tailwindcss";
import postcssNesting from "tailwindcss/nesting/index.js";

export default {
	plugins: {
		"postcss-import": postcssImport, // to combine multiple css files
		"tailwindcss/nesting": postcssNesting,
		tailwindcss: tailwindcss,
	},
};
