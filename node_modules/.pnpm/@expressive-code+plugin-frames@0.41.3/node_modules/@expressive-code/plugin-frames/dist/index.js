// src/index.ts
import { PluginTexts } from "@expressive-code/core";
import { h } from "@expressive-code/core/hast";

// src/styles.ts
import { PluginStyleSettings, codeLineClass, createInlineSvgUrl, multiplyAlpha, onBackground, setLuminance } from "@expressive-code/core";
var framesStyleSettings = new PluginStyleSettings({
  defaultValues: {
    frames: {
      shadowColor: ({ theme, resolveSetting }) => theme.colors["widget.shadow"] || multiplyAlpha(resolveSetting("borderColor"), 0.75),
      frameBoxShadowCssValue: ({ resolveSetting }) => `0.1rem 0.1rem 0.2rem ${resolveSetting("frames.shadowColor")}`,
      editorActiveTabBackground: ({ theme }) => theme.colors["tab.activeBackground"],
      editorActiveTabForeground: ({ theme }) => theme.colors["tab.activeForeground"],
      editorActiveTabBorderColor: "transparent",
      editorActiveTabIndicatorHeight: ({ resolveSetting }) => resolveSetting("borderWidth"),
      editorActiveTabIndicatorTopColor: ({ theme }) => theme.colors["tab.activeBorderTop"],
      editorActiveTabIndicatorBottomColor: ({ theme }) => theme.colors["tab.activeBorder"],
      editorTabsMarginInlineStart: "0",
      editorTabsMarginBlockStart: "0",
      editorTabBorderRadius: ({ resolveSetting }) => resolveSetting("borderRadius"),
      editorTabBarBackground: ({ theme }) => theme.colors["editorGroupHeader.tabsBackground"],
      editorTabBarBorderColor: ({ resolveSetting }) => resolveSetting("borderColor"),
      editorTabBarBorderBottomColor: ({ theme }) => theme.colors["editorGroupHeader.tabsBorder"] || "transparent",
      editorBackground: ({ resolveSetting }) => resolveSetting("codeBackground"),
      terminalTitlebarDotsForeground: ({ resolveSetting }) => resolveSetting("frames.terminalTitlebarForeground"),
      terminalTitlebarDotsOpacity: "0.15",
      terminalTitlebarBackground: ({ theme }) => theme.colors["titleBar.activeBackground"] || theme.colors["editorGroupHeader.tabsBackground"],
      terminalTitlebarForeground: ({ theme }) => theme.colors["titleBar.activeForeground"],
      terminalTitlebarBorderBottomColor: ({ theme, resolveSetting }) => theme.colors["titleBar.border"] || onBackground(resolveSetting("borderColor"), theme.type === "dark" ? "#000000bf" : "#ffffffbf"),
      terminalBackground: ({ theme }) => theme.colors["terminal.background"],
      inlineButtonBackground: ({ resolveSetting }) => resolveSetting("frames.inlineButtonForeground"),
      inlineButtonBackgroundIdleOpacity: "0",
      inlineButtonBackgroundHoverOrFocusOpacity: "0.2",
      inlineButtonBackgroundActiveOpacity: "0.3",
      inlineButtonForeground: ({ resolveSetting }) => resolveSetting("codeForeground"),
      inlineButtonBorder: ({ resolveSetting }) => resolveSetting("frames.inlineButtonForeground"),
      inlineButtonBorderOpacity: "0.4",
      tooltipSuccessBackground: ({ theme }) => setLuminance(theme.colors["terminal.ansiGreen"] || "#0dbc79", 0.18),
      tooltipSuccessForeground: "white",
      copyIcon: createInlineSvgUrl([
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='1.75'>`,
        `<path d='M3 19a2 2 0 0 1-1-2V2a2 2 0 0 1 1-1h13a2 2 0 0 1 2 1'/>`,
        `<rect x='6' y='5' width='16' height='18' rx='1.5' ry='1.5'/>`,
        `</svg>`
      ]),
      terminalIcon: createInlineSvgUrl([
        `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 16' preserveAspectRatio='xMidYMid meet'>`,
        `<circle cx='8' cy='8' r='8'/>`,
        `<circle cx='30' cy='8' r='8'/>`,
        `<circle cx='52' cy='8' r='8'/>`,
        `</svg>`
      ])
    }
  },
  preventUnitlessValues: ["frames.editorActiveTabIndicatorHeight", "frames.editorTabBorderRadius"]
});
function getFramesBaseStyles({ cssVar }, options) {
  const tabBarBackground = [
    `linear-gradient(to top, ${cssVar("frames.editorTabBarBorderBottomColor")} ${cssVar("borderWidth")}, transparent ${cssVar("borderWidth")})`,
    `linear-gradient(${cssVar("frames.editorTabBarBackground")}, ${cssVar("frames.editorTabBarBackground")})`
  ].join(",");
  const frameStyles = `.frame {
		all: unset;
		position: relative;
		display: block;
		--header-border-radius: calc(${cssVar("borderRadius")} + ${cssVar("borderWidth")});
		--tab-border-radius: calc(${cssVar("frames.editorTabBorderRadius")} + ${cssVar("borderWidth")});
		--button-spacing: 0.4rem;
		--code-background: ${cssVar("frames.editorBackground")};
		border-radius: var(--header-border-radius);
		box-shadow: ${cssVar("frames.frameBoxShadowCssValue")};

		.header {
			display: none;
			z-index: 1;
			position: relative;

			border-radius: var(--header-border-radius) var(--header-border-radius) 0 0;
		}

		/* Styles to apply if we have a title bar or tab bar */
		&.has-title,
		&.is-terminal {
			& pre, & code {
				border-top: none;
				border-top-left-radius: 0;
				border-top-right-radius: 0;
			}
		}

		/* Prevent empty window titles from collapsing in height */
		.title:empty:before {
			content: '\\a0';
		}

		/* Editor tab bar */
		&.has-title:not(.is-terminal) {
			--button-spacing: calc(1.9rem + 2 * (${cssVar("uiPaddingBlock")} + ${cssVar("frames.editorActiveTabIndicatorHeight")}));

			/* Active editor tab */
			& .title {
				position: relative;
				color: ${cssVar("frames.editorActiveTabForeground")};
				background: ${cssVar("frames.editorActiveTabBackground")};
				background-clip: padding-box;
				margin-block-start: ${cssVar("frames.editorTabsMarginBlockStart")};
				padding: calc(${cssVar("uiPaddingBlock")} + ${cssVar("frames.editorActiveTabIndicatorHeight")}) ${cssVar("uiPaddingInline")};
				border: ${cssVar("borderWidth")} solid ${cssVar("frames.editorActiveTabBorderColor")};
				border-radius: var(--tab-border-radius) var(--tab-border-radius) 0 0;
				border-bottom: none;
				overflow: hidden;

				&::after {
					content: '';
					position: absolute;
					pointer-events: none;
					inset: 0;
					border-top: ${cssVar("frames.editorActiveTabIndicatorHeight")} solid ${cssVar("frames.editorActiveTabIndicatorTopColor")};
					border-bottom: ${cssVar("frames.editorActiveTabIndicatorHeight")} solid ${cssVar("frames.editorActiveTabIndicatorBottomColor")};
				}
			}

			/* Tab bar background */
			& .header {
				display: flex;

				background: ${tabBarBackground};
				background-repeat: no-repeat;

				padding-inline-start: ${cssVar("frames.editorTabsMarginInlineStart")};

				&::before {
					content: '';
					position: absolute;
					pointer-events: none;
					inset: 0;
					border: ${cssVar("borderWidth")} solid ${cssVar("frames.editorTabBarBorderColor")};
					border-radius: inherit;
					border-bottom: none;
				}
			}
		}

		/* Terminal window */
		&.is-terminal {
			--button-spacing: calc(1.9rem + ${cssVar("borderWidth")} + 2 * ${cssVar("uiPaddingBlock")});
			--code-background: ${cssVar("frames.terminalBackground")};

			/* Terminal title bar */
			& .header {
				display: flex;
				align-items: center;
				justify-content: center;
				padding-block: ${cssVar("uiPaddingBlock")};
				padding-block-end: calc(${cssVar("uiPaddingBlock")} + ${cssVar("borderWidth")});
				position: relative;

				font-weight: 500;
				letter-spacing: 0.025ch;

				color: ${cssVar("frames.terminalTitlebarForeground")};
				background: ${cssVar("frames.terminalTitlebarBackground")};
				border: ${cssVar("borderWidth")} solid ${cssVar("borderColor")};
				border-bottom: none;

				/* Display three dots at the left side of the header */
				&::before {
					content: '';
					position: absolute;
					pointer-events: none;
					left: ${cssVar("uiPaddingInline")};
					width: 2.1rem;
					height: ${2.1 / 60 * 16}rem;
					line-height: 0;
					background-color: ${cssVar("frames.terminalTitlebarDotsForeground")};
					opacity: ${cssVar("frames.terminalTitlebarDotsOpacity")};
					-webkit-mask-image: ${cssVar("frames.terminalIcon")};
					-webkit-mask-repeat: no-repeat;
					mask-image: ${cssVar("frames.terminalIcon")};
					mask-repeat: no-repeat;
				}
				/* Display a border below the header */
				&::after {
					content: '';
					position: absolute;
					pointer-events: none;
					inset: 0;
					border-bottom: ${cssVar("borderWidth")} solid ${cssVar("frames.terminalTitlebarBorderBottomColor")};
				}
			}
		}

		/* Code */
		& pre {
			background: var(--code-background);
		}
	}`;
  const copyButtonStyles = `.copy {
		display: flex;
		gap: 0.25rem;
		flex-direction: row;
		position: absolute;
		inset-block-start: calc(${cssVar("borderWidth")} + var(--button-spacing));
		inset-inline-end: calc(${cssVar("borderWidth")} + ${cssVar("uiPaddingInline")} / 2);

		/* hide copy button when there is no JavaScript */
		@media (scripting: none) {
		  display: none;
		}

		/* RTL support: Code is always LTR, so the inline copy button
		   must match this to avoid overlapping the start of lines */
		direction: ltr;
		unicode-bidi: isolate;

		button {
			position: relative;
			align-self: flex-end;
			margin: 0;
			padding: 0;
			border: none;
			border-radius: 0.2rem;
			z-index: 1;
			cursor: pointer;

			transition-property: opacity, background, border-color;
			transition-duration: 0.2s;
			transition-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);

			/* Mobile-first styles: Make the button visible and tappable */
			width: 2.5rem;
			height: 2.5rem;
			background: var(--code-background);
			opacity: 0.75;

			div {
				position: absolute;
				inset: 0;
				border-radius: inherit;

				background: ${cssVar("frames.inlineButtonBackground")};
				opacity: ${cssVar("frames.inlineButtonBackgroundIdleOpacity")};

				transition-property: inherit;
				transition-duration: inherit;
				transition-timing-function: inherit;
			}

			&::before {
				content: '';
				position: absolute;
				pointer-events: none;
				inset: 0;
				border-radius: inherit;
				border: ${cssVar("borderWidth")} solid ${cssVar("frames.inlineButtonBorder")};
				opacity: ${cssVar("frames.inlineButtonBorderOpacity")};
			}

			&::after {
				content: '';
				position: absolute;
				pointer-events: none;
				inset: 0;
				background-color: ${cssVar("frames.inlineButtonForeground")};
				-webkit-mask-image: ${cssVar("frames.copyIcon")};
				-webkit-mask-repeat: no-repeat;
				mask-image: ${cssVar("frames.copyIcon")};
				mask-repeat: no-repeat;
				margin: 0.475rem;
				line-height: 0;
			}

			/*
				On hover or focus, make the button fully opaque
				and set hover/focus background opacity
			*/
			&:hover, &:focus:focus-visible {
				opacity: 1;
				div {
					opacity: ${cssVar("frames.inlineButtonBackgroundHoverOrFocusOpacity")};
				}
			}

			/* On press, set active background opacity */
			&:active {
				opacity: 1;
				div {
					opacity: ${cssVar("frames.inlineButtonBackgroundActiveOpacity")};
				}
			}
		}

		.feedback {
			--tooltip-arrow-size: 0.35rem;
			--tooltip-bg: ${cssVar("frames.tooltipSuccessBackground")};
			color: ${cssVar("frames.tooltipSuccessForeground")};
			pointer-events: none;
			user-select: none;
			-webkit-user-select: none;
			position: relative;
			align-self: center;
			background-color: var(--tooltip-bg);
			z-index: 99;
			padding: 0.125rem 0.75rem;
			border-radius: 0.2rem;
			margin-inline-end: var(--tooltip-arrow-size);
			opacity: 0;
			transition-property: opacity, transform;
			transition-duration: 0.2s;
			transition-timing-function: ease-in-out;
			transform: translate3d(0, 0.25rem, 0);

			&::after {
				content: '';
				position: absolute;
				pointer-events: none;
				top: calc(50% - var(--tooltip-arrow-size));
				inset-inline-end: calc(-2 * (var(--tooltip-arrow-size) - 0.5px));
				border: var(--tooltip-arrow-size) solid transparent;
				border-inline-start-color: var(--tooltip-bg);
			}

			&.show {
				opacity: 1;
				transform: translate3d(0, 0, 0);
			}
		}

	}

	@media (hover: hover) {
		/* If a mouse is available, hide the button by default and make it smaller */
		.copy button {
			opacity: 0;
			width: 2rem;
			height: 2rem;
		}

		/* Reveal the non-hovered button in the following cases:
			- when the frame is hovered
			- when a sibling inside the frame is focused
			- when the copy button shows a visible feedback message
		*/
		.frame:hover .copy button:not(:hover),
		.frame:focus-within :focus-visible ~ .copy button:not(:hover),
		.frame .copy .feedback.show ~ button:not(:hover) {
			opacity: 0.75;
		}
	}
	
	/* Increase end padding of the first line for the copy button */
	:nth-child(1 of .${codeLineClass}) .code {
		padding-inline-end: calc(2rem + ${cssVar("codePaddingInline")});
	}`;
  const styles = [
    // Always add base frame styles
    frameStyles,
    // Add copy button styles if enabled
    options.showCopyToClipboardButton ? copyButtonStyles : ""
  ];
  return styles.join("\n");
}

