"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTypeScriptProject = createTypeScriptProject;
exports.createUriConverter = createUriConverter;
exports.sortTSConfigs = sortTSConfigs;
exports.isFileInDir = isFileInDir;
exports.getWorkspaceFolder = getWorkspaceFolder;
const language_service_1 = require("@volar/language-service");
const path = require("path-browserify");
const vscode = require("vscode-languageserver");
const vscode_uri_1 = require("vscode-uri");
const inferredCompilerOptions_1 = require("./inferredCompilerOptions");
const simpleProject_1 = require("./simpleProject");
const typescriptProjectLs_1 = require("./typescriptProjectLs");
const rootTsConfigNames = ['tsconfig.json', 'jsconfig.json'];
function createTypeScriptProject(ts, tsLocalized, create) {
    let server;
    let uriConverter;
    const configProjects = (0, language_service_1.createUriMap)();
    const inferredProjects = (0, language_service_1.createUriMap)();
    const rootTsConfigs = new Set();
    const searchedDirs = new Set();
    return {
        setup(_server) {
            uriConverter = createUriConverter(_server.workspaceFolders.all);
            server = _server;
            server.fileWatcher.onDidChangeWatchedFiles(({ changes }) => {
                const tsConfigChanges = changes.filter(change => rootTsConfigNames.includes(change.uri.substring(change.uri.lastIndexOf('/') + 1)));
                for (const change of tsConfigChanges) {
                    const changeUri = vscode_uri_1.URI.parse(change.uri);
                    const changeFileName = uriConverter.asFileName(changeUri);
                    if (change.type === vscode.FileChangeType.Created) {
                        rootTsConfigs.add(changeFileName);
                    }
                    else if ((change.type === vscode.FileChangeType.Changed || change.type === vscode.FileChangeType.Deleted) && configProjects.has(changeUri)) {
                        if (change.type === vscode.FileChangeType.Deleted) {
                            rootTsConfigs.delete(changeFileName);
                        }
                        const project = configProjects.get(changeUri);
                        configProjects.delete(changeUri);
                        project?.then(project => project.dispose());
                    }
                }
                server.languageFeatures.requestRefresh(!!tsConfigChanges.length);
            });
        },
        async getLanguageService(uri) {
            const tsconfig = await findMatchTSConfig(server, uri);
            if (tsconfig) {
                const project = await getOrCreateConfiguredProject(server, tsconfig);
                return project.languageService;
            }
            const workspaceFolder = getWorkspaceFolder(uri, server.workspaceFolders);
            const project = await getOrCreateInferredProject(server, uri, workspaceFolder);
            return project.languageService;
        },
        async getExistingLanguageServices() {
            const projects = await Promise.all([
                ...configProjects.values() ?? [],
                ...inferredProjects.values() ?? [],
            ]);
            return projects.map(project => project.languageService);
        },
        reload() {
            for (const project of [
                ...configProjects.values() ?? [],
                ...inferredProjects.values() ?? [],
            ]) {
                project.then(p => p.dispose());
            }
            configProjects.clear();
            inferredProjects.clear();
        },
    };
    async function findMatchTSConfig(server, uri) {
        const fileName = uriConverter.asFileName(uri);
        let dir = path.dirname(fileName);
        while (true) {
            if (searchedDirs.has(dir)) {
                break;
            }
            searchedDirs.add(dir);
            for (const tsConfigName of rootTsConfigNames) {
                const tsconfigPath = path.join(dir, tsConfigName);
                if ((await server.fileSystem.stat?.(uriConverter.asUri(tsconfigPath)))?.type === language_service_1.FileType.File) {
                    rootTsConfigs.add(tsconfigPath);
                }
            }
            dir = path.dirname(dir);
        }
        await prepareClosestootCommandLine();
        return await findDirectIncludeTsconfig() ?? await findIndirectReferenceTsconfig();
        async function prepareClosestootCommandLine() {
            let matches = [];
            for (const rootTsConfig of rootTsConfigs) {
                if (isFileInDir(fileName, path.dirname(rootTsConfig))) {
                    matches.push(rootTsConfig);
                }
            }
            matches = matches.sort((a, b) => sortTSConfigs(fileName, a, b));
            if (matches.length) {
                await getCommandLine(matches[0]);
            }
        }
        function findIndirectReferenceTsconfig() {
            return findTSConfig(async (tsconfig) => {
                const tsconfigUri = uriConverter.asUri(tsconfig);
                const project = await configProjects.get(tsconfigUri);
                const languageService = project?.languageService.context.inject('typescript/languageService');
                return !!languageService?.getProgram()?.getSourceFile(fileName);
            });
        }
        function findDirectIncludeTsconfig() {
            return findTSConfig(async (tsconfig) => {
                const map = (0, language_service_1.createUriMap)();
                const commandLine = await getCommandLine(tsconfig);
                for (const fileName of commandLine?.fileNames ?? []) {
                    const uri = uriConverter.asUri(fileName);
                    map.set(uri, true);
                }
                return map.has(uri);
            });
        }
        async function findTSConfig(match) {
            const checked = new Set();
            for (const rootTsConfig of [...rootTsConfigs].sort((a, b) => sortTSConfigs(fileName, a, b))) {
                const tsconfigUri = uriConverter.asUri(rootTsConfig);
                const project = await configProjects.get(tsconfigUri);
                if (project) {
                    let chains = await getReferencesChains(project.getCommandLine(), rootTsConfig, []);
                    // This is to be consistent with tsserver behavior
                    chains = chains.reverse();
                    for (const chain of chains) {
                        for (let i = chain.length - 1; i >= 0; i--) {
                            const tsconfig = chain[i];
                            if (checked.has(tsconfig)) {
                                continue;
                            }
                            checked.add(tsconfig);
                            if (await match(tsconfig)) {
                                return tsconfig;
                            }
                        }
                    }
                }
            }
        }
        async function getReferencesChains(commandLine, tsConfig, before) {
            if (commandLine.projectReferences?.length) {
                const newChains = [];
                for (const projectReference of commandLine.projectReferences) {
                    let tsConfigPath = projectReference.path.replace(/\\/g, '/');
                    // fix https://github.com/johnsoncodehk/volar/issues/712
                    if ((await server.fileSystem.stat?.(uriConverter.asUri(tsConfigPath)))?.type === language_service_1.FileType.File) {
                        const newTsConfigPath = path.join(tsConfigPath, 'tsconfig.json');
                        const newJsConfigPath = path.join(tsConfigPath, 'jsconfig.json');
                        if ((await server.fileSystem.stat?.(uriConverter.asUri(newTsConfigPath)))?.type === language_service_1.FileType.File) {
                            tsConfigPath = newTsConfigPath;
                        }
                        else if ((await server.fileSystem.stat?.(uriConverter.asUri(newJsConfigPath)))?.type === language_service_1.FileType.File) {
                            tsConfigPath = newJsConfigPath;
                        }
                    }
                    const beforeIndex = before.indexOf(tsConfigPath); // cycle
                    if (beforeIndex >= 0) {
                        newChains.push(before.slice(0, Math.max(beforeIndex, 1)));
                    }
                    else {
                        const referenceCommandLine = await getCommandLine(tsConfigPath);
                        if (referenceCommandLine) {
                            for (const chain of await getReferencesChains(referenceCommandLine, tsConfigPath, [...before, tsConfig])) {
                                newChains.push(chain);
                            }
                        }
                    }
                }
                return newChains;
            }
            else {
                return [[...before, tsConfig]];
            }
        }
        async function getCommandLine(tsConfig) {
            const project = await getOrCreateConfiguredProject(server, tsConfig);
            return project?.getCommandLine();
        }
    }
    function getOrCreateConfiguredProject(server, tsconfig) {
        tsconfig = tsconfig.replace(/\\/g, '/');
        const tsconfigUri = uriConverter.asUri(tsconfig);
        let projectPromise = configProjects.get(tsconfigUri);
        if (!projectPromise) {
            const workspaceFolder = getWorkspaceFolder(tsconfigUri, server.workspaceFolders);
            const serviceEnv = (0, simpleProject_1.createLanguageServiceEnvironment)(server, [workspaceFolder]);
            projectPromise = (0, typescriptProjectLs_1.createTypeScriptLS)(ts, tsLocalized, tsconfig, server, serviceEnv, workspaceFolder, uriConverter, create);
            configProjects.set(tsconfigUri, projectPromise);
        }
        return projectPromise;
    }
    async function getOrCreateInferredProject(server, uri, workspaceFolder) {
        if (!inferredProjects.has(workspaceFolder)) {
            inferredProjects.set(workspaceFolder, (async () => {
                const inferOptions = await (0, inferredCompilerOptions_1.getInferredCompilerOptions)(server);
                const serviceEnv = (0, simpleProject_1.createLanguageServiceEnvironment)(server, [workspaceFolder]);
                return (0, typescriptProjectLs_1.createTypeScriptLS)(ts, tsLocalized, inferOptions, server, serviceEnv, workspaceFolder, uriConverter, create);
            })());
        }
        const project = await inferredProjects.get(workspaceFolder);
        project.tryAddFile(uriConverter.asFileName(uri));
        return project;
    }
}
function createUriConverter(rootFolders) {
    const encodeds = new Map();
    const isFileScheme = rootFolders.every(folder => folder.scheme === 'file');
    return {
        asFileName,
        asUri,
    };
    function asFileName(parsed) {
        if (rootFolders.every(folder => folder.scheme === parsed.scheme && folder.authority === parsed.authority)) {
            if (isFileScheme) {
                return parsed.fsPath.replace(/\\/g, '/');
            }
            else {
                return parsed.path;
            }
        }
        const encoded = encodeURIComponent(`${parsed.scheme}://${parsed.authority}`);
        encodeds.set(encoded, parsed);
        return `/${encoded}${parsed.path}`;
    }
    function asUri(fileName) {
        for (const [encoded, uri] of encodeds) {
            const prefix = `/${encoded}`;
            if (fileName === prefix) {
                return vscode_uri_1.URI.from({
                    scheme: uri.scheme,
                    authority: uri.authority,
                });
            }
            if (uri.authority) {
                if (fileName.startsWith(prefix + '/')) {
                    return vscode_uri_1.URI.from({
                        scheme: uri.scheme,
                        authority: uri.authority,
                        path: fileName.substring(prefix.length),
                    });
                }
            }
            else {
                if (fileName.startsWith(prefix)) {
                    return vscode_uri_1.URI.from({
                        scheme: uri.scheme,
                        authority: uri.authority,
                        path: fileName.substring(prefix.length),
                    });
                }
            }
        }
        if (!isFileScheme) {
            for (const folder of rootFolders) {
                return vscode_uri_1.URI.parse(`${folder.scheme}://${folder.authority}${fileName}`);
            }
        }
        return vscode_uri_1.URI.file(fileName);
    }
}
function sortTSConfigs(file, a, b) {
    const inA = isFileInDir(file, path.dirname(a));
    const inB = isFileInDir(file, path.dirname(b));
    if (inA !== inB) {
        const aWeight = inA ? 1 : 0;
        const bWeight = inB ? 1 : 0;
        return bWeight - aWeight;
    }
    const aLength = a.split('/').length;
    const bLength = b.split('/').length;
    if (aLength === bLength) {
        const aWeight = path.basename(a) === 'tsconfig.json' ? 1 : 0;
        const bWeight = path.basename(b) === 'tsconfig.json' ? 1 : 0;
        return bWeight - aWeight;
    }
    return bLength - aLength;
}
function isFileInDir(fileName, dir) {
    const relative = path.relative(dir, fileName);
    return !!relative && !relative.startsWith('..') && !path.isAbsolute(relative);
}
function getWorkspaceFolder(uri, workspaceFolders) {
    while (true) {
        if (workspaceFolders.has(uri)) {
            return uri;
        }
        const next = uri.with({ path: uri.path.substring(0, uri.path.lastIndexOf('/')) });
        if (next.path === uri.path) {
            break;
        }
        uri = next;
    }
    for (const folder of workspaceFolders.all) {
        return folder;
    }
    return uri.with({ path: '/' });
}
//# sourceMappingURL=typescriptProject.js.map