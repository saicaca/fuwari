/**
 * List of error messages
 */
/**
 * Type Errors
 */
export declare const StringTypeError = "Incorrect type. Expected \"string\".";
export declare const NumberTypeError = "Incorrect type. Expected \"number\".";
export declare const BooleanTypeError = "Incorrect type. Expected \"boolean\".";
export declare const ArrayTypeError = "Incorrect type. Expected \"array\".";
export declare const ObjectTypeError = "Incorrect type. Expected \"object\".";
export declare const TypeMismatchWarning = "Incorrect type. Expected \"{0}\".";
export declare const MissingRequiredPropWarning = "Missing property \"{0}\".";
export declare const ConstWarning = "Value must be {0}.";
export declare function propertyIsNotAllowed(name: string): string;
/**
 * Parse errors
 */
export declare const BlockMappingEntryError = "Implicit map keys need to be followed by map values";
/**
 * Value Errors
 */
export declare const IncludeWithoutValueError = "!include without value";
/**
 * Duplicate Key error
 */
export declare const DuplicateKeyError = "Map keys must be unique";
