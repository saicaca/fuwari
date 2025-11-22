import { type AstroIntegration } from 'astro';
import type { Rule as FragmentRule } from '@swup/fragment-plugin';
export interface Options {
    accessibility: boolean;
    animationClass: string | false;
    cache: boolean;
    containers: string[];
    debug: boolean;
    forms: boolean;
    fragments: null | FragmentRule[];
    globalInstance: boolean;
    ignore: (string | RegExp)[] | ((url: string, { el, event }: {
        el?: Element;
        event?: Event;
    }) => boolean);
    loadOnIdle: boolean;
    parallel: boolean | string[];
    morph: string[] | false;
    native: boolean;
    preload: boolean | {
        hover: boolean;
        visible: boolean;
    };
    progress: boolean;
    reloadScripts: boolean;
    routes: true | false | Route[];
    smoothScrolling: boolean;
    theme: Theme | [Theme, ThemeOptions] | false;
    updateBodyClass: boolean;
    updateHead: boolean;
}
export declare enum Theme {
    fade = "fade",
    slide = "slide",
    overlay = "overlay"
}
export type ThemeOptions = Record<string, unknown>;
export interface Route {
    name: string;
    path: string | RegExp;
}
export default function createPlugin(options?: Partial<Options>): AstroIntegration;
