import { WorkspaceFolder } from 'vscode-languageserver-protocol';
import { URI } from 'vscode-uri';
import { Telemetry } from '../telemetry';
import { JSONSchema } from '../jsonSchema';
export declare const KUBERNETES_SCHEMA_URL = "https://raw.githubusercontent.com/yannh/kubernetes-json-schema/master/v1.22.4-standalone-strict/all.json";
export declare const JSON_SCHEMASTORE_URL = "https://www.schemastore.org/api/json/catalog.json";
export declare function checkSchemaURI(workspaceFolders: WorkspaceFolder[], workspaceRoot: URI, uri: string, telemetry: Telemetry): string;
/**
 * Collect all urls of sub schemas
 * @param schema the root schema
 * @returns map url to schema
 */
export declare function getSchemaUrls(schema: JSONSchema): Map<string, JSONSchema>;
