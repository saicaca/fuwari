import { Connection } from 'vscode-languageserver/node';
import { YAMLSchemaService } from '../../languageservice/services/yamlSchemaService';
import { SettingsState } from '../../yamlSettings';
import { JSONSchemaDescription, JSONSchemaDescriptionExt } from '../../requestTypes';
export declare class JSONSchemaSelection {
    private readonly schemaService;
    private readonly yamlSettings?;
    private readonly connection?;
    constructor(schemaService: YAMLSchemaService, yamlSettings?: SettingsState, connection?: Connection);
    getSchemas(docUri: string): Promise<JSONSchemaDescription[]>;
    private getSchemasForFile;
    getAllSchemas(docUri: string): Promise<JSONSchemaDescriptionExt[]>;
}
