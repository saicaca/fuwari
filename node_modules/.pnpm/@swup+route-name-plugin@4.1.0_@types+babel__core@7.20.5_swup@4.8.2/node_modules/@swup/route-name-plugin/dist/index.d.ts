import Plugin from '@swup/plugin';
import { matchPath } from 'swup';
import type { Visit } from 'swup';
declare module 'swup' {
    interface VisitFrom {
        /** Identified route name */
        route?: string;
    }
    interface VisitTo {
        /** Identified route name */
        route?: string;
    }
}
type Route = {
    /** The name of the route. */
    name: string;
    /** The path pattern to match the URL against. */
    path: string;
};
type CompiledRoute = Route & {
    /** Match function to check if the pattern matches a given URL */
    matches: MatchFunction;
};
type MatchOptions = Parameters<typeof matchPath>[1];
type MatchFunction = ReturnType<typeof matchPath>;
type Options = {
    /** Array of patterns for identifying named routes. */
    routes: Route[];
    /** Default route name if no match was found. */
    unknownRoute: string;
    /** Options for matching paths. Directly passed into `path-to-regexp`. */
    matchOptions: MatchOptions;
    /** Add classnames for raw URLs. */
    paths: boolean;
};
export default class SwupRouteNamePlugin extends Plugin {
    name: string;
    requires: {
        swup: string;
    };
    defaults: Options;
    options: Options;
    routes: CompiledRoute[];
    constructor(options?: Partial<Options>);
    mount(): void;
    compileRoutePatterns(): {
        name: string;
        matches: import("path-to-regexp").MatchFunction<object>;
        /** The path pattern to match the URL against. */
        path: string;
    }[];
    sanitizeRouteName(name: string): string;
    getRouteName(path: string): string | undefined;
    getPathName(path: string): string;
    addRouteKey(visit: Visit): void;
    addRouteClasses(visit: Visit): void;
    addPathClasses(visit: Visit): void;
    removeClasses(): void;
    updateHistory(visit: Visit): void;
}
export {};
