"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSimpleProject = createSimpleProject;
exports.createLanguageServiceEnvironment = createLanguageServiceEnvironment;
const language_service_1 = require("@volar/language-service");
function createSimpleProject(languagePlugins) {
    let server;
    let languageService;
    return {
        setup(_server) {
            server = _server;
            const language = (0, language_service_1.createLanguage)([
                { getLanguageId: uri => server.documents.get(uri)?.languageId },
                ...languagePlugins,
            ], (0, language_service_1.createUriMap)(false), uri => {
                const document = server.documents.get(uri);
                if (document) {
                    language.scripts.set(uri, document.getSnapshot(), document.languageId);
                }
                else {
                    language.scripts.delete(uri);
                }
            });
            languageService = (0, language_service_1.createLanguageService)(language, server.languageServicePlugins, createLanguageServiceEnvironment(server, server.workspaceFolders.all), {});
        },
        getLanguageService() {
            return languageService;
        },
        getExistingLanguageServices() {
            return [languageService];
        },
        reload() {
            languageService.dispose();
            this.setup(server);
        },
    };
}
function createLanguageServiceEnvironment(server, workspaceFolders) {
    return {
        workspaceFolders,
        fs: server.fileSystem,
        locale: server.initializeParams?.locale,
        clientCapabilities: server.initializeParams?.capabilities,
        getConfiguration: server.configurations.get,
        onDidChangeConfiguration: server.configurations.onDidChange,
        onDidChangeWatchedFiles: server.fileWatcher.onDidChangeWatchedFiles,
    };
}
//# sourceMappingURL=simpleProject.js.map