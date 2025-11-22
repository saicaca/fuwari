// src/index.ts
import { setInlineStyle, h } from "@expressive-code/core/hast";

// src/styles.ts
import { PluginStyleSettings } from "@expressive-code/core";
var lineNumbersStyleSettings = new PluginStyleSettings({
  defaultValues: {
    lineNumbers: {
      foreground: "inherit",
      highlightForeground: "inherit"
    }
  }
});
function getLineNumbersBaseStyles({ cssVar }) {
  const result = `
		.gutter .ln {
			display: inline-flex;
			justify-content: flex-end;
			align-items: flex-start;
			box-sizing: content-box;
			min-width: var(--lnWidth, 2ch);
			padding-inline: 2ch;
			color: ${cssVar("lineNumbers.foreground")};
			.highlight & {
				color: ${cssVar("lineNumbers.highlightForeground")};
			}
		}
	`;
  return result;
}

// src/index.ts
function pluginLineNumbers() {
  return {
    name: "Line numbers",
    styleSettings: lineNumbersStyleSettings,
    baseStyles: (context) => getLineNumbersBaseStyles(context),
    hooks: {
      preprocessMetadata: ({ codeBlock: { metaOptions, props }, addGutterElement }) => {
        props.showLineNumbers = metaOptions.getBoolean("showLineNumbers") ?? props.showLineNumbers;
        props.startLineNumber = metaOptions.getInteger("startLineNumber") ?? props.startLineNumber;
        if (props.showLineNumbers !== false) {
          addGutterElement({
            renderPhase: "earlier",
            renderLine: ({ codeBlock, lineIndex }) => {
              return h("div.ln", { "aria-hidden": "true" }, `${lineIndex + (codeBlock.props.startLineNumber ?? 1)}`);
            },
            renderPlaceholder: () => h("div.ln")
          });
        }
      },
      postprocessRenderedBlock: ({ codeBlock, renderData }) => {
        const { startLineNumber = 1 } = codeBlock.props;
        const endLineNumber = startLineNumber + codeBlock.getLines().length - 1;
        const lnWidth = Math.max(startLineNumber.toString().length, endLineNumber.toString().length);
        if (lnWidth > 2)
          setInlineStyle(renderData.blockAst, "--lnWidth", `${lnWidth}ch`);
      }
    }
  };
}
export {
  pluginLineNumbers
};
//# sourceMappingURL=index.js.map