"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTypeScriptChecker = createTypeScriptChecker;
exports.createTypeScriptInferredChecker = createTypeScriptInferredChecker;
const language_service_1 = require("@volar/language-service");
const typescript_1 = require("@volar/typescript");
const path = require("typesafe-path/posix");
const ts = require("typescript");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const vscode_uri_1 = require("vscode-uri");
const createServiceEnvironment_1 = require("./createServiceEnvironment");
const utils_1 = require("./utils");
function createTypeScriptChecker(languagePlugins, languageServicePlugins, tsconfig, includeProjectReference = false, setup) {
    const tsconfigPath = (0, utils_1.asPosix)(tsconfig);
    return createTypeScriptCheckerWorker(languagePlugins, languageServicePlugins, tsconfigPath, () => {
        return ts.parseJsonSourceFileConfigFileContent(ts.readJsonConfigFile(tsconfigPath, ts.sys.readFile), ts.sys, path.dirname(tsconfigPath), undefined, tsconfigPath, undefined, languagePlugins.map(plugin => plugin.typescript?.extraFileExtensions ?? []).flat());
    }, includeProjectReference, setup);
}
function createTypeScriptInferredChecker(languagePlugins, languageServicePlugins, getScriptFileNames, compilerOptions = utils_1.defaultCompilerOptions, setup) {
    return createTypeScriptCheckerWorker(languagePlugins, languageServicePlugins, undefined, () => {
        return {
            options: compilerOptions,
            fileNames: getScriptFileNames(),
            errors: [],
        };
    }, false, setup);
}
const fsFileSnapshots = (0, language_service_1.createUriMap)();
function createTypeScriptCheckerWorker(languagePlugins, languageServicePlugins, configFileName, getCommandLine, includeProjectReference, setup) {
    let settings = {};
    const didChangeWatchedFilesCallbacks = new Set();
    const env = (0, createServiceEnvironment_1.createServiceEnvironment)(() => settings);
    env.onDidChangeWatchedFiles = cb => {
        didChangeWatchedFilesCallbacks.add(cb);
        return {
            dispose: () => {
                didChangeWatchedFilesCallbacks.delete(cb);
            },
        };
    };
    const language = (0, language_service_1.createLanguage)([
        ...languagePlugins,
        { getLanguageId: uri => (0, typescript_1.resolveFileLanguageId)(uri.path) },
    ], (0, language_service_1.createUriMap)(ts.sys.useCaseSensitiveFileNames), (uri, includeFsFiles) => {
        if (!includeFsFiles) {
            return;
        }
        const cache = fsFileSnapshots.get(uri);
        const fileName = (0, utils_1.asFileName)(uri);
        const modifiedTime = ts.sys.getModifiedTime?.(fileName)?.valueOf();
        if (!cache || cache[0] !== modifiedTime) {
            if (ts.sys.fileExists(fileName)) {
                const text = ts.sys.readFile(fileName);
                const snapshot = text !== undefined ? ts.ScriptSnapshot.fromString(text) : undefined;
                fsFileSnapshots.set(uri, [modifiedTime, snapshot]);
            }
            else {
                fsFileSnapshots.set(uri, [modifiedTime, undefined]);
            }
        }
        const snapshot = fsFileSnapshots.get(uri)?.[1];
        if (snapshot) {
            language.scripts.set(uri, snapshot);
        }
        else {
            language.scripts.delete(uri);
        }
    });
    const [projectHost, languageService] = createTypeScriptCheckerLanguageService(env, language, languageServicePlugins, configFileName, getCommandLine, setup);
    const projectReferenceLanguageServices = new Map();
    if (includeProjectReference) {
        const tsconfigs = new Set();
        const tsLs = languageService.context.inject('typescript/languageService');
        const projectReferences = tsLs.getProgram()?.getResolvedProjectReferences();
        if (configFileName) {
            tsconfigs.add((0, utils_1.asPosix)(configFileName));
        }
        projectReferences?.forEach(visit);
        function visit(ref) {
            if (ref && !tsconfigs.has(ref.sourceFile.fileName)) {
                tsconfigs.add(ref.sourceFile.fileName);
                const projectReferenceLanguageService = createTypeScriptCheckerLanguageService(env, language, languageServicePlugins, ref.sourceFile.fileName, () => ref.commandLine, setup);
                projectReferenceLanguageServices.set(ref.sourceFile.fileName, projectReferenceLanguageService);
                ref.references?.forEach(visit);
            }
        }
    }
    return {
        // apis
        check,
        fixErrors,
        printErrors,
        getRootFileNames: () => {
            const fileNames = projectHost.getScriptFileNames();
            for (const [projectHost] of projectReferenceLanguageServices.values()) {
                fileNames.push(...projectHost.getScriptFileNames());
            }
            return [...new Set(fileNames)];
        },
        language,
        // settings
        get settings() {
            return settings;
        },
        set settings(v) {
            settings = v;
        },
        // file events
        fileCreated(fileName) {
            fileEvent(fileName, 1);
        },
        fileUpdated(fileName) {
            fileEvent(fileName, 2);
        },
        fileDeleted(fileName) {
            fileEvent(fileName, 3);
        },
    };
    function fileEvent(fileName, type) {
        fileName = (0, utils_1.asPosix)(fileName);
        for (const cb of didChangeWatchedFilesCallbacks) {
            cb({ changes: [{ uri: (0, utils_1.asUri)(fileName).toString(), type }] });
        }
    }
    function check(fileName) {
        fileName = (0, utils_1.asPosix)(fileName);
        const uri = (0, utils_1.asUri)(fileName);
        const languageService = getLanguageServiceForFile(fileName);
        return languageService.getDiagnostics(uri);
    }
    async function fixErrors(fileName, diagnostics, only, writeFile) {
        fileName = (0, utils_1.asPosix)(fileName);
        const uri = (0, utils_1.asUri)(fileName);
        const languageService = getLanguageServiceForFile(fileName);
        const sourceScript = languageService.context.language.scripts.get(uri);
        if (sourceScript) {
            const document = languageService.context.documents.get(uri, sourceScript.languageId, sourceScript.snapshot);
            const range = { start: document.positionAt(0), end: document.positionAt(document.getText().length) };
            const codeActions = await languageService.getCodeActions(uri, range, { diagnostics, only, triggerKind: 1 });
            if (codeActions) {
                for (let i = 0; i < codeActions.length; i++) {
                    codeActions[i] = await languageService.resolveCodeAction(codeActions[i]);
                }
                const edits = codeActions.map(codeAction => codeAction.edit).filter((edit) => !!edit);
                if (edits.length) {
                    const rootEdit = edits[0];
                    (0, language_service_1.mergeWorkspaceEdits)(rootEdit, ...edits.slice(1));
                    for (const uri in rootEdit.changes ?? {}) {
                        const edits = rootEdit.changes[uri];
                        if (edits.length) {
                            const parsedUri = vscode_uri_1.URI.parse(uri);
                            const editFile = languageService.context.language.scripts.get(parsedUri);
                            if (editFile) {
                                const editDocument = languageService.context.documents.get(parsedUri, editFile.languageId, editFile.snapshot);
                                const newString = vscode_languageserver_textdocument_1.TextDocument.applyEdits(editDocument, edits);
                                await writeFile((0, utils_1.asFileName)(parsedUri), newString);
                            }
                        }
                    }
                    for (const change of rootEdit.documentChanges ?? []) {
                        if ('textDocument' in change) {
                            const changeUri = vscode_uri_1.URI.parse(change.textDocument.uri);
                            const editFile = languageService.context.language.scripts.get(changeUri);
                            if (editFile) {
                                const editDocument = languageService.context.documents.get(changeUri, editFile.languageId, editFile.snapshot);
                                const newString = vscode_languageserver_textdocument_1.TextDocument.applyEdits(editDocument, change.edits);
                                await writeFile((0, utils_1.asFileName)(changeUri), newString);
                            }
                        }
                        // TODO: CreateFile | RenameFile | DeleteFile
                    }
                }
            }
        }
    }
    function printErrors(fileName, diagnostics, rootPath = process.cwd()) {
        let text = formatErrors(fileName, diagnostics, rootPath);
        for (const diagnostic of diagnostics) {
            text = text.replace(`TS${diagnostic.code}`, (diagnostic.source ?? '') + (diagnostic.code ? `(${diagnostic.code})` : ''));
        }
        return text;
    }
    function formatErrors(fileName, diagnostics, rootPath) {
        fileName = (0, utils_1.asPosix)(fileName);
        const uri = (0, utils_1.asUri)(fileName);
        const languageService = getLanguageServiceForFile(fileName);
        const sourceScript = languageService.context.language.scripts.get(uri);
        const document = languageService.context.documents.get(uri, sourceScript.languageId, sourceScript.snapshot);
        const errors = diagnostics.map(diagnostic => ({
            category: diagnostic.severity === 1 ? ts.DiagnosticCategory.Error : ts.DiagnosticCategory.Warning,
            code: diagnostic.code,
            file: ts.createSourceFile(fileName, document.getText(), ts.ScriptTarget.JSON),
            start: document.offsetAt(diagnostic.range.start),
            length: document.offsetAt(diagnostic.range.end) - document.offsetAt(diagnostic.range.start),
            messageText: diagnostic.message,
        }));
        const text = ts.formatDiagnosticsWithColorAndContext(errors, {
            getCurrentDirectory: () => rootPath,
            getCanonicalFileName: fileName => ts.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase(),
            getNewLine: () => ts.sys.newLine,
        });
        return text;
    }
    function getLanguageServiceForFile(fileName) {
        if (!includeProjectReference) {
            return languageService;
        }
        fileName = (0, utils_1.asPosix)(fileName);
        for (const [_1, languageService] of projectReferenceLanguageServices.values()) {
            const tsLs = languageService.context.inject('typescript/languageService');
            if (tsLs.getProgram()?.getSourceFile(fileName)) {
                return languageService;
            }
        }
        return languageService;
    }
}
function createTypeScriptCheckerLanguageService(env, language, languageServicePlugins, configFileName, getCommandLine, setup) {
    let commandLine = getCommandLine();
    let projectVersion = 0;
    let shouldCheckRootFiles = false;
    const resolvedFileNameByCommandLine = new WeakMap();
    const projectHost = {
        getCurrentDirectory: () => env.workspaceFolders.length
            ? (0, utils_1.asFileName)(env.workspaceFolders[0])
            : process.cwd(),
        getCompilationSettings: () => {
            return commandLine.options;
        },
        getProjectReferences: () => {
            return commandLine.projectReferences;
        },
        getProjectVersion: () => {
            checkRootFilesUpdate();
            return projectVersion.toString();
        },
        getScriptFileNames: () => {
            checkRootFilesUpdate();
            let fileNames = resolvedFileNameByCommandLine.get(commandLine);
            if (!fileNames) {
                fileNames = commandLine.fileNames.map(utils_1.asPosix);
                resolvedFileNameByCommandLine.set(commandLine, fileNames);
            }
            return fileNames;
        },
    };
    const project = {
        typescript: {
            configFileName,
            sys: ts.sys,
            uriConverter: {
                asFileName: utils_1.asFileName,
                asUri: utils_1.asUri,
            },
            ...(0, typescript_1.createLanguageServiceHost)(ts, ts.sys, language, utils_1.asUri, projectHost),
        },
    };
    setup?.({ language, project });
    const languageService = (0, language_service_1.createLanguageService)(language, languageServicePlugins, env, project);
    env.onDidChangeWatchedFiles?.(({ changes }) => {
        const tsLs = languageService.context.inject('typescript/languageService');
        const program = tsLs.getProgram();
        for (const change of changes) {
            const changeUri = vscode_uri_1.URI.parse(change.uri);
            const fileName = (0, utils_1.asFileName)(changeUri);
            if (change.type === 2) {
                if (program?.getSourceFile(fileName)) {
                    projectVersion++;
                }
            }
            else if (change.type === 3) {
                if (program?.getSourceFile(fileName)) {
                    projectVersion++;
                    shouldCheckRootFiles = true;
                    break;
                }
            }
            else if (change.type === 1) {
                shouldCheckRootFiles = true;
                break;
            }
        }
    });
    return [projectHost, languageService];
    function checkRootFilesUpdate() {
        if (!shouldCheckRootFiles) {
            return;
        }
        shouldCheckRootFiles = false;
        const newCommandLine = getCommandLine();
        if (!arrayItemsEqual(newCommandLine.fileNames, commandLine.fileNames)) {
            commandLine.fileNames = newCommandLine.fileNames;
            projectVersion++;
        }
    }
}
function arrayItemsEqual(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    const set = new Set(a);
    for (const file of b) {
        if (!set.has(file)) {
            return false;
        }
    }
    return true;
}
//# sourceMappingURL=createChecker.js.map