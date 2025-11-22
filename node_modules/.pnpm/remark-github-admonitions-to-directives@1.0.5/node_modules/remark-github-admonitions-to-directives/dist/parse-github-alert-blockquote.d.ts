import type { Blockquote } from "mdast";
import type { GithubAlert } from "./github-alert.type.js";
/**
 * Function that checks if a given blockquote is a GitHub alert and returns the
 * parsed alert if it is.
 */
export declare function parseGithubAlertBlockquote(node: Blockquote): GithubAlert | null;
