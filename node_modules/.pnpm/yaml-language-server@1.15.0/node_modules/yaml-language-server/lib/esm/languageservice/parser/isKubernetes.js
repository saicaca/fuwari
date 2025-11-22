import { FilePatternAssociation } from '../services/yamlSchemaService';
export function setKubernetesParserOption(jsonDocuments, option) {
    for (const jsonDoc of jsonDocuments) {
        jsonDoc.isKubernetes = option;
    }
}
export function isKubernetesAssociatedDocument(textDocument, paths) {
    for (const path in paths) {
        const globPath = paths[path];
        const fpa = new FilePatternAssociation(globPath);
        if (fpa.matchesPattern(textDocument.uri)) {
            return true;
        }
    }
    return false;
}
//# sourceMappingURL=isKubernetes.js.map