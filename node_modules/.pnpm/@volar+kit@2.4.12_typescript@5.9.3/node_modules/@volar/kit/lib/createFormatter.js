"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFormatter = createFormatter;
const language_service_1 = require("@volar/language-service");
const ts = require("typescript");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const vscode_uri_1 = require("vscode-uri");
const createServiceEnvironment_1 = require("./createServiceEnvironment");
function createFormatter(languages, services) {
    let settings = {};
    const fakeUri = vscode_uri_1.URI.parse('file:///dummy.txt');
    const env = (0, createServiceEnvironment_1.createServiceEnvironment)(() => settings);
    const language = (0, language_service_1.createLanguage)(languages, (0, language_service_1.createUriMap)(false), () => { });
    const languageService = (0, language_service_1.createLanguageService)(language, services, env, {});
    return {
        env,
        format,
        get settings() {
            return settings;
        },
        set settings(v) {
            settings = v;
        },
    };
    async function format(content, languageId, options) {
        const snapshot = ts.ScriptSnapshot.fromString(content);
        language.scripts.set(fakeUri, snapshot, languageId);
        const document = languageService.context.documents.get(fakeUri, languageId, snapshot);
        const edits = await languageService.getDocumentFormattingEdits(fakeUri, options, undefined, undefined);
        if (edits?.length) {
            const newString = vscode_languageserver_textdocument_1.TextDocument.applyEdits(document, edits);
            return newString;
        }
        return content;
    }
}
//# sourceMappingURL=createFormatter.js.map