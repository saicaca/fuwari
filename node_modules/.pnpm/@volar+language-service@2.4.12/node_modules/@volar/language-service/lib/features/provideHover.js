"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const language_core_1 = require("@volar/language-core");
const cancellation_1 = require("../utils/cancellation");
const common_1 = require("../utils/common");
const featureWorkers_1 = require("../utils/featureWorkers");
const transform_1 = require("../utils/transform");
const provideDiagnostics_1 = require("./provideDiagnostics");
function register(context) {
    return async (uri, position, token = cancellation_1.NoneCancellationToken) => {
        let hover = await (0, featureWorkers_1.languageFeatureWorker)(context, uri, () => position, docs => (0, featureWorkers_1.getGeneratedPositions)(docs, position, language_core_1.isHoverEnabled), (plugin, document, position) => {
            if (token.isCancellationRequested) {
                return;
            }
            return plugin[1].provideHover?.(document, position, token);
        }, (item, docs) => {
            if (!docs || !item.range) {
                return item;
            }
            item.range = (0, featureWorkers_1.getSourceRange)(docs, item.range, language_core_1.isHoverEnabled);
            return item;
        }, (hovers) => ({
            contents: {
                kind: 'markdown',
                value: hovers.map(getHoverTexts).flat().join('\n\n---\n\n'),
            },
            range: hovers.find(hover => hover.range && (0, common_1.isInsideRange)(hover.range, { start: position, end: position }))?.range ?? hovers[0].range,
        }));
        const markups = provideDiagnostics_1.errorMarkups.get(uri);
        if (markups) {
            for (const errorAndMarkup of markups) {
                if ((0, common_1.isInsideRange)(errorAndMarkup.error.range, { start: position, end: position })) {
                    hover ??= {
                        contents: {
                            kind: 'markdown',
                            value: '',
                        },
                    };
                    hover.range = errorAndMarkup.error.range;
                    if (typeof hover.contents !== 'object' || typeof hover.contents !== 'string') {
                        hover.contents = {
                            kind: 'markdown',
                            value: hover.contents,
                        };
                    }
                    if (hover.contents.value) {
                        hover.contents.value += '\n\n---\n\n';
                    }
                    hover.contents.value += errorAndMarkup.markup.value;
                }
            }
        }
        return hover;
    };
    function getHoverTexts(hover) {
        if (typeof hover.contents === 'string') {
            return [(0, transform_1.transformMarkdown)(hover.contents, context)];
        }
        if (Array.isArray(hover.contents)) {
            return hover.contents.map(content => {
                if (typeof content === 'string') {
                    return (0, transform_1.transformMarkdown)(content, context);
                }
                if (content.language === 'md') {
                    return `\`\`\`${content.language}\n${(0, transform_1.transformMarkdown)(content.value, context)}\n\`\`\``;
                }
                else {
                    return `\`\`\`${content.language}\n${content.value}\n\`\`\``;
                }
            });
        }
        if ('kind' in hover.contents) {
            if (hover.contents.kind === 'markdown') {
                return [(0, transform_1.transformMarkdown)(hover.contents.value, context)];
            }
            else {
                return [hover.contents.value];
            }
        }
        if (hover.contents.language === 'md') {
            return [`\`\`\`${hover.contents.language}\n${(0, transform_1.transformMarkdown)(hover.contents.value, context)}\n\`\`\``];
        }
        else {
            return [`\`\`\`${hover.contents.language}\n${hover.contents.value}\n\`\`\``];
        }
    }
}
//# sourceMappingURL=provideHover.js.map