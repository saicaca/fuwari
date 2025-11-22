import { AstPseudoClassArgument, AstPseudoElementArgument } from './ast.js';
export type PseudoClassType = Exclude<'NoArgument' | AstPseudoClassArgument['type'], 'Substitution'>;
export type PseudoElementType = Exclude<'NoArgument' | AstPseudoElementArgument['type'], 'Substitution'>;
export type CssLevel = 'css1' | 'css2' | 'css3' | 'selectors-3' | 'selectors-4' | 'latest' | 'progressive';
/**
 * CSS Selector Syntax Definition can be used to define custom CSS selector parsing rules.
 */
export interface SyntaxDefinition {
    /**
     * When specified, syntax will be based on the specified predefined CSS standard.
     * If not specified, syntax will be defined from scratch.
     */
    baseSyntax?: CssLevel;
    /**
     * Additional CSS modules to include in the syntax definition.
     * These are specific CSS modules that add new selectors or modify existing ones.
     * @example ['css-position-4', 'css-scoping-1']
     */
    modules?: CssModule[];
    /**
     * CSS Tag (type).
     * @example div
     * @see https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Selectors/Type_Class_and_ID_Selectors
     */
    tag?: {
        /**
         * Allows using wildcard (*).
         */
        wildcard?: boolean;
    } | boolean;
    /**
     * CSS3 Namespaces.
     * @example ns|div
     * @see https://www.w3.org/TR/css3-namespace/
     */
    namespace?: {
        /**
         * Allows using wildcard (*).
         */
        wildcard?: boolean;
    } | boolean;
    /**
     * CSS IDs (yes, there can be multiple).
     * @example #root#root
     * @see https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Selectors/Type_Class_and_ID_Selectors
     */
    ids?: boolean;
    /**
     * CSS Class Names
     * @example .element.highlighted
     * @see https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Selectors/Type_Class_and_ID_Selectors
     */
    classNames?: boolean;
    /**
     * CSS selector rule nesting combinators.
     * @example div.class > span
     * @see https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Selectors/Combinators
     */
    combinators?: string[];
    /**
     * CSS Attribute Selector.
     * @example [href="#"]
     * @see https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Selectors/Attribute_selectors
     */
    attributes?: {
        /**
         * Attribute comparison operator list.
         * @example ['=', '~=', '|=', '^=', '$=', '*=']
         * @see https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors#syntax
         */
        operators?: string[];
        /**
         * How to handle unknown case sensitivity modifiers.
         * `accept` - still parse.
         * `reject` - throw an error.
         */
        unknownCaseSensitivityModifiers?: 'accept' | 'reject';
        /**
         * List of pre-defined case sensitivity modifiers.
         * @example ['i', 'I', 's', 'S']
         * @see https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors#syntax
         */
        caseSensitivityModifiers?: string[];
    } | false;
    /**
     * CSS Pseudo-elements.
     * @example ::before
     * @see https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Selectors/Pseudo-classes_and_pseudo-elements
     */
    pseudoElements?: {
        /**
         * How to handle unknown pseudo-elements.
         * `accept` - still parse.
         * `reject` - throw an error.
         */
        unknown?: 'accept' | 'reject';
        /**
         * In the past pseudo selements were defined starting with a single colon.
         * Later this notation changed to double colon.
         */
        notation?: 'singleColon' | 'doubleColon' | 'both';
        /**
         * List of predefined pseudo-elements. If string array is specified, the pseudo-elements are assumed to be
         * NoArgument.
         * @example ['before', 'after']
         * @example {NoArgument: ['before', 'after'], String: ['highlight'], Selector: ['slotted']}
         */
        definitions?: string[] | {
            [K in PseudoElementType]?: string[];
        };
    } | false;
    /**
     * CSS Pseudo-classes.
     * @example :nth-child(2n+1)
     * @see https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Selectors/Pseudo-classes_and_pseudo-elements
     */
    pseudoClasses?: {
        /**
         * How to handle unknown pseudo-classes.
         * `accept` - still parse.
         * `reject` - throw an error.
         */
        unknown?: 'accept' | 'reject';
        /**
         * Predefined pseudo-classes.
         * @example {NoArgument: ['first-child'], Formula: ['nth-child'], String: ['dir'], Selector: ['not']}
         */
        definitions?: {
            [K in PseudoClassType]?: string[];
        };
    } | false;
}
interface SyntaxDefinitionXmlOptions {
    wildcard?: boolean;
}
export declare function getXmlOptions(param: SyntaxDefinitionXmlOptions | boolean | undefined): SyntaxDefinitionXmlOptions;
type MergeMethod<T> = (base: T, extension: T) => T;
export declare const extendSyntaxDefinition: MergeMethod<SyntaxDefinition>;
/**
 * CSS Modules with their syntax definitions.
 * These can be used to extend the parser with specific CSS modules.
 *
 * @example
 * // Using the css-position-3 module
 * createParser({ modules: ['css-position-3'] })
 */
export declare const cssModules: {
    'css-position-1': {
        latest: false;
        pseudoClasses: {
            definitions: {
                NoArgument: string[];
            };
        };
    };
    'css-position-2': {
        latest: false;
        pseudoClasses: {
            definitions: {
                NoArgument: string[];
            };
        };
    };
    'css-position-3': {
        latest: false;
        pseudoClasses: {
            definitions: {
                NoArgument: string[];
            };
        };
    };
    'css-position-4': {
        latest: true;
        pseudoClasses: {
            definitions: {
                NoArgument: string[];
            };
        };
    };
    'css-scoping-1': {
        latest: true;
        pseudoClasses: {
            definitions: {
                NoArgument: string[];
                Selector: string[];
            };
        };
        pseudoElements: {
            definitions: {
                Selector: string[];
            };
        };
    };
    'css-pseudo-4': {
        latest: true;
        pseudoElements: {
            definitions: {
                NoArgument: string[];
                String: string[];
            };
        };
    };
    'css-shadow-parts-1': {
        latest: true;
        pseudoElements: {
            definitions: {
                String: string[];
            };
        };
    };
};
/**
 * CSS Module name.
 * @example 'css-position-3'
 * @example 'css-scoping-1'
 */
export type CssModule = keyof typeof cssModules;
/**
 * Maps pseudo-classes and pseudo-elements to their CSS Level or CSS Module
 */
export interface PseudoLocationIndex {
    pseudoClasses: Record<string, string[]>;
    pseudoElements: Record<string, string[]>;
}
export declare const cssSyntaxDefinitions: Record<CssLevel, SyntaxDefinition>;
/**
 * Builds an index of where each pseudo-class and pseudo-element is defined
 * (in which CSS Level or CSS Module)
 */
export declare function buildPseudoLocationIndex(): PseudoLocationIndex;
export declare const pseudoLocationIndex: PseudoLocationIndex;
export {};
