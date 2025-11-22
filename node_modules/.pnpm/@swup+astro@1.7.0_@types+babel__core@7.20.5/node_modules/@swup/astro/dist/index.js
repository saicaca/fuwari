import {} from 'astro';
import { buildInitScript } from './script.js';
export var Theme;
(function (Theme) {
    Theme["fade"] = "fade";
    Theme["slide"] = "slide";
    Theme["overlay"] = "overlay";
})(Theme || (Theme = {}));
export default function createPlugin(options = {}) {
    return {
        name: '@swup/astro',
        hooks: {
            'astro:config:setup': ({ injectScript }) => {
                const script = buildInitScript(options);
                injectScript('page', script);
            }
        }
    };
}
