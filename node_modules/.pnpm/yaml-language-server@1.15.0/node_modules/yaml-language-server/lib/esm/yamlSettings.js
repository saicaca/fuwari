import { TextDocuments } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { JSON_SCHEMASTORE_URL } from './languageservice/utils/schemaUrls';
// This class is responsible for handling all the settings
export class SettingsState {
    constructor() {
        this.yamlConfigurationSettings = undefined;
        this.schemaAssociations = undefined;
        this.formatterRegistration = null;
        this.specificValidatorPaths = [];
        this.schemaConfigurationSettings = [];
        this.yamlShouldValidate = true;
        this.yamlFormatterSettings = {
            singleQuote: false,
            bracketSpacing: true,
            proseWrap: 'preserve',
            printWidth: 80,
            enable: true,
        };
        this.yamlShouldHover = true;
        this.yamlShouldCompletion = true;
        this.schemaStoreSettings = [];
        this.customTags = [];
        this.schemaStoreEnabled = true;
        this.schemaStoreUrl = JSON_SCHEMASTORE_URL;
        this.indentation = undefined;
        this.disableAdditionalProperties = false;
        this.disableDefaultProperties = false;
        this.suggest = {
            parentSkeletonSelectedFirst: false,
        };
        this.keyOrdering = false;
        this.maxItemsComputed = 5000;
        // File validation helpers
        this.pendingValidationRequests = {};
        this.validationDelayMs = 200;
        // Create a simple text document manager. The text document manager
        // supports full document sync only
        this.documents = new TextDocuments(TextDocument);
        this.workspaceRoot = null;
        this.workspaceFolders = [];
        this.clientDynamicRegisterSupport = false;
        this.hierarchicalDocumentSymbolSupport = false;
        this.hasWorkspaceFolderCapability = false;
        this.hasConfigurationCapability = false;
        this.useVSCodeContentRequest = false;
        this.yamlVersion = '1.2';
        this.useSchemaSelectionRequests = false;
        this.hasWsChangeWatchedFileDynamicRegistration = false;
        this.fileExtensions = ['.yml', '.yaml'];
    }
}
export class TextDocumentTestManager extends TextDocuments {
    constructor() {
        super(TextDocument);
        this.testTextDocuments = new Map();
    }
    get(uri) {
        return this.testTextDocuments.get(uri);
    }
    set(textDocument) {
        this.testTextDocuments.set(textDocument.uri, textDocument);
    }
}
//# sourceMappingURL=yamlSettings.js.map