// src/utils.ts
var frameTypes = ["code", "terminal", "none", "auto"];
function frameTypeFromString(input) {
  if (input === "")
    input = "none";
  if (input === "editor")
    input = "code";
  if (input === "shell")
    input = "terminal";
  const frameType = input;
  return frameTypes.includes(frameType) ? frameType : void 0;
}
var LanguageGroups = {
  code: ["astro", "cjs", "htm", "html", "js", "jsx", "mjs", "svelte", "ts", "tsx", "typescript", "vb", "vue", "vue-html"],
  terminal: ["ansi", "bash", "bat", "batch", "cmd", "console", "nu", "nushell", "powershell", "ps", "ps1", "psd1", "psm1", "sh", "shell", "shellscript", "shellsession", "zsh"],
  data: ["csv", "env", "ini", "json", "toml", "xml", "yaml", "yml"],
  styles: ["css", "less", "sass", "scss", "styl", "stylus", "xsl"],
  textContent: ["markdown", "md", "mdx"]
};
var LanguagesWithFencedFrontmatter = ["astro", "markdown", "md", "mdx", "toml", "yaml", "yml"];
function isTerminalLanguage(language) {
  return LanguageGroups.terminal.includes(language);
}
var getFileNameCommentRegExpString = () => [
  // Start of line
  `^`,
  // Optional whitespace
  `\\s*`,
  // Mandatory comment start: `//`, `#` (but not `#!`), `<!--` or `/*`
  `(?://|#(?!!)|<!--|/\\*)`,
  // Optional whitespace
  `\\s*`,
  // Optional prefix before the file name:
  // - This is intended to match strings like `File name:` or `Example :`,
  //   but not Windows drive letters like `C:`,
  //   or URL protocols like `https:`
  // - We therefore expect the prefix to begin with any sequence of characters
  //   not starting with a letter + colon (to rule out Windows drive letters)
  // - The prefix must then be followed by:
  //   - a Japanese colon (`\\uff1a`), or
  //   - a regular colon (`:`) not followed by `//` (to rule out URL protocols)
  `(?:((?![a-z]:).*?)(?:\\uff1a|:(?!//)))?`,
  // Optional whitespace
  `\\s*`,
  // Capture the file name
  `(`,
  // Optional Windows drive letter
  `(?:[a-z]:)?`,
  // Optional sequence of characters allowed in file paths
  `[\\w./~%[\\]+\\\\-]*`,
  // Optional dot and supported file extension
  `(?:\\.(?:${Object.values(LanguageGroups).flat().sort().join("|")}))?`,
  // End of file name capture
  `)`,
  // Optional whitespace
  `\\s*`,
  // Optional HTML or JS/CSS comment end (`-->` or `*/`)
  `(?:-->|\\*/)?`,
  // Optional whitespace
  `\\s*`,
  // End of line
  `$`
].join("");
var fileNameCommentRegExp;
function getFileNameFromComment(line, lang) {
  if (fileNameCommentRegExp === void 0) {
    fileNameCommentRegExp = new RegExp(getFileNameCommentRegExpString(), "i");
  }
  const matches = fileNameCommentRegExp.exec(line);
  const textBeforeFileName = matches?.[1] ?? "";
  const possibleFileName = matches?.[2];
  if (!possibleFileName)
    return;
  if (!possibleFileName.match(/[^.:/\\~]/))
    return;
  if (possibleFileName.match(/^\.{2,}(?!\/|\\)/))
    return;
  const languageGroup = Object.values(LanguageGroups).find((group) => group.includes(lang));
  const fileNameWithoutPath = possibleFileName.replace(/^.*[/\\]/, "");
  const fileExt = fileNameWithoutPath.match(/\.([^.]+)$/)?.[1];
  const hasTypicalFileNameBeginning = possibleFileName.match(/^(\/|\\|\.[/\\]|~|[a-z]:).+/i);
  const hasFileNameStartingWithDot = fileNameWithoutPath.startsWith(".");
  const looksLikeSeparatedPath = (
    // Contains path separators
    possibleFileName.match(/[/\\]/) && // Also contains other characters (except path separators, numbers and dots)
    possibleFileName.match(/[^/\\0-9.]/) && // Does not contain spaces
    !possibleFileName.match(/\s/) && // Is all lowercase
    possibleFileName === possibleFileName.toLowerCase()
  );
  const hasTypicalFileNamePattern = hasTypicalFileNameBeginning || hasFileNameStartingWithDot || looksLikeSeparatedPath;
  if (hasTypicalFileNamePattern && (!textBeforeFileName.length || languageGroup === LanguageGroups.terminal)) {
    return possibleFileName;
  }
  if (!fileExt || languageGroup && !languageGroup.includes(fileExt))
    return;
  return possibleFileName;
}
function extractFileNameFromCodeBlock(codeBlock) {
  let extractedFileName = void 0;
  let lineIdx = codeBlock.getLines(0, 4).findIndex((line) => {
    extractedFileName = getFileNameFromComment(line.text, codeBlock.language);
    return !!extractedFileName;
  });
  if (!extractedFileName)
    return;
  codeBlock.deleteLine(lineIdx);
  if (LanguagesWithFencedFrontmatter.includes(codeBlock.language)) {
    const openingFence = lineIdx > 0 ? codeBlock.getLine(lineIdx - 1)?.text.trim() : void 0;
    const closingFence = codeBlock.getLine(lineIdx)?.text.trim();
    const isFrontmatterEmptyNow = openingFence === closingFence && ["---", "+++"].includes(openingFence ?? "");
    if (isFrontmatterEmptyNow) {
      lineIdx--;
      codeBlock.deleteLine(lineIdx);
      codeBlock.deleteLine(lineIdx);
    }
  }
  if (codeBlock.getLine(lineIdx)?.text.trim().length === 0) {
    codeBlock.deleteLine(lineIdx);
  }
  return extractedFileName;
}

