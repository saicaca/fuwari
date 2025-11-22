// src/index.ts
import { AttachedPluginData, PluginTexts } from "@expressive-code/core";
import { select } from "@expressive-code/core/hast";

// src/utils.ts
function parseSections(value) {
  const sections = [];
  value.split(",").map((section) => section.split("-").map((lineNum) => parseInt(lineNum))).forEach((list) => {
    if (list.length !== 2)
      return;
    const [from, to] = list;
    if (isNaN(from) || isNaN(to))
      return;
    if (from > to)
      return;
    for (const { from: existingFrom, to: existingTo } of sections) {
      if (from >= existingFrom && from <= existingTo)
        return;
      if (to >= existingFrom && to <= existingTo)
        return;
    }
    sections.push({ from, to, lines: [] });
  });
  return sections;
}
var collapseStyles = ["github", "collapsible-start", "collapsible-end", "collapsible-auto"];
function parseCollapseStyle(value) {
  value = value.toLowerCase();
  if (collapseStyles.includes(value))
    return value;
  return "github";
}

// src/ast.ts
import { formatTemplate } from "@expressive-code/core";
import { setInlineStyle, h } from "@expressive-code/core/hast";

// src/styles.ts
import { PluginStyleSettings, codeLineClass, createInlineSvgUrl, setAlpha } from "@expressive-code/core";
var collapsibleSectionClass = "ec-section";
var collapsibleSectionsStyleSettings = new PluginStyleSettings({
  defaultValues: {
    collapsibleSections: {
      closedBorderWidth: "0",
      closedPaddingBlock: "4px",
      closedMargin: "0",
      closedFontFamily: "inherit",
      closedFontSize: "inherit",
      closedLineHeight: "inherit",
      closedTextColor: ({ resolveSetting }) => resolveSetting("codeForeground"),
      closedBackgroundColor: ({ theme }) => setAlpha(theme.colors["editor.foldBackground"], 0.2) || "rgb(84 174 255 / 20%)",
      closedBorderColor: ({ theme }) => setAlpha(theme.colors["editor.foldBackground"], 0.5) || "rgb(84 174 255 / 50%)",
      openBorderWidth: "1px",
      openPadding: "0",
      openMargin: "0",
      openBackgroundColor: "transparent",
      openBackgroundColorCollapsible: ({ theme }) => setAlpha(theme.colors["editor.foldBackground"], 0.1) || "rgb(84 174 255 / 10%)",
      openBorderColor: "transparent",
      // Icon source: Octicons (MIT licensed)
      expandIcon: createInlineSvgUrl([
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'>`,
        `<path d='m8.177.677 2.896 2.896a.25.25 0 0 1-.177.427H8.75v1.25a.75.75 0 0 1-1.5 0V4H5.104a.25.25 0 0 1-.177-.427L7.823.677a.25.25 0 0 1 .354 0ZM7.25 10.75a.75.75 0 0 1 1.5 0V12h2.146a.25.25 0 0 1 .177.427l-2.896 2.896a.25.25 0 0 1-.354 0l-2.896-2.896A.25.25 0 0 1 5.104 12H7.25v-1.25Zm-5-2a.75.75 0 0 0 0-1.5h-.5a.75.75 0 0 0 0 1.5h.5ZM6 8a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1 0-1.5h.5A.75.75 0 0 1 6 8Zm2.25.75a.75.75 0 0 0 0-1.5h-.5a.75.75 0 0 0 0 1.5h.5ZM12 8a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1 0-1.5h.5A.75.75 0 0 1 12 8Zm2.25.75a.75.75 0 0 0 0-1.5h-.5a.75.75 0 0 0 0 1.5h.5Z'/>`,
        `</svg>`
      ]),
      // Icon source: Octicons (MIT licensed)
      collapseIcon: createInlineSvgUrl([
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'>`,
        `<path d='M10.896 2H8.75V.75a.75.75 0 0 0-1.5 0V2H5.104a.25.25 0 0 0-.177.427l2.896 2.896a.25.25 0 0 0 .354 0l2.896-2.896A.25.25 0 0 0 10.896 2ZM8.75 15.25a.75.75 0 0 1-1.5 0V14H5.104a.25.25 0 0 1-.177-.427l2.896-2.896a.25.25 0 0 1 .354 0l2.896 2.896a.25.25 0 0 1-.177.427H8.75v1.25Zm-6.5-6.5a.75.75 0 0 0 0-1.5h-.5a.75.75 0 0 0 0 1.5h.5ZM6 8a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1 0-1.5h.5A.75.75 0 0 1 6 8Zm2.25.75a.75.75 0 0 0 0-1.5h-.5a.75.75 0 0 0 0 1.5h.5ZM12 8a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1 0-1.5h.5A.75.75 0 0 1 12 8Zm2.25.75a.75.75 0 0 0 0-1.5h-.5a.75.75 0 0 0 0 1.5h.5Z'/>`,
        `</svg>`
      ])
    }
  },
  cssVarReplacements: [["collapsibleSections", "cs"]],
  preventUnitlessValues: ["collapsibleSections.closedBorderWidth", "collapsibleSections.openBorderWidth"]
});
function getCollapsibleSectionsBaseStyles({ cssVar }) {
  return `
		.${collapsibleSectionClass} {
			position: relative;

			& summary {
				position: relative;

				font-family: ${cssVar("collapsibleSections.closedFontFamily")};
				font-size: ${cssVar("collapsibleSections.closedFontSize")};
				line-height: ${cssVar("collapsibleSections.closedLineHeight")};
				user-select: none;
				-webkit-user-select: none;

				cursor: pointer;
				color: ${cssVar("collapsibleSections.closedTextColor")};
				background-color: ${cssVar("collapsibleSections.closedBackgroundColor")};
				--border-color: ${cssVar("collapsibleSections.closedBorderColor")};
				--border-width: ${cssVar("collapsibleSections.closedBorderWidth")};
				box-shadow: inset 0 calc(-1 * var(--border-width)) var(--border-color), inset 0 var(--border-width) var(--border-color);
				margin: ${cssVar("collapsibleSections.closedMargin")};
				padding: 0;

				/* Hide the default <details> marker */
				&::marker {
					display: inline-block;
					content: "";
					width: 16px;
					height: 16px;
				}

				/* Workaround - ::marker does not support content on safari */
				&::-webkit-details-marker {
					display: none;
				}

				/* Expand & collapse icons */
				:is(.expand, .collapse) {
					position: relative;
					display: inline-block;
					width: 16px;
					height: 16px;
					vertical-align: text-bottom;
					opacity: 0.75;

					&::after {
						content: '';
						position: absolute;
						pointer-events: none;
						inset: 0;
						background-color: ${cssVar("collapsibleSections.closedTextColor")};
						-webkit-mask-repeat: no-repeat;
						mask-repeat: no-repeat;
						line-height: 0;
					}
				}
				.expand::after {
					-webkit-mask-image: ${cssVar("collapsibleSections.expandIcon")};
					mask-image: ${cssVar("collapsibleSections.expandIcon")};
					/* Ensure that the expand icons of closed sections get printed to avoid gap */
					-webkit-print-color-adjust: exact;
					print-color-adjust: exact;
				}
				.collapse {
					display: none;
					&::after {
						-webkit-mask-image: ${cssVar("collapsibleSections.collapseIcon")};
						mask-image: ${cssVar("collapsibleSections.collapseIcon")};
					}
				}
				.text {
					margin-left: 1em;
				}

				.${codeLineClass} .code {
					padding-block: ${cssVar("collapsibleSections.closedPaddingBlock")};
					text-indent: 0;
				}
			}

			/* Common open section styles */
			&[open],
			& details[open] + .content-lines {
				--border-color: ${cssVar("collapsibleSections.openBorderColor")};
				--border-width: ${cssVar("collapsibleSections.openBorderWidth")};
				box-shadow: inset 0 calc(-1 * var(--border-width)) var(--border-color), inset 0 var(--border-width) var(--border-color);
				padding-inline: ${cssVar("collapsibleSections.openPadding")};
				margin-inline: ${cssVar("collapsibleSections.openMargin")};
			}

			/* Collapse style 'github' (no wrapper around details) */
			&.github[open] {
				& summary {
					display: none;
				}
				background-color: ${cssVar("collapsibleSections.openBackgroundColor")};
			}

			/* Collapse styles 'collapsible-start' and 'collapsible-end' 
			   ('collapsible-auto' gets resolved during AST generation) */
			&:is(.collapsible-start, .collapsible-end) {
				display: flex;
				flex-direction: column;

				& .content-lines {
					display: none;
				}
				& details[open] {
					& .collapse { display: inline-block; }
					& :is(.expand, .text) { display: none; }
					& + .content-lines {
						display: block;
						background-color: ${cssVar("collapsibleSections.openBackgroundColorCollapsible")};
					}
					/* Hide re-collapsible headers of open sections when printing */
					@media print { display: none; }
				}
			}
			&.collapsible-end {
				flex-direction: column-reverse;
			}
		}
	`;
}

