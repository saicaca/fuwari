import { isBoolean } from './objects';
import { isRelativePath, relativeToAbsolutePath } from './paths';
export const KUBERNETES_SCHEMA_URL = 'https://raw.githubusercontent.com/yannh/kubernetes-json-schema/master/v1.22.4-standalone-strict/all.json';
export const JSON_SCHEMASTORE_URL = 'https://www.schemastore.org/api/json/catalog.json';
export function checkSchemaURI(workspaceFolders, workspaceRoot, uri, telemetry) {
    if (uri.trim().toLowerCase() === 'kubernetes') {
        telemetry.send({ name: 'yaml.schema.configured', properties: { kubernetes: true } });
        return KUBERNETES_SCHEMA_URL;
    }
    else if (isRelativePath(uri)) {
        return relativeToAbsolutePath(workspaceFolders, workspaceRoot, uri);
    }
    else {
        return uri;
    }
}
/**
 * Collect all urls of sub schemas
 * @param schema the root schema
 * @returns map url to schema
 */
export function getSchemaUrls(schema) {
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
        if (!isBoolean(subSchema) && subSchema.url && !result.has(subSchema.url)) {
            result.set(subSchema.url, subSchema);
        }
    }
}
//# sourceMappingURL=schemaUrls.js.map