// src/copy-js-module.min.ts
var copy_js_module_min_default = 'try{(()=>{function i(o){let e=document.createElement("pre");Object.assign(e.style,{opacity:"0",pointerEvents:"none",position:"absolute",overflow:"hidden",left:"0",top:"0",width:"20px",height:"20px",webkitUserSelect:"auto",userSelect:"all"}),e.ariaHidden="true",e.textContent=o,document.body.appendChild(e);let a=document.createRange();a.selectNode(e);let n=getSelection();if(!n)return!1;n.removeAllRanges(),n.addRange(a);let r=!1;try{r=document.execCommand("copy")}finally{n.removeAllRanges(),document.body.removeChild(e)}return r}async function l(o){let e=o.currentTarget,a=e.dataset,n=!1,r=a.code.replace(/\\u007f/g,`\n`);try{await navigator.clipboard.writeText(r),n=!0}catch{n=i(r)}if(!n||e.parentNode?.querySelector(".feedback"))return;let t=document.createElement("div");t.classList.add("feedback"),t.append(a.copied),e.before(t),t.offsetWidth,requestAnimationFrame(()=>t?.classList.add("show"));let c=()=>!t||t.classList.remove("show"),d=()=>{!t||parseFloat(getComputedStyle(t).opacity)>0||(t.remove(),t=void 0)};setTimeout(c,1500),setTimeout(d,2500),e.addEventListener("blur",c),t.addEventListener("transitioncancel",d),t.addEventListener("transitionend",d)}function s(o){o.querySelectorAll?.("[SELECTOR]").forEach(e=>e.addEventListener("click",l))}s(document);var u=new MutationObserver(o=>o.forEach(e=>e.addedNodes.forEach(a=>{s(a)})));u.observe(document.body,{childList:!0,subtree:!0});document.addEventListener("astro:page-load",()=>{s(document)});})();}catch(e){console.error("[EC] copy-js-module failed:",e)}';

