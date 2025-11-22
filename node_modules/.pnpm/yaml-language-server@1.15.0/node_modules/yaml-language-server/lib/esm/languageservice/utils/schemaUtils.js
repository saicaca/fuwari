import { URI } from 'vscode-uri';
import * as path from 'path';
export function getSchemaTypeName(schema) {
    const closestTitleWithType = schema.type && schema.closestTitle;
    if (schema.title) {
        return schema.title;
    }
    if (schema.$id) {
        return getSchemaRefTypeTitle(schema.$id);
    }
    if (schema.$ref || schema._$ref) {
        return getSchemaRefTypeTitle(schema.$ref || schema._$ref);
    }
    return Array.isArray(schema.type)
        ? schema.type.join(' | ')
        : closestTitleWithType
            ? schema.type.concat('(', schema.closestTitle, ')')
            : schema.type || schema.closestTitle; //object
}
/**
 * Get type name from reference url
 * @param $ref reference to the same file OR to the another component OR to the section in another component:
 * `schema-name.schema.json` -> schema-name
 * `custom-scheme://shared-schema.json#/definitions/SomeType` -> SomeType
 * `custom-scheme://schema-name.schema.json` -> schema-name
 * `shared-schema.schema.json#/definitions/SomeType` -> SomeType
 * `file:///Users/user/Documents/project/schemas/schema-name.schema.json` -> schema-name
 * `#/definitions/SomeType` -> SomeType
 * `#/definitions/io.k8s.api.apps.v1.DaemonSetSpec` => io.k8s.api.apps.v1.DaemonSetSpec
 * `file:///default_schema_id.yaml` => default_schema_id.yaml
 * test: https://regex101.com/r/ZpuXxk/1
 */
export function getSchemaRefTypeTitle($ref) {
    const match = $ref.match(/^(?:.*\/)?(.*?)(?:\.schema\.json)?$/);
    let type = !!match && match[1];
    if (!type) {
        type = 'typeNotFound';
        console.error(`$ref (${$ref}) not parsed properly`);
    }
    return type;
}
export function getSchemaTitle(schema, url) {
    const uri = URI.parse(url);
    let baseName = path.basename(uri.fsPath);
    if (!path.extname(uri.fsPath)) {
        baseName += '.json';
    }
    if (Object.getOwnPropertyDescriptor(schema, 'name')) {
        return Object.getOwnPropertyDescriptor(schema, 'name').value + ` (${baseName})`;
    }
    else if (schema.title) {
        return schema.description ? schema.title + ' - ' + schema.description + ` (${baseName})` : schema.title + ` (${baseName})`;
    }
    return baseName;
}
export function isPrimitiveType(schema) {
    return schema.type !== 'object' && !isAnyOfAllOfOneOfType(schema);
}
export function isAnyOfAllOfOneOfType(schema) {
    return !!(schema.anyOf || schema.allOf || schema.oneOf);
}
//# sourceMappingURL=schemaUtils.js.map