import { matchPath } from 'swup';
import type { Swup, Path, Visit } from 'swup';
import type { Route, Rule, Predicate } from './defs.js';
import Logger from './Logger.js';
type Options = Rule & {
    swup: Swup;
    logger?: Logger;
};
/**
 * Represents a Rule
 */
export default class ParsedRule {
    readonly matchesFrom: ReturnType<typeof matchPath>;
    readonly matchesTo: ReturnType<typeof matchPath>;
    swup: Swup;
    from: Path;
    to: Path;
    containers: string[];
    name?: string;
    scroll: boolean | string;
    focus?: boolean | string;
    logger?: Logger;
    if: Predicate;
    constructor(options: Options);
    /**
     * Parse provided fragment containers
     */
    parseContainers(rawContainers: string[]): string[];
    /**
     * Validate a fragment selector
     *
     * - only IDs are allowed
     * - no nested selectors
     */
    validateSelector(selector: string): true | Error;
    /**
     * Get debug info for logging
     */
    getDebugInfo(): {
        from: string;
        to: string;
        containers: string;
    };
    /**
     * Checks if a given route matches this rule
     */
    matches(route: Route, visit: Visit): boolean;
    /**
     * Validates a fragment element at runtime when this rule's route matches
     */
    validateFragmentSelectorForMatch(selector: string): true | Error;
}
export {};
//# sourceMappingURL=ParsedRule.d.ts.map