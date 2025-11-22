"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServerBase = createServerBase;
const configurations_js_1 = require("./features/configurations.js");
const editorFeatures_js_1 = require("./features/editorFeatures.js");
const fileSystem_js_1 = require("./features/fileSystem.js");
const fileWatcher_js_1 = require("./features/fileWatcher.js");
const languageFeatures_js_1 = require("./features/languageFeatures.js");
const textDocuments_js_1 = require("./features/textDocuments.js");
const workspaceFolders_js_1 = require("./features/workspaceFolders.js");
function createServerBase(connection, env) {
    const onInitializeCallbacks = [];
    const onInitializedCallbacks = [];
    const state = {
        env,
        connection,
        initializeParams: undefined,
        project: undefined,
        languageServicePlugins: undefined,
        onInitialize(callback) {
            onInitializeCallbacks.push(callback);
        },
        onInitialized(callback) {
            onInitializedCallbacks.push(callback);
        },
    };
    const configurations = (0, configurations_js_1.register)(state);
    const editorFeatures = (0, editorFeatures_js_1.register)(state);
    const documents = (0, textDocuments_js_1.register)(state);
    const workspaceFolders = (0, workspaceFolders_js_1.register)(state);
    const fileWatcher = (0, fileWatcher_js_1.register)(state);
    const languageFeatures = (0, languageFeatures_js_1.register)(state, documents, configurations);
    const fileSystem = (0, fileSystem_js_1.register)(documents, fileWatcher);
    const server = {
        ...state,
        get initializeParams() {
            return state.initializeParams;
        },
        get project() {
            return state.project;
        },
        get languageServicePlugins() {
            return state.languageServicePlugins;
        },
        initialize(params, project, languageServicePlugins) {
            state.initializeParams = params;
            state.project = project;
            state.languageServicePlugins = languageServicePlugins;
            const serverCapabilities = {};
            onInitializeCallbacks.forEach(cb => cb(serverCapabilities));
            return { capabilities: serverCapabilities };
        },
        initialized() {
            onInitializedCallbacks.forEach(cb => cb());
            state.project.setup(server);
        },
        shutdown() {
            state.project.reload();
        },
        configurations,
        editorFeatures,
        documents,
        workspaceFolders,
        fileWatcher,
        languageFeatures,
        fileSystem,
    };
    return server;
}
//# sourceMappingURL=server.js.map