"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const chai_1 = require("chai");
const src_1 = require("../src");
const schemaRequestHandler_1 = require("../src/languageservice/services/schemaRequestHandler");
const testHelper_1 = require("./utils/testHelper");
/**
 * Builds a simple schema request service
 * @param contentMap Mapping of a schema uri to the schema content
 */
function schemaRequestServiceBuilder(contentMap) {
    return async (uri) => {
        return contentMap[uri];
    };
}
describe('getLanguageService()', () => {
    it('successfully creates an instance without optional arguments', () => {
        (0, src_1.getLanguageService)({
            schemaRequestService: {},
            workspaceContext: {},
        });
    });
    describe('minimal language service hover happy path', () => {
        const schemaUri = 'my.schema.uri';
        const schemaContentMap = {};
        let schemaRequestService;
        let textDocument;
        let hoverPosition; // Position the 'mouse' is hovering on the content
        let minimalYamlService;
        before(async () => {
            // Setup object that resolves schema content
            schemaContentMap[schemaUri] = `
        {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "type": "object",
            "properties": {
                "firstName": {
                "type": "string",
                "description": "The person's first name."
                }
            }
        }
      `;
            schemaRequestService = schemaRequestServiceBuilder(schemaContentMap);
            // Setup the document and where the hover is on it
            const contentWithHoverPosition = 'fi|r|stName: "Nikolas"';
            const { content, position: offset } = (0, testHelper_1.caretPosition)(contentWithHoverPosition);
            textDocument = (0, testHelper_1.setupSchemaIDTextDocument)(content);
            hoverPosition = textDocument.positionAt(offset);
            // Setup minimal language service + indicate to provide hover functionality
            minimalYamlService = (0, src_1.getLanguageService)({
                schemaRequestService: schemaRequestService,
                workspaceContext: schemaRequestHandler_1.workspaceContext,
            });
            minimalYamlService.configure({
                hover: true,
                schemas: [
                    {
                        fileMatch: [textDocument.uri],
                        uri: schemaUri,
                    },
                ],
            });
        });
        it('successfully creates an instance without optional arguments', async () => {
            const result = await minimalYamlService.doHover(textDocument, hoverPosition);
            chai_1.assert.deepEqual(result, {
                contents: {
                    kind: 'markdown',
                    value: "The person's first name\\.\n\nSource: [my.schema.uri](my.schema.uri)",
                },
                range: {
                    start: {
                        line: 0,
                        character: 0,
                    },
                    end: {
                        line: 0,
                        character: 9,
                    },
                },
            });
        });
    });
});
//# sourceMappingURL=yamlLanguageService.test.js.map