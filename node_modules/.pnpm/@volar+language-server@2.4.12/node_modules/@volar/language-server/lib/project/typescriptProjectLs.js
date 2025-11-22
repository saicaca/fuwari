"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTypeScriptLS = createTypeScriptLS;
const language_service_1 = require("@volar/language-service");
const typescript_1 = require("@volar/typescript");
const utilities_1 = require("@volar/typescript/lib/typescript/utilities");
const path = require("path-browserify");
const vscode = require("vscode-languageserver");
const vscode_uri_1 = require("vscode-uri");
const fsFileSnapshots = (0, language_service_1.createUriMap)();
async function createTypeScriptLS(ts, tsLocalized, tsconfig, server, serviceEnv, workspaceFolder, uriConverter, create) {
    let commandLine;
    let projectVersion = 0;
    const getCurrentDirectory = () => uriConverter.asFileName(workspaceFolder);
    const sys = (0, typescript_1.createSys)(ts.sys, serviceEnv, getCurrentDirectory, uriConverter);
    const projectHost = {
        getCurrentDirectory,
        getProjectVersion() {
            return projectVersion.toString();
        },
        getScriptFileNames() {
            return commandLine.fileNames;
        },
        getCompilationSettings() {
            return commandLine.options;
        },
        getLocalizedDiagnosticMessages: tsLocalized ? () => tsLocalized : undefined,
        getProjectReferences() {
            return commandLine.projectReferences;
        },
    };
    const { languagePlugins, setup } = await create({
        env: serviceEnv,
        configFileName: typeof tsconfig === 'string' ? tsconfig : undefined,
        projectHost,
        sys,
        uriConverter,
    });
    const unsavedRootFileUris = (0, language_service_1.createUriMap)();
    const disposables = [
        server.documents.onDidOpen(({ document }) => updateFsCacheFromSyncedDocument(document)),
        server.documents.onDidSave(({ document }) => updateFsCacheFromSyncedDocument(document)),
        server.documents.onDidChangeContent(() => projectVersion++),
        serviceEnv.onDidChangeWatchedFiles?.(async ({ changes }) => {
            const createdOrDeleted = changes.some(change => change.type !== vscode.FileChangeType.Changed);
            if (createdOrDeleted) {
                await updateCommandLine();
            }
            projectVersion++;
        }),
        server.documents.onDidOpen(async ({ document }) => {
            const uri = vscode_uri_1.URI.parse(document.uri);
            const isWorkspaceFile = workspaceFolder.scheme === uri.scheme;
            if (!isWorkspaceFile) {
                return;
            }
            const stat = await serviceEnv.fs?.stat(uri);
            const isUnsaved = stat?.type !== 1;
            if (isUnsaved) {
                const lastProjectVersion = projectVersion;
                await updateCommandLine();
                if (lastProjectVersion !== projectVersion) {
                    unsavedRootFileUris.set(uri, true);
                }
            }
        }),
        server.documents.onDidClose(async ({ document }) => {
            const uri = vscode_uri_1.URI.parse(document.uri);
            if (unsavedRootFileUris.has(uri)) {
                unsavedRootFileUris.delete(uri);
                await updateCommandLine();
            }
        }),
    ].filter(d => !!d);
    await updateCommandLine();
    const language = (0, language_service_1.createLanguage)([
        { getLanguageId: uri => server.documents.get(uri)?.languageId },
        ...languagePlugins,
        { getLanguageId: uri => (0, typescript_1.resolveFileLanguageId)(uri.path) },
    ], (0, language_service_1.createUriMap)(sys.useCaseSensitiveFileNames), (uri, includeFsFiles) => {
        const syncedDocument = server.documents.get(uri);
        let snapshot;
        if (syncedDocument) {
            snapshot = syncedDocument.getSnapshot();
        }
        else if (includeFsFiles) {
            const cache = fsFileSnapshots.get(uri);
            const fileName = uriConverter.asFileName(uri);
            const modifiedTime = sys.getModifiedTime?.(fileName)?.valueOf();
            if (!cache || cache[0] !== modifiedTime) {
                if (sys.fileExists(fileName)) {
                    const text = sys.readFile(fileName);
                    const snapshot = text !== undefined ? ts.ScriptSnapshot.fromString(text) : undefined;
                    fsFileSnapshots.set(uri, [modifiedTime, snapshot]);
                }
                else {
                    fsFileSnapshots.set(uri, [modifiedTime, undefined]);
                }
            }
            snapshot = fsFileSnapshots.get(uri)?.[1];
        }
        if (snapshot) {
            language.scripts.set(uri, snapshot);
        }
        else {
            language.scripts.delete(uri);
        }
    });
    const project = {
        typescript: {
            configFileName: typeof tsconfig === 'string' ? tsconfig : undefined,
            sys,
            uriConverter,
            ...(0, typescript_1.createLanguageServiceHost)(ts, sys, language, s => uriConverter.asUri(s), projectHost),
        },
    };
    setup?.({ language, project });
    const languageService = (0, language_service_1.createLanguageService)(language, server.languageServicePlugins, serviceEnv, project);
    return {
        languageService,
        tryAddFile(fileName) {
            if (!commandLine.fileNames.includes(fileName)) {
                commandLine.fileNames.push(fileName);
                projectVersion++;
            }
        },
        dispose: () => {
            sys.dispose();
            languageService?.dispose();
            disposables.forEach(({ dispose }) => dispose());
            disposables.length = 0;
        },
        getCommandLine: () => commandLine,
    };
    function updateFsCacheFromSyncedDocument(document) {
        const uri = vscode_uri_1.URI.parse(document.uri);
        const fileName = uriConverter.asFileName(uri);
        if (fsFileSnapshots.has(uri) || sys.fileExists(fileName)) {
            const modifiedTime = sys.getModifiedTime?.(fileName);
            fsFileSnapshots.set(uri, [modifiedTime?.valueOf(), document.getSnapshot()]);
        }
    }
    async function updateCommandLine() {
        const oldFileNames = new Set(commandLine?.fileNames ?? []);
        commandLine = await parseConfig(ts, sys, uriConverter.asFileName(workspaceFolder), tsconfig, languagePlugins.map(plugin => plugin.typescript?.extraFileExtensions ?? []).flat());
        const newFileNames = new Set(commandLine.fileNames);
        if (oldFileNames.size !== newFileNames.size || [...oldFileNames].some(fileName => !newFileNames.has(fileName))) {
            projectVersion++;
        }
    }
    async function parseConfig(ts, sys, workspacePath, tsconfig, extraFileExtensions) {
        let commandLine = {
            errors: [],
            fileNames: [],
            options: {},
        };
        let sysVersion;
        let newSysVersion = await sys.sync();
        while (sysVersion !== newSysVersion) {
            sysVersion = newSysVersion;
            try {
                commandLine = await parseConfigWorker(ts, sys, workspacePath, tsconfig, extraFileExtensions);
            }
            catch {
                // will be failed if web fs host first result not ready
            }
            newSysVersion = await sys.sync();
        }
        return commandLine;
    }
    function parseConfigWorker(ts, _host, workspacePath, tsconfig, extraFileExtensions) {
        let content = {
            errors: [],
            fileNames: [],
            options: {},
        };
        const maybeUnsavedFileNames = server.documents.all()
            .map(document => vscode_uri_1.URI.parse(document.uri))
            .filter(uri => uri.scheme === workspaceFolder.scheme)
            .map(uri => uriConverter.asFileName(uri));
        const host = {
            ..._host,
            readDirectory(rootDir, extensions, excludes, includes, depth) {
                const fsFiles = _host.readDirectory(rootDir, extensions, excludes, includes, depth);
                const unsavedFiles = (0, utilities_1.matchFiles)(rootDir, extensions, excludes, includes, sys.useCaseSensitiveFileNames, getCurrentDirectory(), depth, dirPath => {
                    dirPath = dirPath.replace(/\\/g, '/');
                    const files = [];
                    const dirs = [];
                    for (const fileName of maybeUnsavedFileNames) {
                        const match = sys.useCaseSensitiveFileNames
                            ? fileName.startsWith(dirPath + '/')
                            : fileName.toLowerCase().startsWith(dirPath.toLowerCase() + '/');
                        if (match) {
                            const name = fileName.slice(dirPath.length + 1);
                            if (name.includes('/')) {
                                const dir = name.split('/')[0];
                                if (!dirs.includes(dir)) {
                                    dirs.push(dir);
                                }
                            }
                            else {
                                files.push(name);
                            }
                        }
                    }
                    return {
                        files,
                        directories: dirs,
                    };
                }, path => path);
                if (!unsavedFiles.length) {
                    return fsFiles;
                }
                return [...new Set([...fsFiles, ...unsavedFiles])];
            },
        };
        if (typeof tsconfig === 'string') {
            const config = ts.readJsonConfigFile(tsconfig, host.readFile);
            content = ts.parseJsonSourceFileConfigFileContent(config, host, path.dirname(tsconfig), {}, tsconfig, undefined, extraFileExtensions);
        }
        else {
            content = ts.parseJsonConfigFileContent({ files: [] }, host, workspacePath, tsconfig, workspacePath + '/jsconfig.json', undefined, extraFileExtensions);
        }
        // fix https://github.com/johnsoncodehk/volar/issues/1786
        // https://github.com/microsoft/TypeScript/issues/30457
        // patching ts server broke with outDir + rootDir + composite/incremental
        content.options.outDir = undefined;
        content.fileNames = content.fileNames.map(fileName => fileName.replace(/\\/g, '/'));
        return content;
    }
}
//# sourceMappingURL=typescriptProjectLs.js.map