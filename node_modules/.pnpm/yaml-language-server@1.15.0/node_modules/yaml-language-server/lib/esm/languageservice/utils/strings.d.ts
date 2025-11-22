export declare function startsWith(haystack: string, needle: string): boolean;
/**
 * Determines if haystack ends with needle.
 */
export declare function endsWith(haystack: string, needle: string): boolean;
export declare function convertSimple2RegExp(pattern: string): RegExp;
export declare function convertSimple2RegExpPattern(pattern: string): string;
export declare function getIndentation(lineContent: string, position: number): number;
export declare function safeCreateUnicodeRegExp(pattern: string): RegExp;
export declare function getFirstNonWhitespaceCharacterAfterOffset(str: string, offset: number): number;
