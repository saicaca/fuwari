/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { MarkupKind, Range } from 'vscode-languageserver-types';
import { matchOffsetToDocument } from '../utils/arrUtils';
import { setKubernetesParserOption } from '../parser/isKubernetes';
import { yamlDocumentsCache } from '../parser/yaml-documents';
import { URI } from 'vscode-uri';
import * as path from 'path';
import { convertErrorToTelemetryMsg } from '../utils/objects';
import { stringify as stringifyYAML } from 'yaml';
export class YAMLHover {
    constructor(schemaService, telemetry) {
        this.telemetry = telemetry;
        this.shouldHover = true;
        this.schemaService = schemaService;
    }
    configure(languageSettings) {
        if (languageSettings) {
            this.shouldHover = languageSettings.hover;
            this.indentation = languageSettings.indentation;
        }
    }
    doHover(document, position, isKubernetes = false) {
        try {
            if (!this.shouldHover || !document) {
                return Promise.resolve(undefined);
            }
            const doc = yamlDocumentsCache.getYamlDocument(document);
            const offset = document.offsetAt(position);
            const currentDoc = matchOffsetToDocument(offset, doc);
            if (currentDoc === null) {
                return Promise.resolve(undefined);
            }
            setKubernetesParserOption(doc.documents, isKubernetes);
            const currentDocIndex = doc.documents.indexOf(currentDoc);
            currentDoc.currentDocIndex = currentDocIndex;
            return this.getHover(document, position, currentDoc);
        }
        catch (error) {
            this.telemetry?.sendError('yaml.hover.error', { error: convertErrorToTelemetryMsg(error) });
        }
    }
    // method copied from https://github.com/microsoft/vscode-json-languageservice/blob/2ea5ad3d2ffbbe40dea11cfe764a502becf113ce/src/services/jsonHover.ts#L23
    getHover(document, position, doc) {
        const offset = document.offsetAt(position);
        let node = doc.getNodeFromOffset(offset);
        if (!node ||
            ((node.type === 'object' || node.type === 'array') && offset > node.offset + 1 && offset < node.offset + node.length - 1)) {
            return Promise.resolve(null);
        }
        const hoverRangeNode = node;
        // use the property description when hovering over an object key
        if (node.type === 'string') {
            const parent = node.parent;
            if (parent && parent.type === 'property' && parent.keyNode === node) {
                node = parent.valueNode;
                if (!node) {
                    return Promise.resolve(null);
                }
            }
        }
        const hoverRange = Range.create(document.positionAt(hoverRangeNode.offset), document.positionAt(hoverRangeNode.offset + hoverRangeNode.length));
        const createHover = (contents) => {
            const markupContent = {
                kind: MarkupKind.Markdown,
                value: contents,
            };
            const result = {
                contents: markupContent,
                range: hoverRange,
            };
            return result;
        };
        const removePipe = (value) => {
            return value.replace(/\|\|\s*$/, '');
        };
        return this.schemaService.getSchemaForResource(document.uri, doc).then((schema) => {
            if (schema && node && !schema.errors.length) {
                const matchingSchemas = doc.getMatchingSchemas(schema.schema, node.offset);
                let title = undefined;
                let markdownDescription = undefined;
                let markdownEnumDescriptions = [];
                const markdownExamples = [];
                const markdownEnums = [];
                matchingSchemas.every((s) => {
                    if ((s.node === node || (node.type === 'property' && node.valueNode === s.node)) && !s.inverted && s.schema) {
                        title = title || s.schema.title || s.schema.closestTitle;
                        markdownDescription = markdownDescription || s.schema.markdownDescription || this.toMarkdown(s.schema.description);
                        if (s.schema.enum) {
                            if (s.schema.markdownEnumDescriptions) {
                                markdownEnumDescriptions = s.schema.markdownEnumDescriptions;
                            }
                            else if (s.schema.enumDescriptions) {
                                markdownEnumDescriptions = s.schema.enumDescriptions.map(this.toMarkdown, this);
                            }
                            else {
                                markdownEnumDescriptions = [];
                            }
                            s.schema.enum.forEach((enumValue, idx) => {
                                if (typeof enumValue !== 'string') {
                                    enumValue = JSON.stringify(enumValue);
                                }
                                markdownEnums.push({
                                    value: enumValue,
                                    description: markdownEnumDescriptions[idx],
                                });
                            });
                        }
                        if (s.schema.anyOf && isAllSchemasMatched(node, matchingSchemas, s.schema)) {
                            //if append title and description of all matched schemas on hover
                            title = '';
                            markdownDescription = '';
                            s.schema.anyOf.forEach((childSchema, index) => {
                                title += childSchema.title || s.schema.closestTitle || '';
                                markdownDescription += childSchema.markdownDescription || this.toMarkdown(childSchema.description) || '';
                                if (index !== s.schema.anyOf.length - 1) {
                                    title += ' || ';
                                    markdownDescription += ' || ';
                                }
                            });
                            title = removePipe(title);
                            markdownDescription = removePipe(markdownDescription);
                        }
                        if (s.schema.examples) {
                            s.schema.examples.forEach((example) => {
                                markdownExamples.push(stringifyYAML(example, null, 2));
                            });
                        }
                    }
                    return true;
                });
                let result = '';
                if (title) {
                    result = '#### ' + this.toMarkdown(title);
                }
                if (markdownDescription) {
                    result = ensureLineBreak(result);
                    result += markdownDescription;
                }
                if (markdownEnums.length !== 0) {
                    result = ensureLineBreak(result);
                    result += 'Allowed Values:\n\n';
                    markdownEnums.forEach((me) => {
                        if (me.description) {
                            result += `* \`${toMarkdownCodeBlock(me.value)}\`: ${me.description}\n`;
                        }
                        else {
                            result += `* \`${toMarkdownCodeBlock(me.value)}\`\n`;
                        }
                    });
                }
                if (markdownExamples.length !== 0) {
                    markdownExamples.forEach((example) => {
                        result = ensureLineBreak(result);
                        result += 'Example:\n\n';
                        result += `\`\`\`yaml\n${example}\`\`\`\n`;
                    });
                }
                if (result.length > 0 && schema.schema.url) {
                    result = ensureLineBreak(result);
                    result += `Source: [${getSchemaName(schema.schema)}](${schema.schema.url})`;
                }
                return createHover(result);
            }
            return null;
        });
    }
    // copied from https://github.com/microsoft/vscode-json-languageservice/blob/2ea5ad3d2ffbbe40dea11cfe764a502becf113ce/src/services/jsonHover.ts#L112
    toMarkdown(plain) {
        if (plain) {
            let escaped = plain.replace(/([^\n\r])(\r?\n)([^\n\r])/gm, '$1\n\n$3'); // single new lines to \n\n (Markdown paragraph)
            escaped = escaped.replace(/[\\`*_{}[\]()#+\-.!]/g, '\\$&'); // escape markdown syntax tokens: http://daringfireball.net/projects/markdown/syntax#backslash
            if (this.indentation !== undefined) {
                // escape indentation whitespace to prevent it from being converted to markdown code blocks.
                const indentationMatchRegex = new RegExp(` {${this.indentation.length}}`, 'g');
                escaped = escaped.replace(indentationMatchRegex, '&emsp;');
            }
            return escaped;
        }
        return undefined;
    }
}
function ensureLineBreak(content) {
    if (content.length === 0) {
        return content;
    }
    if (!content.endsWith('\n')) {
        content += '\n';
    }
    return content + '\n';
}
function getSchemaName(schema) {
    let result = 'JSON Schema';
    const urlString = schema.url;
    if (urlString) {
        const url = URI.parse(urlString);
        result = path.basename(url.fsPath);
    }
    else if (schema.title) {
        result = schema.title;
    }
    return result;
}
// copied from https://github.com/microsoft/vscode-json-languageservice/blob/2ea5ad3d2ffbbe40dea11cfe764a502becf113ce/src/services/jsonHover.ts#L122
function toMarkdownCodeBlock(content) {
    // see https://daringfireball.net/projects/markdown/syntax#precode
    if (content.indexOf('`') !== -1) {
        return '`` ' + content + ' ``';
    }
    return content;
}
/**
 * check all the schemas which is inside anyOf presented or not in matching schema.
 * @param node node
 * @param matchingSchemas all matching schema
 * @param schema scheam which is having anyOf
 * @returns true if all the schemas which inside anyOf presents in matching schema
 */
function isAllSchemasMatched(node, matchingSchemas, schema) {
    let count = 0;
    for (const matchSchema of matchingSchemas) {
        if (node === matchSchema.node && matchSchema.schema !== schema) {
            schema.anyOf.forEach((childSchema) => {
                if (matchSchema.schema.title === childSchema.title &&
                    matchSchema.schema.description === childSchema.description &&
                    matchSchema.schema.properties === childSchema.properties) {
                    count++;
                }
            });
        }
    }
    return count === schema.anyOf.length;
}
//# sourceMappingURL=yamlHover.js.map