/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,svelte,ts,tsx,mjs}"],
  darkMode: "class", // allows toggling dark mode manually
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Noto Sans SC",
          "Source Han Sans SC",
          "Source Han Sans",
          "PingFang SC",
          "Microsoft YaHei",
          "Segoe UI",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
          ...defaultTheme.fontFamily.sans,
        ],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
