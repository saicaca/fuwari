export declare class Kind {
    static readonly alias = "alias";
    static readonly callSignature = "call";
    static readonly class = "class";
    static readonly const = "const";
    static readonly constructorImplementation = "constructor";
    static readonly constructSignature = "construct";
    static readonly directory = "directory";
    static readonly enum = "enum";
    static readonly enumMember = "enum member";
    static readonly externalModuleName = "external module name";
    static readonly function = "function";
    static readonly indexSignature = "index";
    static readonly interface = "interface";
    static readonly keyword = "keyword";
    static readonly let = "let";
    static readonly localFunction = "local function";
    static readonly localVariable = "local var";
    static readonly method = "method";
    static readonly memberGetAccessor = "getter";
    static readonly memberSetAccessor = "setter";
    static readonly memberVariable = "property";
    static readonly module = "module";
    static readonly primitiveType = "primitive type";
    static readonly script = "script";
    static readonly type = "type";
    static readonly variable = "var";
    static readonly warning = "warning";
    static readonly string = "string";
    static readonly parameter = "parameter";
    static readonly typeParameter = "type parameter";
}
export declare class DiagnosticCategory {
    static readonly error = "error";
    static readonly warning = "warning";
    static readonly suggestion = "suggestion";
}
export declare class KindModifiers {
    static readonly optional = "optional";
    static readonly deprecated = "deprecated";
    static readonly color = "color";
    static readonly dtsFile = ".d.ts";
    static readonly tsFile = ".ts";
    static readonly tsxFile = ".tsx";
    static readonly jsFile = ".js";
    static readonly jsxFile = ".jsx";
    static readonly jsonFile = ".json";
    static readonly fileExtensionKindModifiers: string[];
}
export declare class DisplayPartKind {
    static readonly functionName = "functionName";
    static readonly methodName = "methodName";
    static readonly parameterName = "parameterName";
    static readonly propertyName = "propertyName";
    static readonly punctuation = "punctuation";
    static readonly text = "text";
}
export declare enum EventName {
    syntaxDiag = "syntaxDiag",
    semanticDiag = "semanticDiag",
    suggestionDiag = "suggestionDiag",
    configFileDiag = "configFileDiag",
    telemetry = "telemetry",
    projectLanguageServiceState = "projectLanguageServiceState",
    projectsUpdatedInBackground = "projectsUpdatedInBackground",
    beginInstallTypes = "beginInstallTypes",
    endInstallTypes = "endInstallTypes",
    typesInstallerInitializationFailed = "typesInstallerInitializationFailed",
    surveyReady = "surveyReady",
    projectLoadingStart = "projectLoadingStart",
    projectLoadingFinish = "projectLoadingFinish"
}
//# sourceMappingURL=protocol.const.d.ts.map