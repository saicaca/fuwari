"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSnippetCompletions = getSnippetCompletions;
const language_server_1 = require("@volar/language-server");
function getSnippetCompletions(frontmatter) {
    if (frontmatter.status === 'doesnt-exist')
        return [];
    const frontmatterStartPosition = {
        line: frontmatter.position.start.line,
        character: frontmatter.position.start.column - 1,
    };
    return [
        {
            label: 'interface Props',
            kind: language_server_1.CompletionItemKind.Snippet,
            labelDetails: { description: 'Create a new interface to type your props' },
            documentation: {
                kind: 'markdown',
                value: [
                    'Create a new interface to type your props.',
                    '\n',
                    '[Astro reference](https://docs.astro.build/en/guides/typescript/#component-props)',
                ].join('\n'),
            },
            insertTextFormat: 2,
            filterText: 'interface props',
            insertText: 'interface Props {\n\t$1\n}',
        },
        {
            label: 'getStaticPaths',
            kind: language_server_1.CompletionItemKind.Snippet,
            labelDetails: { description: 'Create a new getStaticPaths function' },
            documentation: {
                kind: 'markdown',
                value: [
                    'Create a new getStaticPaths function.',
                    '\n',
                    '[Astro reference](https://docs.astro.build/en/reference/api-reference/#getstaticpaths)',
                ].join('\n'),
            },
            insertText: 'export const getStaticPaths = (() => {\n\t$1\n\treturn [];\n}) satisfies GetStaticPaths;',
            additionalTextEdits: [
                language_server_1.TextEdit.insert(frontmatterStartPosition, 'import type { GetStaticPaths } from "astro";\n'),
            ],
            filterText: 'getstaticpaths',
            insertTextFormat: 2,
        },
        {
            label: 'prerender',
            kind: language_server_1.CompletionItemKind.Snippet,
            labelDetails: { description: 'Add prerender export' },
            documentation: {
                kind: 'markdown',
                value: [
                    'Add prerender export. When [using server-side rendering](https://docs.astro.build/en/guides/server-side-rendering/#enabling-ssr-in-your-project), this value will be used to determine whether to prerender the page or not.',
                    '\n',
                    '[Astro reference](https://docs.astro.build/en/guides/server-side-rendering/#configuring-individual-routes)',
                ].join('\n'),
            },
            insertText: 'export const prerender = ${1|true,false,import.meta.env.|}',
            insertTextFormat: 2,
        },
    ];
}
//# sourceMappingURL=snippets.js.map