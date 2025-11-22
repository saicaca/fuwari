import { isKubernetesAssociatedDocument } from '../../languageservice/parser/isKubernetes';
import { removeDuplicatesObj } from '../../languageservice/utils/arrUtils';
export class ValidationHandler {
    constructor(connection, languageService, yamlSettings) {
        this.connection = connection;
        this.languageService = languageService;
        this.yamlSettings = yamlSettings;
        this.yamlSettings.documents.onDidChangeContent((change) => {
            this.validate(change.document);
        });
        this.yamlSettings.documents.onDidClose((event) => {
            this.cleanPendingValidation(event.document);
            this.connection.sendDiagnostics({ uri: event.document.uri, diagnostics: [] });
        });
    }
    validate(textDocument) {
        this.cleanPendingValidation(textDocument);
        this.yamlSettings.pendingValidationRequests[textDocument.uri] = setTimeout(() => {
            delete this.yamlSettings.pendingValidationRequests[textDocument.uri];
            this.validateTextDocument(textDocument);
        }, this.yamlSettings.validationDelayMs);
    }
    cleanPendingValidation(textDocument) {
        const request = this.yamlSettings.pendingValidationRequests[textDocument.uri];
        if (request) {
            clearTimeout(request);
            delete this.yamlSettings.pendingValidationRequests[textDocument.uri];
        }
    }
    validateTextDocument(textDocument) {
        if (!textDocument) {
            return;
        }
        return this.languageService
            .doValidation(textDocument, isKubernetesAssociatedDocument(textDocument, this.yamlSettings.specificValidatorPaths))
            .then((diagnosticResults) => {
            const diagnostics = [];
            for (const diagnosticItem of diagnosticResults) {
                // Convert all warnings to errors
                if (diagnosticItem.severity === 2) {
                    diagnosticItem.severity = 1;
                }
                diagnostics.push(diagnosticItem);
            }
            const removeDuplicatesDiagnostics = removeDuplicatesObj(diagnostics);
            this.connection.sendDiagnostics({
                uri: textDocument.uri,
                diagnostics: removeDuplicatesDiagnostics,
            });
            return removeDuplicatesDiagnostics;
        });
    }
}
//# sourceMappingURL=validationHandlers.js.map