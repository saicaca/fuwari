---
title: Using custom fonts
published: 2024-07-15
description: A simple example of using custom fonts.
tags: [Markdown, Font, Demo]
category: Examples
draft: true
---


This guide will show you how to add web fonts to your project and use them in your components.


# Using a local font file


This example will demonstrate adding a custom font using the font file `DistantGalaxy.woff`.

1.  Add your font file to `public/fonts/`.
    
2.  Add the following `@font-face` statement to your CSS. This could be in a global `.css` file you import, a `<style is:global>` block, or a `<style>` block in a specific layout or component where you want to use this font.
    
        /* Register your custom font family and tell the browser where to find it. */
        @font-face {
            font-family: 'DistantGalaxy';
            src: url('/fonts/DistantGalaxy.woff') format('woff');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
        }
    
3.  Use the `font-family` value from the `@font-face` statement to style elements in your component or layout. In this example, the `<h1>` heading will have the custom font applied, while the paragraph `<p>` will not.

        //The following code is located at "src/pages/..example.astro":
        ---
        ---
        <h1>In a galaxy far, far away...</h1>

        <p>Custom fonts make my headings much cooler!</p>

        <style>
        h1 {
            font-family: 'DistantGalaxy', sans-serif;
        }
        </style>
    
----------------
# Using Fontsource


The [Fontsource](https://fontsource.org/) project simplifies using Google Fonts and other open-source fonts. It provides npm modules you can install for the fonts you want to use.

1.  Find the font you want to use in [Fontsource’s catalog](https://fontsource.org/). This example will use [Twinkle Star](https://fontsource.org/fonts/twinkle-star).
    
2.  Install the package for your chosen font.
    
    *   npm
    
            npm install @fontsource/twinkle-star
    
    *   pnpm
    
            pnpm add @fontsource/twinkle-star

    *   Yarn

            yarn add @fontsource/twinkle-star

    :::tip
    You’ll find the correct package name in the “Quick Installation” section of each font page on Fontsource’s website. It will start with `@fontsource/` or `@fontsource-variable/` followed by the name of the font.
    :::

3.  Import the font package in the component where you want to use the font. Usually, you will want to do this in a common layout component to make sure the font is available across your site.
    
    The import will automatically add the necessary `@font-face` rules needed to set up the font.

        //The following code is located at "src/layouts/Layout.astro":
        ---
        import '@fontsource/twinkle-star';
        ---
    
4.  Use the font’s name as shown in the `body` example on its Fontsource page as the `font-family` value. This will work anywhere you can write CSS in your Astro project.
    
        h1 {
            font-family: "Twinkle Star", cursive;
        }
    
--------------------------
# Register fonts in Tailwind


If you are using the [Tailwind integration](/en/guides/integrations-guide/tailwind/), you can use either of the previous methods on this page to install your font, with some modification. You can either add an [`@font-face` statement for a local font](#using-a-local-font-file) or use [Fontsource’s `import` strategy](#using-fontsource) to install your font.

To register your font in Tailwind:

1.  Follow either of the guides above, but skip the final step of adding `font-family` to your CSS.
    
2.  Add the typeface name to `tailwind.config.mjs`.
    
    This example adds `Inter` to the sans-serif font stack, with default fallback fonts from Tailwind CSS.
    
    
        //The following code is located at "src/pages/tailwind.config.mjs":
    
        import defaultTheme from 'tailwindcss/defaultTheme'

        /** @type {import('tailwindcss').Config} */
        export default {
        content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
        theme: {
            extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
            },
            },
        },
        plugins: [],
        }
    
    Now, all sans-serif text (the default with Tailwind) in your project will use your chosen font and the `font-sans` class will also apply the Inter font.
    

See [Tailwind’s docs on adding custom font families](https://tailwindcss.com/docs/font-family#using-custom-values) for more information.

--------------
# More resources


*   Learn how web fonts work in [MDN’s web fonts guide](https://developer.mozilla.org/en-US/docs/Learn/CSS/Styling_text/Web_fonts).
*   Generate CSS for your font with [Font Squirrel’s Webfont Generator](https://www.fontsquirrel.com/tools/webfont-generator).
