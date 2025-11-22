import { JSONSchema } from '../jsonSchema';
export declare function getSchemaTypeName(schema: JSONSchema): string;
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
export declare function getSchemaRefTypeTitle($ref: string): string;
export declare function getSchemaTitle(schema: JSONSchema, url: string): string;
export declare function isPrimitiveType(schema: JSONSchema): boolean;
export declare function isAnyOfAllOfOneOfType(schema: JSONSchema): boolean;
