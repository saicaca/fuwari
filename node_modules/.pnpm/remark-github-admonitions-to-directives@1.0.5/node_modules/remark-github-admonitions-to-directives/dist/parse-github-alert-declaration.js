import {} from "./github-alert.type.js";
import { isGithubAlertType } from "./is-github-alert-type.js";
const GITHUB_ALERT_DECLARATION_REGEX = /^\s*\[\!(?<type>\w+)\]\s*$/;
/**
 * Function that checks if a given string is a GitHub alert declaration and
 * returns the parsed alert type if it is.
 *
 * A GitHub alert declaration is a string that is structured like this:
 *
 * `[!TYPE]`
 */
export function parseGithubAlertDeclaration(text) {
    const match = text.match(GITHUB_ALERT_DECLARATION_REGEX);
    const type = match?.groups?.type;
    return isGithubAlertType(type) ? type : null;
}
//# sourceMappingURL=parse-github-alert-declaration.js.map