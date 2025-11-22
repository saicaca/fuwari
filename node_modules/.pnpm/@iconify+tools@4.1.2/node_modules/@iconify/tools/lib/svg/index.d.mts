import * as cheerio from 'cheerio';
import { IconifyIcon } from '@iconify/types';
export { IconifyIcon } from '@iconify/types';
import { IconifyIconCustomisations } from '@iconify/utils/lib/customisations/defaults';
export { IconifyIconCustomisations } from '@iconify/utils/lib/customisations/defaults';

interface ViewBox {
    left: number;
    top: number;
    width: number;
    height: number;
}

/**
 * SVG class, used to manipulate icon content.
 */
declare class SVG {
    $svg: cheerio.CheerioAPI;
    viewBox: ViewBox;
    /**
     * Constructor
     */
    constructor(content: string);
    /**
     * Get SVG as string
     */
    toString(customisations?: IconifyIconCustomisations): string;
    /**
     * Get SVG as string without whitespaces
     */
    toMinifiedString(customisations?: IconifyIconCustomisations): string;
    /**
     * Get SVG as string with whitespaces
     */
    toPrettyString(customisations?: IconifyIconCustomisations): string;
    /**
     * Get body
     */
    getBody(): string;
    /**
     * Get icon as IconifyIcon
     */
    getIcon(): IconifyIcon;
    /**
     * Load SVG
     *
     * @param {string} content
     */
    load(content: string): void;
}

export { SVG, type ViewBox };
