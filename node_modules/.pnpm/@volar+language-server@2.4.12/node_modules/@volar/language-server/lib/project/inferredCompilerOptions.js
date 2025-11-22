"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInferredCompilerOptions = getInferredCompilerOptions;
async function getInferredCompilerOptions(server) {
    const [implicitProjectConfig_1 = {}, implicitProjectConfig_2 = {},] = await Promise.all([
        server.configurations.get('js/ts.implicitProjectConfig'),
        server.configurations.get('javascript.implicitProjectConfig'),
    ]);
    const checkJs = readCheckJs();
    const experimentalDecorators = readExperimentalDecorators();
    const strictNullChecks = readImplicitStrictNullChecks();
    const strictFunctionTypes = readImplicitStrictFunctionTypes();
    const options = {
        ...inferredProjectCompilerOptions('typescript'),
        allowJs: true,
        allowSyntheticDefaultImports: true,
        allowNonTsExtensions: true,
        resolveJsonModule: true,
        jsx: 1,
    };
    return options;
    function readCheckJs() {
        return implicitProjectConfig_1['checkJs']
            ?? implicitProjectConfig_2['checkJs']
            ?? false;
    }
    function readExperimentalDecorators() {
        return implicitProjectConfig_1['experimentalDecorators']
            ?? implicitProjectConfig_2['experimentalDecorators']
            ?? false;
    }
    function readImplicitStrictNullChecks() {
        return implicitProjectConfig_1['strictNullChecks'] ?? false;
    }
    function readImplicitStrictFunctionTypes() {
        return implicitProjectConfig_1['strictFunctionTypes'] ?? true;
    }
    function inferredProjectCompilerOptions(projectType) {
        const projectConfig = {
            module: 1,
            target: 7,
            jsx: 1,
        };
        if (checkJs) {
            projectConfig.checkJs = true;
            if (projectType === 'typescript') {
                projectConfig.allowJs = true;
            }
        }
        if (experimentalDecorators) {
            projectConfig.experimentalDecorators = true;
        }
        if (strictNullChecks) {
            projectConfig.strictNullChecks = true;
        }
        if (strictFunctionTypes) {
            projectConfig.strictFunctionTypes = true;
        }
        if (projectType === 'typescript') {
            projectConfig.sourceMap = true;
        }
        return projectConfig;
    }
}
//# sourceMappingURL=inferredCompilerOptions.js.map