// src/ast.ts
function sectionizeAst({
  codeBlock,
  lines,
  sections,
  text,
  renderEmptyLine
}) {
  const { collapseStyle = "github" } = codeBlock.props;
  const outp = [...lines];
  [...sections].sort((a, b) => b.to - a.to).forEach(({ from, to }) => {
    const contentLines = lines.slice(from - 1, to);
    const minIndent = codeBlock.props.collapsePreserveIndent !== false && codeBlock.getLines(from - 1, to).reduce((acc, line) => {
      if (line.text.trim().length === 0)
        return acc;
      return Math.min(acc, line.text.match(/^\s*/)?.[0].length ?? 0);
    }, Infinity);
    const summaryLine = renderEmptyLine();
    if (minIndent && minIndent < Infinity)
      setInlineStyle(summaryLine.lineAst, "--ecIndent", `${minIndent}ch`);
    summaryLine.codeWrapper.children.push(h("span.expand"), h("span.collapse"), h("span.text", formatTemplate(text, { lineCount: contentLines.length })));
    const summary = h("summary", summaryLine.lineAst);
    const resolvedCollapseStyle = collapseStyle === "collapsible-auto" ? to >= lines.length ? "collapsible-end" : "collapsible-start" : collapseStyle;
    const outerSelector = `.${collapsibleSectionClass}.${resolvedCollapseStyle}`;
    let outerElement;
    if (collapseStyle === "github") {
      outerElement = h(`details${outerSelector}`, [summary, ...contentLines]);
    } else {
      outerElement = h(`div${outerSelector}`, [h(`details`, [summary]), h(`div.content-lines`, contentLines)]);
    }
    outp.splice(from - 1, to - from + 1, outerElement);
  });
  return outp;
}

