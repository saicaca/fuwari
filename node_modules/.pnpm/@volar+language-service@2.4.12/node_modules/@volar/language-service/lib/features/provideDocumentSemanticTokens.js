"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const language_core_1 = require("@volar/language-core");
const SemanticTokensBuilder_1 = require("../utils/SemanticTokensBuilder");
const cancellation_1 = require("../utils/cancellation");
const common_1 = require("../utils/common");
const featureWorkers_1 = require("../utils/featureWorkers");
function register(context) {
    return async (uri, range, legend, _reportProgress, // TODO
    token = cancellation_1.NoneCancellationToken) => {
        const sourceScript = context.language.scripts.get(uri);
        if (!sourceScript) {
            return;
        }
        const document = context.documents.get(uri, sourceScript.languageId, sourceScript.snapshot);
        if (!range) {
            range = {
                start: { line: 0, character: 0 },
                end: { line: document.lineCount - 1, character: document.getText().length },
            };
        }
        const tokens = await (0, featureWorkers_1.languageFeatureWorker)(context, uri, () => range, function* (docs) {
            const mapped = (0, common_1.findOverlapCodeRange)(docs[0].offsetAt(range.start), docs[0].offsetAt(range.end), docs[2], language_core_1.isSemanticTokensEnabled);
            if (mapped) {
                yield {
                    start: docs[1].positionAt(mapped.start),
                    end: docs[1].positionAt(mapped.end),
                };
            }
        }, (plugin, document, range) => {
            if (token?.isCancellationRequested) {
                return;
            }
            return plugin[1].provideDocumentSemanticTokens?.(document, range, legend, token);
        }, (tokens, docs) => {
            if (!docs) {
                return tokens;
            }
            return tokens
                .map(_token => {
                const range = (0, featureWorkers_1.getSourceRange)(docs, {
                    start: { line: _token[0], character: _token[1] },
                    end: { line: _token[0], character: _token[1] + _token[2] },
                }, language_core_1.isSemanticTokensEnabled);
                if (range) {
                    return [range.start.line, range.start.character, range.end.character - range.start.character, _token[3], _token[4]];
                }
            })
                .filter(token => !!token);
        }, tokens => tokens.flat()
        // tokens => reportProgress?.(buildTokens(tokens)), // TODO: this has no effect with LSP
        );
        if (tokens) {
            return buildTokens(tokens);
        }
    };
}
function buildTokens(tokens) {
    const builder = new SemanticTokensBuilder_1.SemanticTokensBuilder();
    const sortedTokens = tokens.sort((a, b) => a[0] - b[0] === 0 ? a[1] - b[1] : a[0] - b[0]);
    for (const token of sortedTokens) {
        builder.push(...token);
    }
    return builder.build();
}
//# sourceMappingURL=provideDocumentSemanticTokens.js.map