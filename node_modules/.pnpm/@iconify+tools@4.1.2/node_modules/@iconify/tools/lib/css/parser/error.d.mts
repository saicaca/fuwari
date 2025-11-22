interface StyleParseError {
    type: 'style-parse-error';
    message: string;
    code: string;
    index?: number;
    fullMessage: string;
}
/**
 * Create error message
 */
declare function styleParseError(message: string, code: string, index?: number): StyleParseError;

export { type StyleParseError, styleParseError };
