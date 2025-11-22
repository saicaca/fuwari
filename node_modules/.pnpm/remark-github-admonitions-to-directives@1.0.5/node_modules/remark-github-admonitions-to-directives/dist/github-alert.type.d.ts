import type { BlockContent, DefinitionContent } from "mdast";
export declare enum GithubAlertType {
    NOTE = "NOTE",
    TIP = "TIP",
    IMPORTANT = "IMPORTANT",
    WARNING = "WARNING",
    CAUTION = "CAUTION"
}
export declare const GITHUB_ALERT_TYPES: GithubAlertType[];
export type GithubAlert = {
    type: GithubAlertType;
    children: (BlockContent | DefinitionContent)[];
};
