"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuplicateKeyError = exports.IncludeWithoutValueError = exports.BlockMappingEntryError = exports.propertyIsNotAllowed = exports.ConstWarning = exports.MissingRequiredPropWarning = exports.TypeMismatchWarning = exports.ObjectTypeError = exports.ArrayTypeError = exports.BooleanTypeError = exports.NumberTypeError = exports.StringTypeError = void 0;
/**
 * List of error messages
 */
/**
 * Type Errors
 */
exports.StringTypeError = 'Incorrect type. Expected "string".';
exports.NumberTypeError = 'Incorrect type. Expected "number".';
exports.BooleanTypeError = 'Incorrect type. Expected "boolean".';
exports.ArrayTypeError = 'Incorrect type. Expected "array".';
exports.ObjectTypeError = 'Incorrect type. Expected "object".';
exports.TypeMismatchWarning = 'Incorrect type. Expected "{0}".';
exports.MissingRequiredPropWarning = 'Missing property "{0}".';
exports.ConstWarning = 'Value must be {0}.';
function propertyIsNotAllowed(name) {
    return `Property ${name} is not allowed.`;
}
exports.propertyIsNotAllowed = propertyIsNotAllowed;
/**
 * Parse errors
 */
exports.BlockMappingEntryError = 'Implicit map keys need to be followed by map values';
/**
 * Value Errors
 */
exports.IncludeWithoutValueError = '!include without value';
/**
 * Duplicate Key error
 */
exports.DuplicateKeyError = 'Map keys must be unique';
//# sourceMappingURL=errorMessages.js.map