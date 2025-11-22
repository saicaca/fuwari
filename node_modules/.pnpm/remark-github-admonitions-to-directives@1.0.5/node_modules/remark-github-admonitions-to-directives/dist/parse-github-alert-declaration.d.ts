import { type GithubAlertType } from "./github-alert.type.js";
/**
 * Function that checks if a given string is a GitHub alert declaration and
 * returns the parsed alert type if it is.
 *
 * A GitHub alert declaration is a string that is structured like this:
 *
 * `[!TYPE]`
 */
export declare function parseGithubAlertDeclaration(text: string): GithubAlertType | null;
