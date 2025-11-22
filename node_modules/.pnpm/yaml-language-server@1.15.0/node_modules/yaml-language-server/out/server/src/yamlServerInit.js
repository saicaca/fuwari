"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YAMLServerInit = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
const yamlLanguageService_1 = require("./languageservice/yamlLanguageService");
const paths_1 = require("./languageservice/utils/paths");
const vscode_uri_1 = require("vscode-uri");
const languageHandlers_1 = require("./languageserver/handlers/languageHandlers");
const notificationHandlers_1 = require("./languageserver/handlers/notificationHandlers");
const requestHandlers_1 = require("./languageserver/handlers/requestHandlers");
const validationHandlers_1 = require("./languageserver/handlers/validationHandlers");
const settingsHandlers_1 = require("./languageserver/handlers/settingsHandlers");
const commands_1 = require("./commands");
const workspaceHandlers_1 = require("./languageserver/handlers/workspaceHandlers");
const commandExecutor_1 = require("./languageserver/commandExecutor");
const yamlCommands_1 = require("./languageservice/services/yamlCommands");
class YAMLServerInit {
    constructor(connection, yamlSettings, workspaceContext, schemaRequestService, telemetry) {
        this.connection = connection;
        this.yamlSettings = yamlSettings;
        this.workspaceContext = workspaceContext;
        this.schemaRequestService = schemaRequestService;
        this.telemetry = telemetry;
        this.yamlSettings.documents.listen(this.connection);
        /**
         * Run when the client connects to the server after it is activated.
         * The server receives the root path(s) of the workspace and the client capabilities.
         */
        this.connection.onInitialize((params) => {
            return this.connectionInitialized(params);
        });
        this.connection.onInitialized(() => {
            if (this.yamlSettings.hasWsChangeWatchedFileDynamicRegistration) {
                this.connection.workspace.onDidChangeWorkspaceFolders((changedFolders) => {
                    this.yamlSettings.workspaceFolders = (0, paths_1.workspaceFoldersChanged)(this.yamlSettings.workspaceFolders, changedFolders);
                });
            }
            // need to call this after connection initialized
            this.settingsHandler.registerHandlers();
            this.settingsHandler.pullConfiguration();
        });
    }
    // public for test setup
    connectionInitialized(params) {
        this.yamlSettings.capabilities = params.capabilities;
        this.languageService = (0, yamlLanguageService_1.getLanguageService)({
            schemaRequestService: this.schemaRequestService,
            workspaceContext: this.workspaceContext,
            connection: this.connection,
            yamlSettings: this.yamlSettings,
            telemetry: this.telemetry,
            clientCapabilities: params.capabilities,
        });
        // Only try to parse the workspace root if its not null. Otherwise initialize will fail
        if (params.rootUri) {
            this.yamlSettings.workspaceRoot = vscode_uri_1.URI.parse(params.rootUri);
        }
        this.yamlSettings.workspaceFolders = params.workspaceFolders || [];
        this.yamlSettings.hierarchicalDocumentSymbolSupport = !!(this.yamlSettings.capabilities.textDocument &&
            this.yamlSettings.capabilities.textDocument.documentSymbol &&
            this.yamlSettings.capabilities.textDocument.documentSymbol.hierarchicalDocumentSymbolSupport);
        this.yamlSettings.clientDynamicRegisterSupport = !!(this.yamlSettings.capabilities.textDocument &&
            this.yamlSettings.capabilities.textDocument.rangeFormatting &&
            this.yamlSettings.capabilities.textDocument.rangeFormatting.dynamicRegistration);
        this.yamlSettings.hasWorkspaceFolderCapability =
            this.yamlSettings.capabilities.workspace && !!this.yamlSettings.capabilities.workspace.workspaceFolders;
        this.yamlSettings.hasConfigurationCapability = !!(this.yamlSettings.capabilities.workspace && !!this.yamlSettings.capabilities.workspace.configuration);
        this.yamlSettings.hasWsChangeWatchedFileDynamicRegistration = !!(this.yamlSettings.capabilities.workspace &&
            this.yamlSettings.capabilities.workspace.didChangeWatchedFiles &&
            this.yamlSettings.capabilities.workspace.didChangeWatchedFiles.dynamicRegistration);
        this.registerHandlers();
        (0, yamlCommands_1.registerCommands)(commandExecutor_1.commandExecutor, this.connection);
        return {
            capabilities: {
                textDocumentSync: vscode_languageserver_1.TextDocumentSyncKind.Incremental,
                completionProvider: { resolveProvider: false },
                hoverProvider: true,
                documentSymbolProvider: true,
                documentFormattingProvider: false,
                documentOnTypeFormattingProvider: {
                    firstTriggerCharacter: '\n',
                },
                documentRangeFormattingProvider: false,
                definitionProvider: true,
                documentLinkProvider: {},
                foldingRangeProvider: true,
                selectionRangeProvider: true,
                codeActionProvider: true,
                codeLensProvider: {
                    resolveProvider: false,
                },
                executeCommandProvider: {
                    commands: Object.keys(commands_1.YamlCommands).map((k) => commands_1.YamlCommands[k]),
                },
                workspace: {
                    workspaceFolders: {
                        changeNotifications: true,
                        supported: true,
                    },
                },
            },
        };
    }
    registerHandlers() {
        // Register all features that the language server has
        this.validationHandler = new validationHandlers_1.ValidationHandler(this.connection, this.languageService, this.yamlSettings);
        this.settingsHandler = new settingsHandlers_1.SettingsHandler(this.connection, this.languageService, this.yamlSettings, this.validationHandler, this.telemetry);
        // this.settingsHandler.registerHandlers();
        this.languageHandler = new languageHandlers_1.LanguageHandlers(this.connection, this.languageService, this.yamlSettings, this.validationHandler);
        this.languageHandler.registerHandlers();
        new notificationHandlers_1.NotificationHandlers(this.connection, this.languageService, this.yamlSettings, this.settingsHandler).registerHandlers();
        new requestHandlers_1.RequestHandlers(this.connection, this.languageService).registerHandlers();
        new workspaceHandlers_1.WorkspaceHandlers(this.connection, commandExecutor_1.commandExecutor).registerHandlers();
    }
    start() {
        this.connection.listen();
    }
}
exports.YAMLServerInit = YAMLServerInit;
//# sourceMappingURL=yamlServerInit.js.map