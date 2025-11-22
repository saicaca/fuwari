"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSchemaUrls = exports.checkSchemaURI = exports.JSON_SCHEMASTORE_URL = exports.KUBERNETES_SCHEMA_URL = void 0;
const objects_1 = require("./objects");
const paths_1 = require("./paths");
exports.KUBERNETES_SCHEMA_URL = 'https://raw.githubusercontent.com/yannh/kubernetes-json-schema/master/v1.22.4-standalone-strict/all.json';
exports.JSON_SCHEMASTORE_URL = 'https://www.schemastore.org/api/json/catalog.json';
function checkSchemaURI(workspaceFolders, workspaceRoot, uri, telemetry) {
    if (uri.trim().toLowerCase() === 'kubernetes') {
        telemetry.send({ name: 'yaml.schema.configured', properties: { kubernetes: true } });
        return exports.KUBERNETES_SCHEMA_URL;
    }
    else if ((0, paths_1.isRelativePath)(uri)) {
        return (0, paths_1.relativeToAbsolutePath)(workspaceFolders, workspaceRoot, uri);
    }
    else {
        return uri;
    }
}
exports.checkSchemaURI = checkSchemaURI;
/**
 * Collect all urls of sub schemas
 * @param schema the root schema
 * @returns map url to schema
 */
function getSchemaUrls(schema) {
    const result = new Map();
    if (!schema) {
        return result;
    }
    if (schema.url) {
        if (schema.url.startsWith('schemaservice://combinedSchema/')) {
            addSchemasForOf(schema, result);
        }
        else {
            result.set(schema.url, schema);
        }
    }
    else {
        addSchemasForOf(schema, result);
    }
    return result;
}
exports.getSchemaUrls = getSchemaUrls;
function addSchemasForOf(schema, result) {
    if (schema.allOf) {
        addInnerSchemaUrls(schema.allOf, result);
    }
    if (schema.anyOf) {
        addInnerSchemaUrls(schema.anyOf, result);
    }
    if (schema.oneOf) {
        addInnerSchemaUrls(schema.oneOf, result);
    }
}
function addInnerSchemaUrls(schemas, result) {
    for (const subSchema of schemas) {
        if (!(0, objects_1.isBoolean)(subSchema) && subSchema.url && !result.has(subSchema.url)) {
            result.set(subSchema.url, subSchema);
        }
    }
}
//# sourceMappingURL=schemaUrls.js.map