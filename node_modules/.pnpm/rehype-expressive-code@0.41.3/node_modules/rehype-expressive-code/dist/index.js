// src/index.ts
import {
  loadShikiTheme,
  ExpressiveCode,
  ExpressiveCodeTheme,
  ExpressiveCodeBlock
} from "expressive-code";
import { visit } from "expressive-code/hast";

// src/utils.ts
import { getClassNames } from "expressive-code/hast";
function getCodeBlockInfo(pre) {
  if (pre.tagName !== "pre" || pre.children.length !== 1)
    return;
  const code = pre.children[0];
  if (code.type !== "element" || code.tagName !== "code")
    return;
  const text = code.children[0];
  if (text.type !== "text")
    return;
  const langClass = getClassNames(code).find((c) => c.startsWith("language-")) ?? "";
  const lang = langClass.replace("language-", "");
  const meta = code.data?.meta ?? code.properties?.metastring ?? "";
  return {
    pre,
    code,
    lang,
    text: text.value,
    meta
  };
}
function createInlineAssetElement({
  tagName,
  properties = {},
  innerHTML,
  useMdxJsx
}) {
  if (useMdxJsx)
    return createMdxJsxElementWithInnerHTML(tagName, properties, innerHTML);
  return {
    type: "element",
    tagName,
    properties,
    children: [{ type: "text", value: innerHTML }]
  };
}
function createMdxJsxElementWithInnerHTML(tagName, properties, innerHTML) {
  const attrs = Object.entries(properties).map(([name, value]) => ({
    type: "mdxJsxAttribute",
    name,
    value
  }));
  return {
    type: "mdxJsxFlowElement",
    name: tagName,
    attributes: [
      ...attrs,
      {
        type: "mdxJsxAttribute",
        name: "dangerouslySetInnerHTML",
        value: {
          type: "mdxJsxAttributeValueExpression",
          value: `{__html:${JSON.stringify(innerHTML)}}`,
          data: {
            estree: {
              type: "Program",
              body: [
                {
                  type: "ExpressionStatement",
                  expression: {
                    type: "ObjectExpression",
                    properties: [
                      {
                        type: "Property",
                        method: false,
                        shorthand: false,
                        computed: false,
                        key: {
                          type: "Identifier",
                          name: "__html"
                        },
                        value: {
                          type: "Literal",
                          value: innerHTML,
                          raw: JSON.stringify(innerHTML)
                        },
                        kind: "init"
                      }
                    ]
                  }
                }
              ],
              sourceType: "module",
              comments: []
            }
          }
        }
      }
    ],
    data: {
      _mdxExplicitJsx: true
    },
    children: []
  };
}

// src/index.ts
export * from "expressive-code";
async function createRenderer(options = {}) {
  const deprecatedOptions = options;
  if (deprecatedOptions.theme && !options.themes) {
    options.themes = Array.isArray(deprecatedOptions.theme) ? deprecatedOptions.theme : [deprecatedOptions.theme];
    delete deprecatedOptions.theme;
  }
  const { themes, ...ecOptions } = options;
  const loadedThemes = themes && await Promise.all(
    (Array.isArray(themes) ? themes : [themes]).map(async (theme) => {
      const mustLoadTheme = theme !== void 0 && !(theme instanceof ExpressiveCodeTheme);
      const optLoadedTheme = mustLoadTheme ? new ExpressiveCodeTheme(typeof theme === "string" ? await loadShikiTheme(theme) : theme) : theme;
      return optLoadedTheme;
    })
  );
  const ec = new ExpressiveCode({
    themes: loadedThemes,
    ...ecOptions
  });
  const baseStyles = await ec.getBaseStyles();
  const themeStyles = await ec.getThemeStyles();
  const jsModules = await ec.getJsModules();
  return {
    ec,
    baseStyles,
    themeStyles,
    jsModules
  };
}
function rehypeExpressiveCode(options = {}) {
  const { tabWidth = 2, getBlockLocale, customCreateRenderer, customCreateBlock } = options;
  let asyncRenderer;
  const renderBlockToHast = async ({
    codeBlock,
    renderer,
    addedStyles,
    addedJsModules,
    useMdxJsx
  }) => {
    const { ec, baseStyles, themeStyles, jsModules } = renderer;
    const { renderedGroupAst, styles } = await ec.render(codeBlock);
    const extraElements = [];
    const stylesToPrepend = [];
    if (baseStyles && !addedStyles.has(baseStyles)) {
      addedStyles.add(baseStyles);
      stylesToPrepend.push(baseStyles);
    }
    if (themeStyles && !addedStyles.has(themeStyles)) {
      addedStyles.add(themeStyles);
      stylesToPrepend.push(themeStyles);
    }
    for (const style of styles) {
      if (addedStyles.has(style))
        continue;
      addedStyles.add(style);
      stylesToPrepend.push(style);
    }
    if (stylesToPrepend.length) {
      extraElements.push(
        createInlineAssetElement({
          tagName: "style",
          innerHTML: stylesToPrepend.join(""),
          useMdxJsx
        })
      );
    }
    jsModules.forEach((moduleCode) => {
      if (addedJsModules.has(moduleCode))
        return;
      addedJsModules.add(moduleCode);
      extraElements.push(
        createInlineAssetElement({
          tagName: "script",
          properties: { type: "module" },
          innerHTML: moduleCode,
          useMdxJsx
        })
      );
    });
    renderedGroupAst.children.unshift(...extraElements);
    return renderedGroupAst;
  };
  const transformer = async (tree, file) => {
    const nodesToProcess = [];
    visit(tree, "element", (element, index, parent) => {
      if (index === null || !parent)
        return;
      const codeBlockInfo = getCodeBlockInfo(element);
      if (codeBlockInfo)
        nodesToProcess.push([parent, codeBlockInfo]);
    });
    if (nodesToProcess.length === 0)
      return;
    if (asyncRenderer === void 0) {
      asyncRenderer = (customCreateRenderer ?? createRenderer)(options);
    }
    const renderer = await asyncRenderer;
    const isAstro = file.data?.astro !== void 0;
    const isMdx = file.path?.endsWith(".mdx") ?? false;
    const useMdxJsx = !isAstro && isMdx;
    const addedStyles = /* @__PURE__ */ new Set();
    const addedJsModules = /* @__PURE__ */ new Set();
    for (let groupIndex = 0; groupIndex < nodesToProcess.length; groupIndex++) {
      const [parent, code] = nodesToProcess[groupIndex];
      let normalizedCode = code.text;
      if (tabWidth > 0)
        normalizedCode = normalizedCode.replace(/\t/g, " ".repeat(tabWidth));
      const input = {
        code: normalizedCode,
        language: code.lang || "",
        meta: code.meta || "",
        parentDocument: {
          sourceFilePath: file.path,
          documentRoot: tree,
          positionInDocument: {
            groupIndex,
            totalGroups: nodesToProcess.length
          }
        }
      };
      if (getBlockLocale) {
        input.locale = await getBlockLocale({ input, file });
      }
      const codeBlock = customCreateBlock ? await customCreateBlock({ input, file }) : new ExpressiveCodeBlock(input);
      const renderedBlock = await renderBlockToHast({ codeBlock, renderer, addedStyles, addedJsModules, useMdxJsx });
      parent.children.splice(parent.children.indexOf(code.pre), 1, renderedBlock);
    }
  };
  return transformer;
}
var src_default = rehypeExpressiveCode;
export {
  createRenderer,
  src_default as default
};
//# sourceMappingURL=index.js.map