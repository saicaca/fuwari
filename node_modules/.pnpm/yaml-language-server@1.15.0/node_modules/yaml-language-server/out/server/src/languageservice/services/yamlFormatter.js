"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Copyright (c) Adam Voss. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.YAMLFormatter = void 0;
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
const prettier = require("prettier");
const parser = require("prettier/parser-yaml");
class YAMLFormatter {
    constructor() {
        this.formatterEnabled = true;
    }
    configure(shouldFormat) {
        if (shouldFormat) {
            this.formatterEnabled = shouldFormat.format;
        }
    }
    format(document, options = {}) {
        if (!this.formatterEnabled) {
            return [];
        }
        try {
            const text = document.getText();
            const prettierOptions = {
                parser: 'yaml',
                plugins: [parser],
                // --- FormattingOptions ---
                tabWidth: options.tabWidth || options.tabSize,
                // --- CustomFormatterOptions ---
                singleQuote: options.singleQuote,
                bracketSpacing: options.bracketSpacing,
                // 'preserve' is the default for Options.proseWrap. See also server.ts
                proseWrap: 'always' === options.proseWrap ? 'always' : 'never' === options.proseWrap ? 'never' : 'preserve',
                printWidth: options.printWidth,
            };
            const formatted = prettier.format(text, prettierOptions);
            return [vscode_languageserver_types_1.TextEdit.replace(vscode_languageserver_types_1.Range.create(vscode_languageserver_types_1.Position.create(0, 0), document.positionAt(text.length)), formatted)];
        }
        catch (error) {
            return [];
        }
    }
}
exports.YAMLFormatter = YAMLFormatter;
//# sourceMappingURL=yamlFormatter.js.map