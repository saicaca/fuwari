import { AstSelector } from './ast.js';
import { CssLevel, SyntaxDefinition, CssModule } from './syntax-definitions.js';
/**
 * This error is thrown when parser encounters problems in CSS string.
 * On top of the usual error, it has `position` property to indicate where in the input string the error happened.
 */
export interface ParserError extends Error {
    message: string;
    name: 'ParserError';
    position: number;
}
/**
 * Parses CSS selector string and returns CSS selector AST.
 * @throws {ParserError}
 */
export type Parser = (input: string) => AstSelector;
/**
 * Creates a parse function to be used later to parse CSS selectors.
 */
export declare function createParser(options?: {
    /**
     * CSS Syntax options to be used for parsing.
     * Can either be one of the predefined CSS levels ({@link CssLevel}) or a more detailed syntax definition ({@link SyntaxDefinition}).
     * Default: `"latest"`
     */
    syntax?: CssLevel | SyntaxDefinition;
    /**
     * Flag to enable substitutes.
     * This is not part of CSS syntax, but rather a useful feature to pass variables into CSS selectors.
     * Default: `false`
     * @example "[attr=$variable]"
     */
    substitutes?: boolean;
    /**
     * CSS selector parser in modern browsers is very forgiving. For instance, it works fine with unclosed attribute
     * selectors: `"[attr=value"`.
     * Set to `false` in order to mimic browser behaviour.
     * Default: `true`
     */
    strict?: boolean;
    /**
     * Additional CSS modules to include in the syntax definition.
     * These are specific CSS modules that add new selectors or modify existing ones.
     * @example ['css-position-3', 'css-scoping-1']
     */
    modules?: CssModule[];
}): Parser;
