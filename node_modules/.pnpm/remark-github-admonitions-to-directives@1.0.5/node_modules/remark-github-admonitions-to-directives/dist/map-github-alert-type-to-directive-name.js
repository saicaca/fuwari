import { GithubAlertType } from "./github-alert.type.js";
export function mapGithubAlertTypeToDirectiveName(type) {
    switch (type) {
        case GithubAlertType.NOTE:
            return "note";
        case GithubAlertType.TIP:
            return "tip";
        case GithubAlertType.WARNING:
            return "warning";
        case GithubAlertType.IMPORTANT:
            return "warning";
        case GithubAlertType.CAUTION:
            return "danger";
    }
}
//# sourceMappingURL=map-github-alert-type-to-directive-name.js.map