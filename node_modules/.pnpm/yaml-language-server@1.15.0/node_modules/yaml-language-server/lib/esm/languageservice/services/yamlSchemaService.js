/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { SchemaPriority } from '../yamlLanguageService';
import { UnresolvedSchema, ResolvedSchema, JSONSchemaService, } from 'vscode-json-languageservice/lib/umd/services/jsonSchemaService';
import { URI } from 'vscode-uri';
import * as nls from 'vscode-nls';
import { convertSimple2RegExpPattern } from '../utils/strings';
import { parse } from 'yaml';
import * as path from 'path';
import { getSchemaFromModeline } from './modelineUtil';
import Ajv from 'ajv';
import { getSchemaTitle } from '../utils/schemaUtils';
const localize = nls.loadMessageBundle();
const ajv = new Ajv();
// load JSON Schema 07 def to validate loaded schemas
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jsonSchema07 = require('ajv/dist/refs/json-schema-draft-07.json');
const schema07Validator = ajv.compile(jsonSchema07);
export var MODIFICATION_ACTIONS;
(function (MODIFICATION_ACTIONS) {
    MODIFICATION_ACTIONS[MODIFICATION_ACTIONS["delete"] = 0] = "delete";
    MODIFICATION_ACTIONS[MODIFICATION_ACTIONS["add"] = 1] = "add";
    MODIFICATION_ACTIONS[MODIFICATION_ACTIONS["deleteAll"] = 2] = "deleteAll";
})(MODIFICATION_ACTIONS || (MODIFICATION_ACTIONS = {}));
export class FilePatternAssociation {
    constructor(pattern) {
        try {
            this.patternRegExp = new RegExp(convertSimple2RegExpPattern(pattern) + '$');
        }
        catch (e) {
            // invalid pattern
            this.patternRegExp = null;
        }
        this.schemas = [];
    }
    addSchema(id) {
        this.schemas.push(id);
    }
    matchesPattern(fileName) {
        return this.patternRegExp && this.patternRegExp.test(fileName);
    }
    getSchemas() {
        return this.schemas;
    }
}
export class YAMLSchemaService extends JSONSchemaService {
    constructor(requestService, contextService, promiseConstructor) {
        super(requestService, contextService, promiseConstructor);
        this.schemaUriToNameAndDescription = new Map();
        this.customSchemaProvider = undefined;
        this.requestService = requestService;
        this.schemaPriorityMapping = new Map();
    }
    registerCustomSchemaProvider(customSchemaProvider) {
        this.customSchemaProvider = customSchemaProvider;
    }
    getAllSchemas() {
        const result = [];
        const schemaUris = new Set();
        for (const filePattern of this.filePatternAssociations) {
            const schemaUri = filePattern.uris[0];
            if (schemaUris.has(schemaUri)) {
                continue;
            }
            schemaUris.add(schemaUri);
            const schemaHandle = {
                uri: schemaUri,
                fromStore: false,
                usedForCurrentFile: false,
            };
            if (this.schemaUriToNameAndDescription.has(schemaUri)) {
                const { name, description, versions } = this.schemaUriToNameAndDescription.get(schemaUri);
                schemaHandle.name = name;
                schemaHandle.description = description;
                schemaHandle.fromStore = true;
                schemaHandle.versions = versions;
            }
            result.push(schemaHandle);
        }
        return result;
    }
    async resolveSchemaContent(schemaToResolve, schemaURL, dependencies) {
        const resolveErrors = schemaToResolve.errors.slice(0);
        let schema = schemaToResolve.schema;
        const contextService = this.contextService;
        if (!schema07Validator(schema)) {
            const errs = [];
            for (const err of schema07Validator.errors) {
                errs.push(`${err.instancePath} : ${err.message}`);
            }
            resolveErrors.push(`Schema '${getSchemaTitle(schemaToResolve.schema, schemaURL)}' is not valid:\n${errs.join('\n')}`);
        }
        const findSection = (schema, path) => {
            if (!path) {
                return schema;
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let current = schema;
            if (path[0] === '/') {
                path = path.substr(1);
            }
            path.split('/').some((part) => {
                current = current[part];
                return !current;
            });
            return current;
        };
        const merge = (target, sourceRoot, sourceURI, path) => {
            const section = findSection(sourceRoot, path);
            if (section) {
                for (const key in section) {
                    if (Object.prototype.hasOwnProperty.call(section, key) && !Object.prototype.hasOwnProperty.call(target, key)) {
                        target[key] = section[key];
                    }
                }
            }
            else {
                resolveErrors.push(localize('json.schema.invalidref', "$ref '{0}' in '{1}' can not be resolved.", path, sourceURI));
            }
        };
        const resolveExternalLink = (node, uri, linkPath, parentSchemaURL, parentSchemaDependencies
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) => {
            if (contextService && !/^\w+:\/\/.*/.test(uri)) {
                uri = contextService.resolveRelativePath(uri, parentSchemaURL);
            }
            uri = this.normalizeId(uri);
            const referencedHandle = this.getOrAddSchemaHandle(uri);
            return referencedHandle.getUnresolvedSchema().then((unresolvedSchema) => {
                parentSchemaDependencies[uri] = true;
                if (unresolvedSchema.errors.length) {
                    const loc = linkPath ? uri + '#' + linkPath : uri;
                    resolveErrors.push(localize('json.schema.problemloadingref', "Problems loading reference '{0}': {1}", loc, unresolvedSchema.errors[0]));
                }
                merge(node, unresolvedSchema.schema, uri, linkPath);
                node.url = uri;
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                return resolveRefs(node, unresolvedSchema.schema, uri, referencedHandle.dependencies);
            });
        };
        const resolveRefs = async (node, parentSchema, parentSchemaURL, parentSchemaDependencies
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) => {
            if (!node || typeof node !== 'object') {
                return null;
            }
            const toWalk = [node];
            const seen = new Set();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const openPromises = [];
            const collectEntries = (...entries) => {
                for (const entry of entries) {
                    if (typeof entry === 'object') {
                        toWalk.push(entry);
                    }
                }
            };
            const collectMapEntries = (...maps) => {
                for (const map of maps) {
                    if (typeof map === 'object') {
                        for (const key in map) {
                            const entry = map[key];
                            if (typeof entry === 'object') {
                                toWalk.push(entry);
                            }
                        }
                    }
                }
            };
            const collectArrayEntries = (...arrays) => {
                for (const array of arrays) {
                    if (Array.isArray(array)) {
                        for (const entry of array) {
                            if (typeof entry === 'object') {
                                toWalk.push(entry);
                            }
                        }
                    }
                }
            };
            const handleRef = (next) => {
                const seenRefs = new Set();
                while (next.$ref) {
                    const ref = next.$ref;
                    const segments = ref.split('#', 2);
                    //return back removed $ref. We lost info about referenced type without it.
                    next._$ref = next.$ref;
                    delete next.$ref;
                    if (segments[0].length > 0) {
                        openPromises.push(resolveExternalLink(next, segments[0], segments[1], parentSchemaURL, parentSchemaDependencies));
                        return;
                    }
                    else {
                        if (!seenRefs.has(ref)) {
                            merge(next, parentSchema, parentSchemaURL, segments[1]); // can set next.$ref again, use seenRefs to avoid circle
                            seenRefs.add(ref);
                        }
                    }
                }
                collectEntries(next.items, next.additionalItems, next.additionalProperties, next.not, next.contains, next.propertyNames, next.if, next.then, next.else);
                collectMapEntries(next.definitions, next.properties, next.patternProperties, next.dependencies);
                collectArrayEntries(next.anyOf, next.allOf, next.oneOf, next.items, next.schemaSequence);
            };
            if (parentSchemaURL.indexOf('#') > 0) {
                const segments = parentSchemaURL.split('#', 2);
                if (segments[0].length > 0 && segments[1].length > 0) {
                    const newSchema = {};
                    await resolveExternalLink(newSchema, segments[0], segments[1], parentSchemaURL, parentSchemaDependencies);
                    for (const key in schema) {
                        if (key === 'required') {
                            continue;
                        }
                        if (Object.prototype.hasOwnProperty.call(schema, key) && !Object.prototype.hasOwnProperty.call(newSchema, key)) {
                            newSchema[key] = schema[key];
                        }
                    }
                    schema = newSchema;
                }
            }
            while (toWalk.length) {
                const next = toWalk.pop();
                if (seen.has(next)) {
                    continue;
                }
                seen.add(next);
                handleRef(next);
            }
            return Promise.all(openPromises);
        };
        await resolveRefs(schema, schema, schemaURL, dependencies);
        return new ResolvedSchema(schema, resolveErrors);
    }
    getSchemaForResource(resource, doc) {
        const resolveModelineSchema = () => {
            let schemaFromModeline = getSchemaFromModeline(doc);
            if (schemaFromModeline !== undefined) {
                if (!schemaFromModeline.startsWith('file:') && !schemaFromModeline.startsWith('http')) {
                    // If path contains a fragment and it is left intact, "#" will be
                    // considered part of the filename and converted to "%23" by
                    // path.resolve() -> take it out and add back after path.resolve
                    let appendix = '';
                    if (schemaFromModeline.indexOf('#') > 0) {
                        const segments = schemaFromModeline.split('#', 2);
                        schemaFromModeline = segments[0];
                        appendix = segments[1];
                    }
                    if (!path.isAbsolute(schemaFromModeline)) {
                        const resUri = URI.parse(resource);
                        schemaFromModeline = URI.file(path.resolve(path.parse(resUri.fsPath).dir, schemaFromModeline)).toString();
                    }
                    else {
                        schemaFromModeline = URI.file(schemaFromModeline).toString();
                    }
                    if (appendix.length > 0) {
                        schemaFromModeline += '#' + appendix;
                    }
                }
                return schemaFromModeline;
            }
        };
        const resolveSchemaForResource = (schemas) => {
            const schemaHandle = super.createCombinedSchema(resource, schemas);
            return schemaHandle.getResolvedSchema().then((schema) => {
                if (schema.schema && typeof schema.schema === 'object') {
                    schema.schema.url = schemaHandle.url;
                }
                if (schema.schema &&
                    schema.schema.schemaSequence &&
                    schema.schema.schemaSequence[doc.currentDocIndex]) {
                    return new ResolvedSchema(schema.schema.schemaSequence[doc.currentDocIndex]);
                }
                return schema;
            });
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const resolveSchema = () => {
            const seen = Object.create(null);
            const schemas = [];
            for (const entry of this.filePatternAssociations) {
                if (entry.matchesPattern(resource)) {
                    for (const schemaId of entry.getURIs()) {
                        if (!seen[schemaId]) {
                            schemas.push(schemaId);
                            seen[schemaId] = true;
                        }
                    }
                }
            }
            if (schemas.length > 0) {
                // Join all schemas with the highest priority.
                const highestPrioSchemas = this.highestPrioritySchemas(schemas);
                return resolveSchemaForResource(highestPrioSchemas);
            }
            return Promise.resolve(null);
        };
        const modelineSchema = resolveModelineSchema();
        if (modelineSchema) {
            return resolveSchemaForResource([modelineSchema]);
        }
        if (this.customSchemaProvider) {
            return this.customSchemaProvider(resource)
                .then((schemaUri) => {
                if (Array.isArray(schemaUri)) {
                    if (schemaUri.length === 0) {
                        return resolveSchema();
                    }
                    return Promise.all(schemaUri.map((schemaUri) => {
                        return this.resolveCustomSchema(schemaUri, doc);
                    })).then((schemas) => {
                        return {
                            errors: [],
                            schema: {
                                allOf: schemas.map((schemaObj) => {
                                    return schemaObj.schema;
                                }),
                            },
                        };
                    }, () => {
                        return resolveSchema();
                    });
                }
                if (!schemaUri) {
                    return resolveSchema();
                }
                return this.resolveCustomSchema(schemaUri, doc);
            })
                .then((schema) => {
                return schema;
            }, () => {
                return resolveSchema();
            });
        }
        else {
            return resolveSchema();
        }
    }
    // Set the priority of a schema in the schema service
    addSchemaPriority(uri, priority) {
        let currSchemaArray = this.schemaPriorityMapping.get(uri);
        if (currSchemaArray) {
            currSchemaArray = currSchemaArray.add(priority);
            this.schemaPriorityMapping.set(uri, currSchemaArray);
        }
        else {
            this.schemaPriorityMapping.set(uri, new Set().add(priority));
        }
    }
    /**
     * Search through all the schemas and find the ones with the highest priority
     */
    highestPrioritySchemas(schemas) {
        let highestPrio = 0;
        const priorityMapping = new Map();
        schemas.forEach((schema) => {
            // If the schema does not have a priority then give it a default one of [0]
            const priority = this.schemaPriorityMapping.get(schema) || [0];
            priority.forEach((prio) => {
                if (prio > highestPrio) {
                    highestPrio = prio;
                }
                // Build up a mapping of priority to schemas so that we can easily get the highest priority schemas easier
                let currPriorityArray = priorityMapping.get(prio);
                if (currPriorityArray) {
                    currPriorityArray = currPriorityArray.concat(schema);
                    priorityMapping.set(prio, currPriorityArray);
                }
                else {
                    priorityMapping.set(prio, [schema]);
                }
            });
        });
        return priorityMapping.get(highestPrio) || [];
    }
    async resolveCustomSchema(schemaUri, doc) {
        const unresolvedSchema = await this.loadSchema(schemaUri);
        const schema = await this.resolveSchemaContent(unresolvedSchema, schemaUri, []);
        if (schema.schema && typeof schema.schema === 'object') {
            schema.schema.url = schemaUri;
        }
        if (schema.schema && schema.schema.schemaSequence && schema.schema.schemaSequence[doc.currentDocIndex]) {
            return new ResolvedSchema(schema.schema.schemaSequence[doc.currentDocIndex], schema.errors);
        }
        return schema;
    }
    /**
     * Save a schema with schema ID and schema content.
     * Overrides previous schemas set for that schema ID.
     */
    async saveSchema(schemaId, schemaContent) {
        const id = this.normalizeId(schemaId);
        this.getOrAddSchemaHandle(id, schemaContent);
        this.schemaPriorityMapping.set(id, new Set().add(SchemaPriority.Settings));
        return Promise.resolve(undefined);
    }
    /**
     * Delete schemas on specific path
     */
    async deleteSchemas(deletions) {
        deletions.schemas.forEach((s) => {
            this.deleteSchema(s);
        });
        return Promise.resolve(undefined);
    }
    /**
     * Delete a schema with schema ID.
     */
    async deleteSchema(schemaId) {
        const id = this.normalizeId(schemaId);
        if (this.schemasById[id]) {
            delete this.schemasById[id];
        }
        this.schemaPriorityMapping.delete(id);
        return Promise.resolve(undefined);
    }
    /**
     * Add content to a specified schema at a specified path
     */
    async addContent(additions) {
        const schema = await this.getResolvedSchema(additions.schema);
        if (schema) {
            const resolvedSchemaLocation = this.resolveJSONSchemaToSection(schema.schema, additions.path);
            if (typeof resolvedSchemaLocation === 'object') {
                resolvedSchemaLocation[additions.key] = additions.content;
            }
            await this.saveSchema(additions.schema, schema.schema);
        }
    }
    /**
     * Delete content in a specified schema at a specified path
     */
    async deleteContent(deletions) {
        const schema = await this.getResolvedSchema(deletions.schema);
        if (schema) {
            const resolvedSchemaLocation = this.resolveJSONSchemaToSection(schema.schema, deletions.path);
            if (typeof resolvedSchemaLocation === 'object') {
                delete resolvedSchemaLocation[deletions.key];
            }
            await this.saveSchema(deletions.schema, schema.schema);
        }
    }
    /**
     * Take a JSON Schema and the path that you would like to get to
     * @returns the JSON Schema resolved at that specific path
     */
    resolveJSONSchemaToSection(schema, paths) {
        const splitPathway = paths.split('/');
        let resolvedSchemaLocation = schema;
        for (const path of splitPathway) {
            if (path === '') {
                continue;
            }
            this.resolveNext(resolvedSchemaLocation, path);
            resolvedSchemaLocation = resolvedSchemaLocation[path];
        }
        return resolvedSchemaLocation;
    }
    /**
     * Resolve the next Object if they have compatible types
     * @param object a location in the JSON Schema
     * @param token the next token that you want to search for
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolveNext(object, token) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (Array.isArray(object) && isNaN(token)) {
            throw new Error('Expected a number after the array object');
        }
        else if (typeof object === 'object' && typeof token !== 'string') {
            throw new Error('Expected a string after the object');
        }
    }
    /**
     * Everything below here is needed because we're importing from vscode-json-languageservice umd and we need
     * to provide a wrapper around the javascript methods we are calling since they have no type
     */
    normalizeId(id) {
        // The parent's `super.normalizeId(id)` isn't visible, so duplicated the code here
        try {
            return URI.parse(id).toString();
        }
        catch (e) {
            return id;
        }
    }
    /*
     * Everything below here is needed because we're importing from vscode-json-languageservice umd and we need
     * to provide a wrapper around the javascript methods we are calling since they have no type
     */
    getOrAddSchemaHandle(id, unresolvedSchemaContent) {
        return super.getOrAddSchemaHandle(id, unresolvedSchemaContent);
    }
    loadSchema(schemaUri) {
        const requestService = this.requestService;
        return super.loadSchema(schemaUri).then((unresolvedJsonSchema) => {
            // If json-language-server failed to parse the schema, attempt to parse it as YAML instead.
            if (unresolvedJsonSchema.errors && unresolvedJsonSchema.schema === undefined) {
                return requestService(schemaUri).then((content) => {
                    if (!content) {
                        const errorMessage = localize('json.schema.nocontent', "Unable to load schema from '{0}': No content. {1}", toDisplayString(schemaUri), unresolvedJsonSchema.errors);
                        return new UnresolvedSchema({}, [errorMessage]);
                    }
                    try {
                        const schemaContent = parse(content);
                        return new UnresolvedSchema(schemaContent, []);
                    }
                    catch (yamlError) {
                        const errorMessage = localize('json.schema.invalidFormat', "Unable to parse content from '{0}': {1}.", toDisplayString(schemaUri), yamlError);
                        return new UnresolvedSchema({}, [errorMessage]);
                    }
                }, 
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (error) => {
                    let errorMessage = error.toString();
                    const errorSplit = error.toString().split('Error: ');
                    if (errorSplit.length > 1) {
                        // more concise error message, URL and context are attached by caller anyways
                        errorMessage = errorSplit[1];
                    }
                    return new UnresolvedSchema({}, [errorMessage]);
                });
            }
            unresolvedJsonSchema.uri = schemaUri;
            if (this.schemaUriToNameAndDescription.has(schemaUri)) {
                const { name, description, versions } = this.schemaUriToNameAndDescription.get(schemaUri);
                unresolvedJsonSchema.schema.title = name ?? unresolvedJsonSchema.schema.title;
                unresolvedJsonSchema.schema.description = description ?? unresolvedJsonSchema.schema.description;
                unresolvedJsonSchema.schema.versions = versions ?? unresolvedJsonSchema.schema.versions;
            }
            return unresolvedJsonSchema;
        });
    }
    registerExternalSchema(uri, filePatterns, unresolvedSchema, name, description, versions) {
        if (name || description) {
            this.schemaUriToNameAndDescription.set(uri, { name, description, versions });
        }
        return super.registerExternalSchema(uri, filePatterns, unresolvedSchema);
    }
    clearExternalSchemas() {
        super.clearExternalSchemas();
    }
    setSchemaContributions(schemaContributions) {
        super.setSchemaContributions(schemaContributions);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getRegisteredSchemaIds(filter) {
        return super.getRegisteredSchemaIds(filter);
    }
    getResolvedSchema(schemaId) {
        return super.getResolvedSchema(schemaId);
    }
    onResourceChange(uri) {
        return super.onResourceChange(uri);
    }
}
function toDisplayString(url) {
    try {
        const uri = URI.parse(url);
        if (uri.scheme === 'file') {
            return uri.fsPath;
        }
    }
    catch (e) {
        // ignore
    }
    return url;
}
//# sourceMappingURL=yamlSchemaService.js.map