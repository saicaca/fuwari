import PluginBase from '@swup/plugin';
import ParsedRule from './inc/ParsedRule.js';
import Logger from './inc/Logger.js';
import type { Options, Rule, Route, FragmentVisit } from './inc/defs.js';
import type { Visit } from 'swup';
type RequireKeys<T, K extends keyof T> = Partial<T> & Pick<T, K>;
type InitOptions = RequireKeys<Options, 'rules'>;
/**
 * The main plugin class
 */
export default class SwupFragmentPlugin extends PluginBase {
    readonly name = "SwupFragmentPlugin";
    readonly requires: {
        swup: string;
    };
    protected _rawRules: Rule[];
    protected _parsedRules: ParsedRule[];
    get parsedRules(): ParsedRule[];
    options: Options;
    protected defaults: Options;
    logger?: Logger;
    /**
     * Plugin Constructor
     * The options are NOT optional and need to contain at least a `rules` property
     */
    constructor(options: InitOptions);
    /**
     * Runs when the plugin is being mounted
     */
    mount(): void;
    /**
     * Runs when the plugin is being unmounted
     */
    unmount(): void;
    /**
     * Set completely new rules
     *
     * @access public
     */
    setRules(rules: Rule[]): void;
    /**
     * Get a clone of the current rules
     *
     * @access public
     */
    getRules(): Rule[];
    /**
     * Prepend a rule to the existing rules
     *
     * @access public
     */
    prependRule(rule: Rule): void;
    /**
     * Append a rule to the existing rules
     *
     * @access public
     */
    appendRule(rule: Rule): void;
    /**
     * Parse a rule (for e.g. debugging)
     *
     * @access public
     */
    parseRule(rule: Rule): ParsedRule;
    /**
     * Get the fragment visit object for a given route
     *
     * @access public
     */
    getFragmentVisit(route: Route, visit?: Visit): FragmentVisit | undefined;
}
export {};
//# sourceMappingURL=SwupFragmentPlugin.d.ts.map