// src/index.ts
var pluginFramesTexts = new PluginTexts({
  terminalWindowFallbackTitle: "Terminal window",
  copyButtonTooltip: "Copy to clipboard",
  copyButtonCopied: "Copied!"
});
pluginFramesTexts.addLocale("de", {
  terminalWindowFallbackTitle: "Terminal-Fenster",
  copyButtonTooltip: "In die Zwischenablage kopieren",
  copyButtonCopied: "Kopiert!"
});
function pluginFrames(options = {}) {
  options = {
    extractFileNameFromCode: true,
    showCopyToClipboardButton: true,
    removeCommentsWhenCopyingTerminalFrames: true,
    ...options
  };
  return {
    name: "Frames",
    styleSettings: framesStyleSettings,
    baseStyles: (context) => getFramesBaseStyles(context, options),
    jsModules: options.showCopyToClipboardButton ? [copy_js_module_min_default.replace(/\[SELECTOR\]/g, ".expressive-code .copy button")] : void 0,
    hooks: {
      preprocessMetadata: ({ codeBlock }) => {
        const { metaOptions, props } = codeBlock;
        props.title = metaOptions.getString("title") ?? props.title;
        const frame = metaOptions.getString("frame");
        if (frame !== void 0) {
          const frameType = frameTypeFromString(frame);
          if (frameType === void 0)
            throw new Error(
              `Invalid frame type \`${frame}\` found in code block meta string.
							Valid frame types are: ${frameTypes.join(", ")}.`.replace(/\s+/g, " ")
            );
          props.frame = frameType;
        }
      },
      preprocessCode: ({ codeBlock }) => {
        const { props, language } = codeBlock;
        if (props.title === void 0 && props.frame !== "none" && options.extractFileNameFromCode) {
          props.title = extractFileNameFromCodeBlock(codeBlock);
        }
        if ((props.frame ?? "auto") === "auto" && isTerminalLanguage(language)) {
          const titleIsFileName = props.title && getFileNameFromComment(`// ${props.title}`, language);
          if (titleIsFileName || codeBlock.getLines(0, 4).some((line) => line.text.match(/^\s*#!/))) {
            props.frame = "code";
          }
        }
      },
      postprocessRenderedBlock: ({ codeBlock, renderData, locale }) => {
        const texts = pluginFramesTexts.get(locale);
        const { title: titleText, frame = "auto" } = codeBlock.props;
        const isTerminal = frame === "terminal" || frame === "auto" && isTerminalLanguage(codeBlock.language);
        const visibleTitle = frame !== "none" && titleText || isTerminal ? [h("span", { className: "title" }, titleText || "")] : [];
        const screenReaderTitle = !titleText && isTerminal ? [h("span", { className: "sr-only" }, texts.terminalWindowFallbackTitle)] : [];
        const extraElements = [];
        if (options.showCopyToClipboardButton) {
          let codeToCopy = codeBlock.code;
          if (options.removeCommentsWhenCopyingTerminalFrames && isTerminal) {
            codeToCopy = codeToCopy.replace(/(?<=^|\n)\s*#.*($|\n+)/g, "").trim();
          }
          codeToCopy = codeToCopy.replace(/\n/g, "\x7F");
          extraElements.push(
            h("div", { className: "copy" }, [
              h(
                "button",
                {
                  title: texts.copyButtonTooltip,
                  "data-copied": texts.copyButtonCopied,
                  "data-code": codeToCopy
                },
                [h("div")]
              )
            ])
          );
        }
        renderData.blockAst = h(
          "figure",
          {
            className: [
              "frame",
              // If the code block is a terminal, add the `is-terminal` class
              ...isTerminal ? ["is-terminal"] : [],
              // If the code block has a title, add the `has-title` class
              ...frame !== "none" && titleText ? ["has-title"] : []
            ]
          },
          [
            h("figcaption", { className: "header" }, [...visibleTitle, ...screenReaderTitle]),
            // Render the original code block
            renderData.blockAst,
            // Add any extra elements (e.g. copy button)
            ...extraElements
          ]
        );
      }
    }
  };
}
export {
  LanguageGroups,
  LanguagesWithFencedFrontmatter,
  pluginFrames,
  pluginFramesTexts
};
//# sourceMappingURL=index.js.map