"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSyntaxOnlyService = createSyntaxOnlyService;
function createSyntaxOnlyService(ts, syntaxOnly) {
    let currentProjectVersion = -1;
    let fileNames = [];
    const scriptInfos = new Map();
    const host = {
        getProjectVersion: () => currentProjectVersion.toString(),
        getScriptFileNames: () => fileNames,
        getScriptSnapshot: fileName => scriptInfos.get(fileName).snapshot,
        getScriptKind: fileName => scriptInfos.get(fileName).kind,
        getScriptVersion: fileName => scriptInfos.get(fileName).version.toString(),
        getCompilationSettings: () => ({}),
        getCurrentDirectory: () => '',
        getDefaultLibFileName: () => '',
        readFile: () => undefined,
        fileExists: fileName => scriptInfos.has(fileName),
    };
    return {
        languageService: syntaxOnly
            ? ts.createLanguageService(host, undefined, ts.LanguageServiceMode.Syntactic)
            : ts.createLanguageService(host),
        updateFile,
    };
    function updateFile(fileName, snapshot, scriptKind) {
        let scriptInfo = scriptInfos.get(fileName);
        if (scriptInfo?.snapshot === snapshot && scriptInfo.kind === scriptKind) {
            return;
        }
        currentProjectVersion++;
        scriptInfo = {
            snapshot,
            kind: scriptKind,
            version: (scriptInfo?.version ?? 0) + 1,
        };
        const filesChanged = !scriptInfos.has(fileName);
        scriptInfos.set(fileName, scriptInfo);
        if (filesChanged) {
            fileNames = [...scriptInfos.keys()];
        }
    }
}
//# sourceMappingURL=syntaxOnlyService.js.map