// src/index.ts
var pluginCollapsibleSectionsTexts = new PluginTexts({
  collapsedLines: "{lineCount} collapsed {lineCount;1=line;lines}"
});
pluginCollapsibleSectionsTexts.addLocale("de", {
  collapsedLines: "{lineCount} ausgeblendete {lineCount;1=Zeile;Zeilen}"
});
function pluginCollapsibleSections() {
  return {
    name: "Collapsible sections",
    styleSettings: collapsibleSectionsStyleSettings,
    baseStyles: (context) => getCollapsibleSectionsBaseStyles(context),
    hooks: {
      preprocessMetadata: ({ codeBlock }) => {
        const toArray = (value) => {
          if (value === void 0)
            return [];
          return Array.isArray(value) ? value : [value];
        };
        codeBlock.props.collapsePreserveIndent = codeBlock.metaOptions.getBoolean("collapsePreserveIndent") ?? codeBlock.props.collapsePreserveIndent;
        const ranges = [...toArray(codeBlock.props.collapse), ...codeBlock.metaOptions.getRanges("collapse")];
        codeBlock.props.collapse = ranges;
        codeBlock.props.collapseStyle = parseCollapseStyle(codeBlock.metaOptions.getString("collapseStyle") ?? codeBlock.props.collapseStyle ?? "github");
        if (!ranges)
          return;
        const sections = parseSections(ranges.join(","));
        sections.forEach((section) => {
          section.lines.push(...codeBlock.getLines(section.from - 1, section.to));
        });
        const data = pluginCollapsibleSectionsData.getOrCreateFor(codeBlock);
        data.sections = sections;
      },
      annotateCode: ({ codeBlock }) => {
        const data = pluginCollapsibleSectionsData.getOrCreateFor(codeBlock);
        if (!data.sections.length)
          return;
        const lines = codeBlock.getLines();
        for (let i = data.sections.length - 1; i >= 0; i--) {
          const section = data.sections[i];
          const indices = section.lines.map((line) => lines.indexOf(line)).filter((index) => index > -1);
          if (!indices.length) {
            data.sections.splice(i, 1);
            continue;
          }
          section.from = Math.min(...indices) + 1;
          section.to = Math.max(...indices) + 1;
        }
      },
      postprocessRenderedBlock: ({ codeBlock, renderData, renderEmptyLine, locale }) => {
        const data = pluginCollapsibleSectionsData.getOrCreateFor(codeBlock);
        if (!data.sections.length)
          return;
        const codeAst = select("pre > code", renderData.blockAst);
        if (!codeAst)
          return;
        codeAst.children = sectionizeAst({
          codeBlock,
          lines: codeAst.children,
          sections: data.sections,
          text: pluginCollapsibleSectionsTexts.get(locale).collapsedLines,
          renderEmptyLine
        });
      }
    }
  };
}
var pluginCollapsibleSectionsData = new AttachedPluginData(() => ({ sections: [] }));
export {
  pluginCollapsibleSections,
  pluginCollapsibleSectionsData,
  pluginCollapsibleSectionsTexts
};
//# sourceMappingURL=index.js.map