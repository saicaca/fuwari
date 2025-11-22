/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { findLinks as JSONFindLinks } from 'vscode-json-languageservice/lib/umd/services/jsonLinks';
import { yamlDocumentsCache } from '../parser/yaml-documents';
import { convertErrorToTelemetryMsg } from '../utils/objects';
export class YamlLinks {
    constructor(telemetry) {
        this.telemetry = telemetry;
    }
    findLinks(document) {
        try {
            const doc = yamlDocumentsCache.getYamlDocument(document);
            // Find links across all YAML Documents then report them back once finished
            const linkPromises = [];
            for (const yamlDoc of doc.documents) {
                linkPromises.push(JSONFindLinks(document, yamlDoc));
            }
            // Wait for all the promises to return and then flatten them into one DocumentLink array
            return Promise.all(linkPromises).then((yamlLinkArray) => [].concat(...yamlLinkArray));
        }
        catch (err) {
            this.telemetry?.sendError('yaml.documentLink.error', { error: convertErrorToTelemetryMsg(err) });
        }
    }
}
//# sourceMappingURL=yamlLinks.js.map