"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
const language_core_1 = require("@volar/language-core");
const cancellation_1 = require("../utils/cancellation");
const featureWorkers_1 = require("../utils/featureWorkers");
function register(context) {
    return (uri, position, signatureHelpContext = {
        triggerKind: 1,
        isRetrigger: false,
    }, token = cancellation_1.NoneCancellationToken) => {
        return (0, featureWorkers_1.languageFeatureWorker)(context, uri, () => position, docs => (0, featureWorkers_1.getGeneratedPositions)(docs, position, language_core_1.isSignatureHelpEnabled), (plugin, document, position) => {
            if (token.isCancellationRequested) {
                return;
            }
            if (signatureHelpContext?.triggerKind === 2
                && signatureHelpContext.triggerCharacter
                && !(signatureHelpContext.isRetrigger
                    ? plugin[0].capabilities.signatureHelpProvider?.retriggerCharacters
                    : plugin[0].capabilities.signatureHelpProvider?.triggerCharacters)?.includes(signatureHelpContext.triggerCharacter)) {
                return;
            }
            return plugin[1].provideSignatureHelp?.(document, position, signatureHelpContext, token);
        }, data => data);
    };
}
//# sourceMappingURL=provideSignatureHelp.js.map