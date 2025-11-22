import type { AstroIntegration } from 'astro';
type TailwindOptions = {
    /**
     * Path to your tailwind config file
     * @default 'tailwind.config.mjs'
     */
    configFile?: string;
    /**
     * Apply Tailwind's base styles
     * Disabling this is useful when further customization of Tailwind styles
     * and directives is required. See {@link https://tailwindcss.com/docs/functions-and-directives#tailwind Tailwind's docs}
     * for more details on directives and customization.
     * @default true
     */
    applyBaseStyles?: boolean;
    /**
     * Add CSS nesting support using `tailwindcss/nesting`. See {@link https://tailwindcss.com/docs/using-with-preprocessors#nesting Tailwind's docs}
     * for how this works with `postcss-nesting` and `postcss-nested`.
     */
    nesting?: boolean;
};
export default function tailwindIntegration(options?: TailwindOptions): AstroIntegration;
export {};
