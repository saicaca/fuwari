import { visit } from "unist-util-visit";
import { mapGithubAlertTypeToDirectiveName } from "./map-github-alert-type-to-directive-name.js";
import { parseGithubAlertBlockquote } from "./parse-github-alert-blockquote.js";
export const remarkGithubAdmonitionsToDirectives = () => {
    return (tree) => {
        visit(tree, "blockquote", (node, index, parent) => {
            const githubAlert = parseGithubAlertBlockquote(node);
            if (githubAlert === null)
                return;
            const directive = {
                type: "containerDirective",
                name: mapGithubAlertTypeToDirectiveName(githubAlert.type),
                children: githubAlert.children,
            };
            if (parent === undefined || index === undefined)
                return;
            parent.children[index] = directive;
        });
    };
};
//# sourceMappingURL=plugin.js.map