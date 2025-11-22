/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { isNumber, equals, isString, isDefined, isBoolean, isIterable } from '../utils/objects';
import { getSchemaTypeName } from '../utils/schemaUtils';
import { ErrorCode } from 'vscode-json-languageservice';
import * as nls from 'vscode-nls';
import { URI } from 'vscode-uri';
import { Diagnostic, DiagnosticSeverity, Range } from 'vscode-languageserver-types';
import { isArrayEqual } from '../utils/arrUtils';
import { safeCreateUnicodeRegExp } from '../utils/strings';
import { FilePatternAssociation } from '../services/yamlSchemaService';
const localize = nls.loadMessageBundle();
const MSG_PROPERTY_NOT_ALLOWED = 'Property {0} is not allowed.';
export const formats = {
    'color-hex': {
        errorMessage: localize('colorHexFormatWarning', 'Invalid color format. Use #RGB, #RGBA, #RRGGBB or #RRGGBBAA.'),
        pattern: /^#([0-9A-Fa-f]{3,4}|([0-9A-Fa-f]{2}){3,4})$/,
    },
    'date-time': {
        errorMessage: localize('dateTimeFormatWarning', 'String is not a RFC3339 date-time.'),
        pattern: /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]|60)(\.[0-9]+)?(Z|(\+|-)([01][0-9]|2[0-3]):([0-5][0-9]))$/i,
    },
    date: {
        errorMessage: localize('dateFormatWarning', 'String is not a RFC3339 date.'),
        pattern: /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/i,
    },
    time: {
        errorMessage: localize('timeFormatWarning', 'String is not a RFC3339 time.'),
        pattern: /^([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]|60)(\.[0-9]+)?(Z|(\+|-)([01][0-9]|2[0-3]):([0-5][0-9]))$/i,
    },
    email: {
        errorMessage: localize('emailFormatWarning', 'String is not an e-mail address.'),
        pattern: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    },
    ipv4: {
        errorMessage: localize('ipv4FormatWarning', 'String does not match IPv4 format.'),
        pattern: /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/,
    },
    ipv6: {
        errorMessage: localize('ipv6FormatWarning', 'String does not match IPv6 format.'),
        pattern: /^([0-9a-f]|:){1,4}(:([0-9a-f]{0,4})*){1,7}$/i,
    },
};
export const YAML_SOURCE = 'YAML';
const YAML_SCHEMA_PREFIX = 'yaml-schema: ';
export var ProblemType;
(function (ProblemType) {
    ProblemType["missingRequiredPropWarning"] = "missingRequiredPropWarning";
    ProblemType["typeMismatchWarning"] = "typeMismatchWarning";
    ProblemType["constWarning"] = "constWarning";
})(ProblemType || (ProblemType = {}));
export const ProblemTypeMessages = {
    [ProblemType.missingRequiredPropWarning]: 'Missing property "{0}".',
    [ProblemType.typeMismatchWarning]: 'Incorrect type. Expected "{0}".',
    [ProblemType.constWarning]: 'Value must be {0}.',
};
export class ASTNodeImpl {
    constructor(parent, internalNode, offset, length) {
        this.offset = offset;
        this.length = length;
        this.parent = parent;
        this.internalNode = internalNode;
    }
    getNodeFromOffsetEndInclusive(offset) {
        const collector = [];
        const findNode = (node) => {
            if (offset >= node.offset && offset <= node.offset + node.length) {
                const children = node.children;
                for (let i = 0; i < children.length && children[i].offset <= offset; i++) {
                    const item = findNode(children[i]);
                    if (item) {
                        collector.push(item);
                    }
                }
                return node;
            }
            return null;
        };
        const foundNode = findNode(this);
        let currMinDist = Number.MAX_VALUE;
        let currMinNode = null;
        for (const currNode of collector) {
            const minDist = currNode.length + currNode.offset - offset + (offset - currNode.offset);
            if (minDist < currMinDist) {
                currMinNode = currNode;
                currMinDist = minDist;
            }
        }
        return currMinNode || foundNode;
    }
    get children() {
        return [];
    }
    toString() {
        return ('type: ' +
            this.type +
            ' (' +
            this.offset +
            '/' +
            this.length +
            ')' +
            (this.parent ? ' parent: {' + this.parent.toString() + '}' : ''));
    }
}
export class NullASTNodeImpl extends ASTNodeImpl {
    constructor(parent, internalNode, offset, length) {
        super(parent, internalNode, offset, length);
        this.type = 'null';
        this.value = null;
    }
}
export class BooleanASTNodeImpl extends ASTNodeImpl {
    constructor(parent, internalNode, boolValue, offset, length) {
        super(parent, internalNode, offset, length);
        this.type = 'boolean';
        this.value = boolValue;
    }
}
export class ArrayASTNodeImpl extends ASTNodeImpl {
    constructor(parent, internalNode, offset, length) {
        super(parent, internalNode, offset, length);
        this.type = 'array';
        this.items = [];
    }
    get children() {
        return this.items;
    }
}
export class NumberASTNodeImpl extends ASTNodeImpl {
    constructor(parent, internalNode, offset, length) {
        super(parent, internalNode, offset, length);
        this.type = 'number';
        this.isInteger = true;
        this.value = Number.NaN;
    }
}
export class StringASTNodeImpl extends ASTNodeImpl {
    constructor(parent, internalNode, offset, length) {
        super(parent, internalNode, offset, length);
        this.type = 'string';
        this.value = '';
    }
}
export class PropertyASTNodeImpl extends ASTNodeImpl {
    constructor(parent, internalNode, offset, length) {
        super(parent, internalNode, offset, length);
        this.type = 'property';
        this.colonOffset = -1;
    }
    get children() {
        return this.valueNode ? [this.keyNode, this.valueNode] : [this.keyNode];
    }
}
export class ObjectASTNodeImpl extends ASTNodeImpl {
    constructor(parent, internalNode, offset, length) {
        super(parent, internalNode, offset, length);
        this.type = 'object';
        this.properties = [];
    }
    get children() {
        return this.properties;
    }
}
export function asSchema(schema) {
    if (schema === undefined) {
        return undefined;
    }
    if (isBoolean(schema)) {
        return schema ? {} : { not: {} };
    }
    if (typeof schema !== 'object') {
        // we need to report this case as JSONSchemaRef MUST be an Object or Boolean
        console.warn(`Wrong schema: ${JSON.stringify(schema)}, it MUST be an Object or Boolean`);
        schema = {
            type: schema,
        };
    }
    return schema;
}
export var EnumMatch;
(function (EnumMatch) {
    EnumMatch[EnumMatch["Key"] = 0] = "Key";
    EnumMatch[EnumMatch["Enum"] = 1] = "Enum";
})(EnumMatch || (EnumMatch = {}));
class SchemaCollector {
    constructor(focusOffset = -1, exclude = null) {
        this.focusOffset = focusOffset;
        this.exclude = exclude;
        this.schemas = [];
    }
    add(schema) {
        this.schemas.push(schema);
    }
    merge(other) {
        this.schemas.push(...other.schemas);
    }
    include(node) {
        return (this.focusOffset === -1 || contains(node, this.focusOffset)) && node !== this.exclude;
    }
    newSub() {
        return new SchemaCollector(-1, this.exclude);
    }
}
class NoOpSchemaCollector {
    constructor() {
        // ignore
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get schemas() {
        return [];
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    add(schema) {
        // ignore
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    merge(other) {
        // ignore
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    include(node) {
        return true;
    }
    newSub() {
        return this;
    }
}
NoOpSchemaCollector.instance = new NoOpSchemaCollector();
export class ValidationResult {
    constructor(isKubernetes) {
        this.problems = [];
        this.propertiesMatches = 0;
        this.propertiesValueMatches = 0;
        this.primaryValueMatches = 0;
        this.enumValueMatch = false;
        if (isKubernetes) {
            this.enumValues = [];
        }
        else {
            this.enumValues = null;
        }
    }
    hasProblems() {
        return !!this.problems.length;
    }
    mergeAll(validationResults) {
        for (const validationResult of validationResults) {
            this.merge(validationResult);
        }
    }
    merge(validationResult) {
        this.problems = this.problems.concat(validationResult.problems);
    }
    mergeEnumValues(validationResult) {
        if (!this.enumValueMatch && !validationResult.enumValueMatch && this.enumValues && validationResult.enumValues) {
            this.enumValues = this.enumValues.concat(validationResult.enumValues);
            for (const error of this.problems) {
                if (error.code === ErrorCode.EnumValueMismatch) {
                    error.message = localize('enumWarning', 'Value is not accepted. Valid values: {0}.', [...new Set(this.enumValues)]
                        .map((v) => {
                        return JSON.stringify(v);
                    })
                        .join(', '));
                }
            }
        }
    }
    /**
     * Merge multiple warnings with same problemType together
     * @param subValidationResult another possible result
     */
    mergeWarningGeneric(subValidationResult, problemTypesToMerge) {
        if (this.problems?.length) {
            for (const problemType of problemTypesToMerge) {
                const bestResults = this.problems.filter((p) => p.problemType === problemType);
                for (const bestResult of bestResults) {
                    const mergingResult = subValidationResult.problems?.find((p) => p.problemType === problemType &&
                        bestResult.location.offset === p.location.offset &&
                        (problemType !== ProblemType.missingRequiredPropWarning || isArrayEqual(p.problemArgs, bestResult.problemArgs)) // missingProp is merged only with same problemArg
                    );
                    if (mergingResult) {
                        if (mergingResult.problemArgs?.length) {
                            mergingResult.problemArgs
                                .filter((p) => !bestResult.problemArgs.includes(p))
                                .forEach((p) => bestResult.problemArgs.push(p));
                            bestResult.message = getWarningMessage(bestResult.problemType, bestResult.problemArgs);
                        }
                        this.mergeSources(mergingResult, bestResult);
                    }
                }
            }
        }
    }
    mergePropertyMatch(propertyValidationResult) {
        this.merge(propertyValidationResult);
        this.propertiesMatches++;
        if (propertyValidationResult.enumValueMatch ||
            (!propertyValidationResult.hasProblems() && propertyValidationResult.propertiesMatches)) {
            this.propertiesValueMatches++;
        }
        if (propertyValidationResult.enumValueMatch && propertyValidationResult.enumValues) {
            this.primaryValueMatches++;
        }
    }
    mergeSources(mergingResult, bestResult) {
        const mergingSource = mergingResult.source.replace(YAML_SCHEMA_PREFIX, '');
        if (!bestResult.source.includes(mergingSource)) {
            bestResult.source = bestResult.source + ' | ' + mergingSource;
        }
        if (!bestResult.schemaUri.includes(mergingResult.schemaUri[0])) {
            bestResult.schemaUri = bestResult.schemaUri.concat(mergingResult.schemaUri);
        }
    }
    compareGeneric(other) {
        const hasProblems = this.hasProblems();
        if (hasProblems !== other.hasProblems()) {
            return hasProblems ? -1 : 1;
        }
        if (this.enumValueMatch !== other.enumValueMatch) {
            return other.enumValueMatch ? -1 : 1;
        }
        if (this.propertiesValueMatches !== other.propertiesValueMatches) {
            return this.propertiesValueMatches - other.propertiesValueMatches;
        }
        if (this.primaryValueMatches !== other.primaryValueMatches) {
            return this.primaryValueMatches - other.primaryValueMatches;
        }
        return this.propertiesMatches - other.propertiesMatches;
    }
    compareKubernetes(other) {
        const hasProblems = this.hasProblems();
        if (this.propertiesMatches !== other.propertiesMatches) {
            return this.propertiesMatches - other.propertiesMatches;
        }
        if (this.enumValueMatch !== other.enumValueMatch) {
            return other.enumValueMatch ? -1 : 1;
        }
        if (this.primaryValueMatches !== other.primaryValueMatches) {
            return this.primaryValueMatches - other.primaryValueMatches;
        }
        if (this.propertiesValueMatches !== other.propertiesValueMatches) {
            return this.propertiesValueMatches - other.propertiesValueMatches;
        }
        if (hasProblems !== other.hasProblems()) {
            return hasProblems ? -1 : 1;
        }
        return this.propertiesMatches - other.propertiesMatches;
    }
}
export function newJSONDocument(root, diagnostics = []) {
    return new JSONDocument(root, diagnostics, []);
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getNodeValue(node) {
    switch (node.type) {
        case 'array':
            return node.children.map(getNodeValue);
        case 'object': {
            const obj = Object.create(null);
            for (let _i = 0, _a = node.children; _i < _a.length; _i++) {
                const prop = _a[_i];
                const valueNode = prop.children[1];
                if (valueNode) {
                    obj[prop.children[0].value] = getNodeValue(valueNode);
                }
            }
            return obj;
        }
        case 'null':
        case 'string':
        case 'number':
        case 'boolean':
            return node.value;
        default:
            return undefined;
    }
}
export function contains(node, offset, includeRightBound = false) {
    return ((offset >= node.offset && offset <= node.offset + node.length) || (includeRightBound && offset === node.offset + node.length));
}
export function findNodeAtOffset(node, offset, includeRightBound) {
    if (includeRightBound === void 0) {
        includeRightBound = false;
    }
    if (contains(node, offset, includeRightBound)) {
        const children = node.children;
        if (Array.isArray(children)) {
            for (let i = 0; i < children.length && children[i].offset <= offset; i++) {
                const item = findNodeAtOffset(children[i], offset, includeRightBound);
                if (item) {
                    return item;
                }
            }
        }
        return node;
    }
    return undefined;
}
export class JSONDocument {
    constructor(root, syntaxErrors = [], comments = []) {
        this.root = root;
        this.syntaxErrors = syntaxErrors;
        this.comments = comments;
    }
    getNodeFromOffset(offset, includeRightBound = false) {
        if (this.root) {
            return findNodeAtOffset(this.root, offset, includeRightBound);
        }
        return undefined;
    }
    getNodeFromOffsetEndInclusive(offset) {
        return this.root && this.root.getNodeFromOffsetEndInclusive(offset);
    }
    visit(visitor) {
        if (this.root) {
            const doVisit = (node) => {
                let ctn = visitor(node);
                const children = node.children;
                if (Array.isArray(children)) {
                    for (let i = 0; i < children.length && ctn; i++) {
                        ctn = doVisit(children[i]);
                    }
                }
                return ctn;
            };
            doVisit(this.root);
        }
    }
    validate(textDocument, schema) {
        if (this.root && schema) {
            const validationResult = new ValidationResult(this.isKubernetes);
            validate(this.root, schema, schema, validationResult, NoOpSchemaCollector.instance, {
                isKubernetes: this.isKubernetes,
                disableAdditionalProperties: this.disableAdditionalProperties,
                uri: this.uri,
            });
            return validationResult.problems.map((p) => {
                const range = Range.create(textDocument.positionAt(p.location.offset), textDocument.positionAt(p.location.offset + p.location.length));
                const diagnostic = Diagnostic.create(range, p.message, p.severity, p.code ? p.code : ErrorCode.Undefined, p.source);
                diagnostic.data = { schemaUri: p.schemaUri, ...p.data };
                return diagnostic;
            });
        }
        return null;
    }
    /**
     * This method returns the list of applicable schemas
     *
     * currently used @param didCallFromAutoComplete flag to differentiate the method call, when it is from auto complete
     * then user still types something and skip the validation for timebeing untill completed.
     * On https://github.com/redhat-developer/yaml-language-server/pull/719 the auto completes need to populate the list of enum string which matches to the enum
     * and on https://github.com/redhat-developer/vscode-yaml/issues/803 the validation should throw the error based on the enum string.
     *
     * @param schema schema
     * @param focusOffset  offsetValue
     * @param exclude excluded Node
     * @param didCallFromAutoComplete true if method called from AutoComplete
     * @returns array of applicable schemas
     */
    getMatchingSchemas(schema, focusOffset = -1, exclude = null, didCallFromAutoComplete) {
        const matchingSchemas = new SchemaCollector(focusOffset, exclude);
        if (this.root && schema) {
            validate(this.root, schema, schema, new ValidationResult(this.isKubernetes), matchingSchemas, {
                isKubernetes: this.isKubernetes,
                disableAdditionalProperties: this.disableAdditionalProperties,
                uri: this.uri,
                callFromAutoComplete: didCallFromAutoComplete,
            });
        }
        return matchingSchemas.schemas;
    }
}
function validate(node, schema, originalSchema, validationResult, matchingSchemas, options
// eslint-disable-next-line @typescript-eslint/no-explicit-any
) {
    const { isKubernetes, callFromAutoComplete } = options;
    if (!node) {
        return;
    }
    // schema should be an Object
    if (typeof schema !== 'object') {
        return;
    }
    if (!schema.url) {
        schema.url = originalSchema.url;
    }
    schema.closestTitle = schema.title || originalSchema.closestTitle;
    switch (node.type) {
        case 'object':
            _validateObjectNode(node, schema, validationResult, matchingSchemas);
            break;
        case 'array':
            _validateArrayNode(node, schema, validationResult, matchingSchemas);
            break;
        case 'string':
            _validateStringNode(node, schema, validationResult);
            break;
        case 'number':
            _validateNumberNode(node, schema, validationResult);
            break;
        case 'property':
            return validate(node.valueNode, schema, schema, validationResult, matchingSchemas, options);
    }
    _validateNode();
    matchingSchemas.add({ node: node, schema: schema });
    function _validateNode() {
        function matchesType(type) {
            return node.type === type || (type === 'integer' && node.type === 'number' && node.isInteger);
        }
        if (Array.isArray(schema.type)) {
            if (!schema.type.some(matchesType)) {
                validationResult.problems.push({
                    location: { offset: node.offset, length: node.length },
                    severity: DiagnosticSeverity.Warning,
                    message: schema.errorMessage ||
                        localize('typeArrayMismatchWarning', 'Incorrect type. Expected one of {0}.', schema.type.join(', ')),
                    source: getSchemaSource(schema, originalSchema),
                    schemaUri: getSchemaUri(schema, originalSchema),
                });
            }
        }
        else if (schema.type) {
            if (!matchesType(schema.type)) {
                //get more specific name than just object
                const schemaType = schema.type === 'object' ? getSchemaTypeName(schema) : schema.type;
                validationResult.problems.push({
                    location: { offset: node.offset, length: node.length },
                    severity: DiagnosticSeverity.Warning,
                    message: schema.errorMessage || getWarningMessage(ProblemType.typeMismatchWarning, [schemaType]),
                    source: getSchemaSource(schema, originalSchema),
                    schemaUri: getSchemaUri(schema, originalSchema),
                    problemType: ProblemType.typeMismatchWarning,
                    problemArgs: [schemaType],
                });
            }
        }
        if (Array.isArray(schema.allOf)) {
            for (const subSchemaRef of schema.allOf) {
                validate(node, asSchema(subSchemaRef), schema, validationResult, matchingSchemas, options);
            }
        }
        const notSchema = asSchema(schema.not);
        if (notSchema) {
            const subValidationResult = new ValidationResult(isKubernetes);
            const subMatchingSchemas = matchingSchemas.newSub();
            validate(node, notSchema, schema, subValidationResult, subMatchingSchemas, options);
            if (!subValidationResult.hasProblems()) {
                validationResult.problems.push({
                    location: { offset: node.offset, length: node.length },
                    severity: DiagnosticSeverity.Warning,
                    message: localize('notSchemaWarning', 'Matches a schema that is not allowed.'),
                    source: getSchemaSource(schema, originalSchema),
                    schemaUri: getSchemaUri(schema, originalSchema),
                });
            }
            for (const ms of subMatchingSchemas.schemas) {
                ms.inverted = !ms.inverted;
                matchingSchemas.add(ms);
            }
        }
        const testAlternatives = (alternatives, maxOneMatch) => {
            const matches = [];
            const subMatches = [];
            const noPropertyMatches = [];
            // remember the best match that is used for error messages
            let bestMatch = null;
            for (const subSchemaRef of alternatives) {
                const subSchema = { ...asSchema(subSchemaRef) };
                const subValidationResult = new ValidationResult(isKubernetes);
                const subMatchingSchemas = matchingSchemas.newSub();
                validate(node, subSchema, schema, subValidationResult, subMatchingSchemas, options);
                if (!subValidationResult.hasProblems() || callFromAutoComplete) {
                    matches.push(subSchema);
                    subMatches.push(subSchema);
                    if (subValidationResult.propertiesMatches === 0) {
                        noPropertyMatches.push(subSchema);
                    }
                    if (subSchema.format) {
                        subMatches.pop();
                    }
                }
                if (!bestMatch) {
                    bestMatch = {
                        schema: subSchema,
                        validationResult: subValidationResult,
                        matchingSchemas: subMatchingSchemas,
                    };
                }
                else if (isKubernetes) {
                    bestMatch = alternativeComparison(subValidationResult, bestMatch, subSchema, subMatchingSchemas);
                }
                else {
                    bestMatch = genericComparison(node, maxOneMatch, subValidationResult, bestMatch, subSchema, subMatchingSchemas);
                }
            }
            if (subMatches.length > 1 && (subMatches.length > 1 || noPropertyMatches.length === 0) && maxOneMatch) {
                validationResult.problems.push({
                    location: { offset: node.offset, length: 1 },
                    severity: DiagnosticSeverity.Warning,
                    message: localize('oneOfWarning', 'Matches multiple schemas when only one must validate.'),
                    source: getSchemaSource(schema, originalSchema),
                    schemaUri: getSchemaUri(schema, originalSchema),
                });
            }
            if (bestMatch !== null) {
                validationResult.merge(bestMatch.validationResult);
                validationResult.propertiesMatches += bestMatch.validationResult.propertiesMatches;
                validationResult.propertiesValueMatches += bestMatch.validationResult.propertiesValueMatches;
                validationResult.enumValueMatch = validationResult.enumValueMatch || bestMatch.validationResult.enumValueMatch;
                if (bestMatch.validationResult.enumValues?.length) {
                    validationResult.enumValues = (validationResult.enumValues || []).concat(bestMatch.validationResult.enumValues);
                }
                matchingSchemas.merge(bestMatch.matchingSchemas);
            }
            return matches.length;
        };
        if (Array.isArray(schema.anyOf)) {
            testAlternatives(schema.anyOf, false);
        }
        if (Array.isArray(schema.oneOf)) {
            testAlternatives(schema.oneOf, true);
        }
        const testBranch = (schema, originalSchema) => {
            const subValidationResult = new ValidationResult(isKubernetes);
            const subMatchingSchemas = matchingSchemas.newSub();
            validate(node, asSchema(schema), originalSchema, subValidationResult, subMatchingSchemas, options);
            validationResult.merge(subValidationResult);
            validationResult.propertiesMatches += subValidationResult.propertiesMatches;
            validationResult.propertiesValueMatches += subValidationResult.propertiesValueMatches;
            matchingSchemas.merge(subMatchingSchemas);
        };
        const testCondition = (ifSchema, originalSchema, thenSchema, elseSchema) => {
            const subSchema = asSchema(ifSchema);
            const subValidationResult = new ValidationResult(isKubernetes);
            const subMatchingSchemas = matchingSchemas.newSub();
            validate(node, subSchema, originalSchema, subValidationResult, subMatchingSchemas, options);
            matchingSchemas.merge(subMatchingSchemas);
            const { filePatternAssociation } = subSchema;
            if (filePatternAssociation) {
                const association = new FilePatternAssociation(filePatternAssociation);
                if (!association.matchesPattern(options.uri)) {
                    subValidationResult.problems.push({
                        location: { offset: node.offset, length: node.length },
                        severity: DiagnosticSeverity.Warning,
                        message: localize('ifFilePatternAssociation', `filePatternAssociation '${filePatternAssociation}' does not match with doc uri '${options.uri}'.`),
                        source: getSchemaSource(schema, originalSchema),
                        schemaUri: getSchemaUri(schema, originalSchema),
                    });
                    // don't want to expose the error up to code-completion results
                    // validationResult.merge(subValidationResult);
                }
            }
            if (!subValidationResult.hasProblems()) {
                if (thenSchema) {
                    testBranch(thenSchema, originalSchema);
                }
            }
            else if (elseSchema) {
                testBranch(elseSchema, originalSchema);
            }
        };
        const ifSchema = asSchema(schema.if);
        if (ifSchema) {
            testCondition(ifSchema, schema, asSchema(schema.then), asSchema(schema.else));
        }
        if (Array.isArray(schema.enum)) {
            const val = getNodeValue(node);
            let enumValueMatch = false;
            for (const e of schema.enum) {
                if (equals(val, e) || (callFromAutoComplete && isString(val) && isString(e) && val && e.startsWith(val))) {
                    enumValueMatch = true;
                    break;
                }
            }
            validationResult.enumValues = schema.enum;
            validationResult.enumValueMatch = enumValueMatch;
            if (!enumValueMatch) {
                validationResult.problems.push({
                    location: { offset: node.offset, length: node.length },
                    severity: DiagnosticSeverity.Warning,
                    code: ErrorCode.EnumValueMismatch,
                    message: schema.errorMessage ||
                        localize('enumWarning', 'Value is not accepted. Valid values: {0}.', schema.enum
                            .map((v) => {
                            return JSON.stringify(v);
                        })
                            .join(', ')),
                    source: getSchemaSource(schema, originalSchema),
                    schemaUri: getSchemaUri(schema, originalSchema),
                });
            }
        }
        if (isDefined(schema.const)) {
            const val = getNodeValue(node);
            if (!equals(val, schema.const) &&
                !(callFromAutoComplete && isString(val) && isString(schema.const) && schema.const.startsWith(val))) {
                validationResult.problems.push({
                    location: { offset: node.offset, length: node.length },
                    severity: DiagnosticSeverity.Warning,
                    code: ErrorCode.EnumValueMismatch,
                    problemType: ProblemType.constWarning,
                    message: schema.errorMessage || getWarningMessage(ProblemType.constWarning, [JSON.stringify(schema.const)]),
                    source: getSchemaSource(schema, originalSchema),
                    schemaUri: getSchemaUri(schema, originalSchema),
                    problemArgs: [JSON.stringify(schema.const)],
                });
                validationResult.enumValueMatch = false;
            }
            else {
                validationResult.enumValueMatch = true;
            }
            validationResult.enumValues = [schema.const];
        }
        if (schema.deprecationMessage && node.parent) {
            validationResult.problems.push({
                location: { offset: node.parent.offset, length: node.parent.length },
                severity: DiagnosticSeverity.Warning,
                message: schema.deprecationMessage,
                source: getSchemaSource(schema, originalSchema),
                schemaUri: getSchemaUri(schema, originalSchema),
            });
        }
    }
    function _validateNumberNode(node, schema, validationResult) {
        const val = node.value;
        if (isNumber(schema.multipleOf)) {
            if (val % schema.multipleOf !== 0) {
                validationResult.problems.push({
                    location: { offset: node.offset, length: node.length },
                    severity: DiagnosticSeverity.Warning,
                    message: localize('multipleOfWarning', 'Value is not divisible by {0}.', schema.multipleOf),
                    source: getSchemaSource(schema, originalSchema),
                    schemaUri: getSchemaUri(schema, originalSchema),
                });
            }
        }
        function getExclusiveLimit(limit, exclusive) {
            if (isNumber(exclusive)) {
                return exclusive;
            }
            if (isBoolean(exclusive) && exclusive) {
                return limit;
            }
            return undefined;
        }
        function getLimit(limit, exclusive) {
            if (!isBoolean(exclusive) || !exclusive) {
                return limit;
            }
            return undefined;
        }
        const exclusiveMinimum = getExclusiveLimit(schema.minimum, schema.exclusiveMinimum);
        if (isNumber(exclusiveMinimum) && val <= exclusiveMinimum) {
            validationResult.problems.push({
                location: { offset: node.offset, length: node.length },
                severity: DiagnosticSeverity.Warning,
                message: localize('exclusiveMinimumWarning', 'Value is below the exclusive minimum of {0}.', exclusiveMinimum),
                source: getSchemaSource(schema, originalSchema),
                schemaUri: getSchemaUri(schema, originalSchema),
            });
        }
        const exclusiveMaximum = getExclusiveLimit(schema.maximum, schema.exclusiveMaximum);
        if (isNumber(exclusiveMaximum) && val >= exclusiveMaximum) {
            validationResult.problems.push({
                location: { offset: node.offset, length: node.length },
                severity: DiagnosticSeverity.Warning,
                message: localize('exclusiveMaximumWarning', 'Value is above the exclusive maximum of {0}.', exclusiveMaximum),
                source: getSchemaSource(schema, originalSchema),
                schemaUri: getSchemaUri(schema, originalSchema),
            });
        }
        const minimum = getLimit(schema.minimum, schema.exclusiveMinimum);
        if (isNumber(minimum) && val < minimum) {
            validationResult.problems.push({
                location: { offset: node.offset, length: node.length },
                severity: DiagnosticSeverity.Warning,
                message: localize('minimumWarning', 'Value is below the minimum of {0}.', minimum),
                source: getSchemaSource(schema, originalSchema),
                schemaUri: getSchemaUri(schema, originalSchema),
            });
        }
        const maximum = getLimit(schema.maximum, schema.exclusiveMaximum);
        if (isNumber(maximum) && val > maximum) {
            validationResult.problems.push({
                location: { offset: node.offset, length: node.length },
                severity: DiagnosticSeverity.Warning,
                message: localize('maximumWarning', 'Value is above the maximum of {0}.', maximum),
                source: getSchemaSource(schema, originalSchema),
                schemaUri: getSchemaUri(schema, originalSchema),
            });
        }
    }
    function _validateStringNode(node, schema, validationResult) {
        if (isNumber(schema.minLength) && node.value.length < schema.minLength) {
            validationResult.problems.push({
                location: { offset: node.offset, length: node.length },
                severity: DiagnosticSeverity.Warning,
                message: localize('minLengthWarning', 'String is shorter than the minimum length of {0}.', schema.minLength),
                source: getSchemaSource(schema, originalSchema),
                schemaUri: getSchemaUri(schema, originalSchema),
            });
        }
        if (isNumber(schema.maxLength) && node.value.length > schema.maxLength) {
            validationResult.problems.push({
                location: { offset: node.offset, length: node.length },
                severity: DiagnosticSeverity.Warning,
                message: localize('maxLengthWarning', 'String is longer than the maximum length of {0}.', schema.maxLength),
                source: getSchemaSource(schema, originalSchema),
                schemaUri: getSchemaUri(schema, originalSchema),
            });
        }
        if (isString(schema.pattern)) {
            const regex = safeCreateUnicodeRegExp(schema.pattern);
            if (!regex.test(node.value)) {
                validationResult.problems.push({
                    location: { offset: node.offset, length: node.length },
                    severity: DiagnosticSeverity.Warning,
                    message: schema.patternErrorMessage ||
                        schema.errorMessage ||
                        localize('patternWarning', 'String does not match the pattern of "{0}".', schema.pattern),
                    source: getSchemaSource(schema, originalSchema),
                    schemaUri: getSchemaUri(schema, originalSchema),
                });
            }
        }
        if (schema.format) {
            switch (schema.format) {
                case 'uri':
                case 'uri-reference':
                    {
                        let errorMessage;
                        if (!node.value) {
                            errorMessage = localize('uriEmpty', 'URI expected.');
                        }
                        else {
                            try {
                                const uri = URI.parse(node.value);
                                if (!uri.scheme && schema.format === 'uri') {
                                    errorMessage = localize('uriSchemeMissing', 'URI with a scheme is expected.');
                                }
                            }
                            catch (e) {
                                errorMessage = e.message;
                            }
                        }
                        if (errorMessage) {
                            validationResult.problems.push({
                                location: { offset: node.offset, length: node.length },
                                severity: DiagnosticSeverity.Warning,
                                message: schema.patternErrorMessage ||
                                    schema.errorMessage ||
                                    localize('uriFormatWarning', 'String is not a URI: {0}', errorMessage),
                                source: getSchemaSource(schema, originalSchema),
                                schemaUri: getSchemaUri(schema, originalSchema),
                            });
                        }
                    }
                    break;
                case 'color-hex':
                case 'date-time':
                case 'date':
                case 'time':
                case 'email':
                case 'ipv4':
                case 'ipv6':
                    {
                        const format = formats[schema.format];
                        if (!node.value || !format.pattern.test(node.value)) {
                            validationResult.problems.push({
                                location: { offset: node.offset, length: node.length },
                                severity: DiagnosticSeverity.Warning,
                                message: schema.patternErrorMessage || schema.errorMessage || format.errorMessage,
                                source: getSchemaSource(schema, originalSchema),
                                schemaUri: getSchemaUri(schema, originalSchema),
                            });
                        }
                    }
                    break;
                default:
            }
        }
    }
    function _validateArrayNode(node, schema, validationResult, matchingSchemas) {
        if (Array.isArray(schema.items)) {
            const subSchemas = schema.items;
            for (let index = 0; index < subSchemas.length; index++) {
                const subSchemaRef = subSchemas[index];
                const subSchema = asSchema(subSchemaRef);
                const itemValidationResult = new ValidationResult(isKubernetes);
                const item = node.items[index];
                if (item) {
                    validate(item, subSchema, schema, itemValidationResult, matchingSchemas, options);
                    validationResult.mergePropertyMatch(itemValidationResult);
                    validationResult.mergeEnumValues(itemValidationResult);
                }
                else if (node.items.length >= subSchemas.length) {
                    validationResult.propertiesValueMatches++;
                }
            }
            if (node.items.length > subSchemas.length) {
                if (typeof schema.additionalItems === 'object') {
                    for (let i = subSchemas.length; i < node.items.length; i++) {
                        const itemValidationResult = new ValidationResult(isKubernetes);
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        validate(node.items[i], schema.additionalItems, schema, itemValidationResult, matchingSchemas, options);
                        validationResult.mergePropertyMatch(itemValidationResult);
                        validationResult.mergeEnumValues(itemValidationResult);
                    }
                }
                else if (schema.additionalItems === false) {
                    validationResult.problems.push({
                        location: { offset: node.offset, length: node.length },
                        severity: DiagnosticSeverity.Warning,
                        message: localize('additionalItemsWarning', 'Array has too many items according to schema. Expected {0} or fewer.', subSchemas.length),
                        source: getSchemaSource(schema, originalSchema),
                        schemaUri: getSchemaUri(schema, originalSchema),
                    });
                }
            }
        }
        else {
            const itemSchema = asSchema(schema.items);
            if (itemSchema) {
                const itemValidationResult = new ValidationResult(isKubernetes);
                node.items.forEach((item) => {
                    if (itemSchema.oneOf && itemSchema.oneOf.length === 1) {
                        const subSchemaRef = itemSchema.oneOf[0];
                        const subSchema = { ...asSchema(subSchemaRef) };
                        subSchema.title = schema.title;
                        subSchema.closestTitle = schema.closestTitle;
                        validate(item, subSchema, schema, itemValidationResult, matchingSchemas, options);
                        validationResult.mergePropertyMatch(itemValidationResult);
                        validationResult.mergeEnumValues(itemValidationResult);
                    }
                    else {
                        validate(item, itemSchema, schema, itemValidationResult, matchingSchemas, options);
                        validationResult.mergePropertyMatch(itemValidationResult);
                        validationResult.mergeEnumValues(itemValidationResult);
                    }
                });
            }
        }
        const containsSchema = asSchema(schema.contains);
        if (containsSchema) {
            const doesContain = node.items.some((item) => {
                const itemValidationResult = new ValidationResult(isKubernetes);
                validate(item, containsSchema, schema, itemValidationResult, NoOpSchemaCollector.instance, options);
                return !itemValidationResult.hasProblems();
            });
            if (!doesContain) {
                validationResult.problems.push({
                    location: { offset: node.offset, length: node.length },
                    severity: DiagnosticSeverity.Warning,
                    message: schema.errorMessage || localize('requiredItemMissingWarning', 'Array does not contain required item.'),
                    source: getSchemaSource(schema, originalSchema),
                    schemaUri: getSchemaUri(schema, originalSchema),
                });
            }
        }
        if (isNumber(schema.minItems) && node.items.length < schema.minItems) {
            validationResult.problems.push({
                location: { offset: node.offset, length: node.length },
                severity: DiagnosticSeverity.Warning,
                message: localize('minItemsWarning', 'Array has too few items. Expected {0} or more.', schema.minItems),
                source: getSchemaSource(schema, originalSchema),
                schemaUri: getSchemaUri(schema, originalSchema),
            });
        }
        if (isNumber(schema.maxItems) && node.items.length > schema.maxItems) {
            validationResult.problems.push({
                location: { offset: node.offset, length: node.length },
                severity: DiagnosticSeverity.Warning,
                message: localize('maxItemsWarning', 'Array has too many items. Expected {0} or fewer.', schema.maxItems),
                source: getSchemaSource(schema, originalSchema),
                schemaUri: getSchemaUri(schema, originalSchema),
            });
        }
        if (schema.uniqueItems === true) {
            const values = getNodeValue(node);
            const duplicates = values.some((value, index) => {
                return index !== values.lastIndexOf(value);
            });
            if (duplicates) {
                validationResult.problems.push({
                    location: { offset: node.offset, length: node.length },
                    severity: DiagnosticSeverity.Warning,
                    message: localize('uniqueItemsWarning', 'Array has duplicate items.'),
                    source: getSchemaSource(schema, originalSchema),
                    schemaUri: getSchemaUri(schema, originalSchema),
                });
            }
        }
    }
    function _validateObjectNode(node, schema, validationResult, matchingSchemas) {
        const seenKeys = Object.create(null);
        const unprocessedProperties = [];
        const unprocessedNodes = [...node.properties];
        while (unprocessedNodes.length > 0) {
            const propertyNode = unprocessedNodes.pop();
            const key = propertyNode.keyNode.value;
            //Replace the merge key with the actual values of what the node value points to in seen keys
            if (key === '<<' && propertyNode.valueNode) {
                switch (propertyNode.valueNode.type) {
                    case 'object': {
                        unprocessedNodes.push(...propertyNode.valueNode['properties']);
                        break;
                    }
                    case 'array': {
                        propertyNode.valueNode['items'].forEach((sequenceNode) => {
                            if (sequenceNode && isIterable(sequenceNode['properties'])) {
                                unprocessedNodes.push(...sequenceNode['properties']);
                            }
                        });
                        break;
                    }
                    default: {
                        break;
                    }
                }
            }
            else {
                seenKeys[key] = propertyNode.valueNode;
                unprocessedProperties.push(key);
            }
        }
        if (Array.isArray(schema.required)) {
            for (const propertyName of schema.required) {
                if (seenKeys[propertyName] === undefined) {
                    const keyNode = node.parent && node.parent.type === 'property' && node.parent.keyNode;
                    const location = keyNode ? { offset: keyNode.offset, length: keyNode.length } : { offset: node.offset, length: 1 };
                    validationResult.problems.push({
                        location: location,
                        severity: DiagnosticSeverity.Warning,
                        message: getWarningMessage(ProblemType.missingRequiredPropWarning, [propertyName]),
                        source: getSchemaSource(schema, originalSchema),
                        schemaUri: getSchemaUri(schema, originalSchema),
                        problemArgs: [propertyName],
                        problemType: ProblemType.missingRequiredPropWarning,
                    });
                }
            }
        }
        const propertyProcessed = (prop) => {
            let index = unprocessedProperties.indexOf(prop);
            while (index >= 0) {
                unprocessedProperties.splice(index, 1);
                index = unprocessedProperties.indexOf(prop);
            }
        };
        if (schema.properties) {
            for (const propertyName of Object.keys(schema.properties)) {
                propertyProcessed(propertyName);
                const propertySchema = schema.properties[propertyName];
                const child = seenKeys[propertyName];
                if (child) {
                    if (isBoolean(propertySchema)) {
                        if (!propertySchema) {
                            const propertyNode = child.parent;
                            validationResult.problems.push({
                                location: {
                                    offset: propertyNode.keyNode.offset,
                                    length: propertyNode.keyNode.length,
                                },
                                severity: DiagnosticSeverity.Warning,
                                message: schema.errorMessage || localize('DisallowedExtraPropWarning', MSG_PROPERTY_NOT_ALLOWED, propertyName),
                                source: getSchemaSource(schema, originalSchema),
                                schemaUri: getSchemaUri(schema, originalSchema),
                            });
                        }
                        else {
                            validationResult.propertiesMatches++;
                            validationResult.propertiesValueMatches++;
                        }
                    }
                    else {
                        propertySchema.url = schema.url ?? originalSchema.url;
                        const propertyValidationResult = new ValidationResult(isKubernetes);
                        validate(child, propertySchema, schema, propertyValidationResult, matchingSchemas, options);
                        validationResult.mergePropertyMatch(propertyValidationResult);
                        validationResult.mergeEnumValues(propertyValidationResult);
                    }
                }
            }
        }
        if (schema.patternProperties) {
            for (const propertyPattern of Object.keys(schema.patternProperties)) {
                const regex = safeCreateUnicodeRegExp(propertyPattern);
                for (const propertyName of unprocessedProperties.slice(0)) {
                    if (regex.test(propertyName)) {
                        propertyProcessed(propertyName);
                        const child = seenKeys[propertyName];
                        if (child) {
                            const propertySchema = schema.patternProperties[propertyPattern];
                            if (isBoolean(propertySchema)) {
                                if (!propertySchema) {
                                    const propertyNode = child.parent;
                                    validationResult.problems.push({
                                        location: {
                                            offset: propertyNode.keyNode.offset,
                                            length: propertyNode.keyNode.length,
                                        },
                                        severity: DiagnosticSeverity.Warning,
                                        message: schema.errorMessage || localize('DisallowedExtraPropWarning', MSG_PROPERTY_NOT_ALLOWED, propertyName),
                                        source: getSchemaSource(schema, originalSchema),
                                        schemaUri: getSchemaUri(schema, originalSchema),
                                    });
                                }
                                else {
                                    validationResult.propertiesMatches++;
                                    validationResult.propertiesValueMatches++;
                                }
                            }
                            else {
                                const propertyValidationResult = new ValidationResult(isKubernetes);
                                validate(child, propertySchema, schema, propertyValidationResult, matchingSchemas, options);
                                validationResult.mergePropertyMatch(propertyValidationResult);
                                validationResult.mergeEnumValues(propertyValidationResult);
                            }
                        }
                    }
                }
            }
        }
        if (typeof schema.additionalProperties === 'object') {
            for (const propertyName of unprocessedProperties) {
                const child = seenKeys[propertyName];
                if (child) {
                    const propertyValidationResult = new ValidationResult(isKubernetes);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    validate(child, schema.additionalProperties, schema, propertyValidationResult, matchingSchemas, options);
                    validationResult.mergePropertyMatch(propertyValidationResult);
                    validationResult.mergeEnumValues(propertyValidationResult);
                }
            }
        }
        else if (schema.additionalProperties === false ||
            (schema.type === 'object' && schema.additionalProperties === undefined && options.disableAdditionalProperties === true)) {
            if (unprocessedProperties.length > 0) {
                const possibleProperties = schema.properties && Object.keys(schema.properties).filter((prop) => !seenKeys[prop]);
                for (const propertyName of unprocessedProperties) {
                    const child = seenKeys[propertyName];
                    if (child) {
                        let propertyNode = null;
                        if (child.type !== 'property') {
                            propertyNode = child.parent;
                            if (propertyNode.type === 'object') {
                                propertyNode = propertyNode.properties[0];
                            }
                        }
                        else {
                            propertyNode = child;
                        }
                        const problem = {
                            location: {
                                offset: propertyNode.keyNode.offset,
                                length: propertyNode.keyNode.length,
                            },
                            severity: DiagnosticSeverity.Warning,
                            message: schema.errorMessage || localize('DisallowedExtraPropWarning', MSG_PROPERTY_NOT_ALLOWED, propertyName),
                            source: getSchemaSource(schema, originalSchema),
                            schemaUri: getSchemaUri(schema, originalSchema),
                        };
                        if (possibleProperties?.length) {
                            problem.data = { properties: possibleProperties };
                        }
                        validationResult.problems.push(problem);
                    }
                }
            }
        }
        if (isNumber(schema.maxProperties)) {
            if (node.properties.length > schema.maxProperties) {
                validationResult.problems.push({
                    location: { offset: node.offset, length: node.length },
                    severity: DiagnosticSeverity.Warning,
                    message: localize('MaxPropWarning', 'Object has more properties than limit of {0}.', schema.maxProperties),
                    source: getSchemaSource(schema, originalSchema),
                    schemaUri: getSchemaUri(schema, originalSchema),
                });
            }
        }
        if (isNumber(schema.minProperties)) {
            if (node.properties.length < schema.minProperties) {
                validationResult.problems.push({
                    location: { offset: node.offset, length: node.length },
                    severity: DiagnosticSeverity.Warning,
                    message: localize('MinPropWarning', 'Object has fewer properties than the required number of {0}', schema.minProperties),
                    source: getSchemaSource(schema, originalSchema),
                    schemaUri: getSchemaUri(schema, originalSchema),
                });
            }
        }
        if (schema.dependencies) {
            for (const key of Object.keys(schema.dependencies)) {
                const prop = seenKeys[key];
                if (prop) {
                    const propertyDep = schema.dependencies[key];
                    if (Array.isArray(propertyDep)) {
                        for (const requiredProp of propertyDep) {
                            if (!seenKeys[requiredProp]) {
                                validationResult.problems.push({
                                    location: { offset: node.offset, length: node.length },
                                    severity: DiagnosticSeverity.Warning,
                                    message: localize('RequiredDependentPropWarning', 'Object is missing property {0} required by property {1}.', requiredProp, key),
                                    source: getSchemaSource(schema, originalSchema),
                                    schemaUri: getSchemaUri(schema, originalSchema),
                                });
                            }
                            else {
                                validationResult.propertiesValueMatches++;
                            }
                        }
                    }
                    else {
                        const propertySchema = asSchema(propertyDep);
                        if (propertySchema) {
                            const propertyValidationResult = new ValidationResult(isKubernetes);
                            validate(node, propertySchema, schema, propertyValidationResult, matchingSchemas, options);
                            validationResult.mergePropertyMatch(propertyValidationResult);
                            validationResult.mergeEnumValues(propertyValidationResult);
                        }
                    }
                }
            }
        }
        const propertyNames = asSchema(schema.propertyNames);
        if (propertyNames) {
            for (const f of node.properties) {
                const key = f.keyNode;
                if (key) {
                    validate(key, propertyNames, schema, validationResult, NoOpSchemaCollector.instance, options);
                }
            }
        }
    }
    //Alternative comparison is specifically used by the kubernetes/openshift schema but may lead to better results then genericComparison depending on the schema
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function alternativeComparison(subValidationResult, bestMatch, subSchema, subMatchingSchemas) {
        const compareResult = subValidationResult.compareKubernetes(bestMatch.validationResult);
        if (compareResult > 0) {
            // our node is the best matching so far
            bestMatch = {
                schema: subSchema,
                validationResult: subValidationResult,
                matchingSchemas: subMatchingSchemas,
            };
        }
        else if (compareResult === 0) {
            // there's already a best matching but we are as good
            bestMatch.matchingSchemas.merge(subMatchingSchemas);
            bestMatch.validationResult.mergeEnumValues(subValidationResult);
        }
        return bestMatch;
    }
    //genericComparison tries to find the best matching schema using a generic comparison
    function genericComparison(node, maxOneMatch, subValidationResult, bestMatch, subSchema, subMatchingSchemas) {
        if (!maxOneMatch &&
            !subValidationResult.hasProblems() &&
            (!bestMatch.validationResult.hasProblems() || callFromAutoComplete)) {
            // no errors, both are equally good matches
            bestMatch.matchingSchemas.merge(subMatchingSchemas);
            bestMatch.validationResult.propertiesMatches += subValidationResult.propertiesMatches;
            bestMatch.validationResult.propertiesValueMatches += subValidationResult.propertiesValueMatches;
        }
        else {
            const compareResult = subValidationResult.compareGeneric(bestMatch.validationResult);
            if (compareResult > 0 ||
                (compareResult === 0 &&
                    maxOneMatch &&
                    bestMatch.schema.type === 'object' &&
                    node.type !== 'null' &&
                    node.type !== bestMatch.schema.type)) {
                // our node is the best matching so far
                bestMatch = {
                    schema: subSchema,
                    validationResult: subValidationResult,
                    matchingSchemas: subMatchingSchemas,
                };
            }
            else if (compareResult === 0) {
                // there's already a best matching but we are as good
                bestMatch.matchingSchemas.merge(subMatchingSchemas);
                bestMatch.validationResult.mergeEnumValues(subValidationResult);
                bestMatch.validationResult.mergeWarningGeneric(subValidationResult, [
                    ProblemType.missingRequiredPropWarning,
                    ProblemType.typeMismatchWarning,
                    ProblemType.constWarning,
                ]);
            }
        }
        return bestMatch;
    }
}
function getSchemaSource(schema, originalSchema) {
    if (schema) {
        let label;
        if (schema.title) {
            label = schema.title;
        }
        else if (schema.closestTitle) {
            label = schema.closestTitle;
        }
        else if (originalSchema.closestTitle) {
            label = originalSchema.closestTitle;
        }
        else {
            const uriString = schema.url ?? originalSchema.url;
            if (uriString) {
                const url = URI.parse(uriString);
                if (url.scheme === 'file') {
                    label = url.fsPath;
                }
                label = url.toString();
            }
        }
        if (label) {
            return `${YAML_SCHEMA_PREFIX}${label}`;
        }
    }
    return YAML_SOURCE;
}
function getSchemaUri(schema, originalSchema) {
    const uriString = schema.url ?? originalSchema.url;
    return uriString ? [uriString] : [];
}
function getWarningMessage(problemType, args) {
    return localize(problemType, ProblemTypeMessages[problemType], args.join(' | '));
}
//# sourceMappingURL=jsonParser07.js.map