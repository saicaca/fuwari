export interface StringifySettings {
    newLineFirst: boolean;
    indentFirstObject: boolean;
    shouldIndentWithTab: boolean;
}
interface StringifySettingsInternal extends StringifySettings {
    indentation: string;
    existingProps: string[];
}
export declare function stringifyObject(obj: unknown, indent: string, stringifyLiteral: (val: unknown) => string, settings: StringifySettingsInternal, depth?: number, consecutiveArrays?: number): string;
export {};
