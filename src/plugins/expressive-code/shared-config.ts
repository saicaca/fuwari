// Centralized Expressive Code config shared between Astro integration
// and our custom rehype plugin for Typst-generated <ec> blocks.

import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import { pluginFrames } from "@expressive-code/plugin-frames";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import { pluginShiki } from "@expressive-code/plugin-shiki";
import { pluginTextMarkers } from "@expressive-code/plugin-text-markers";
import { expressiveCodeConfig } from "../../config.ts";
import { pluginCustomCopyButton } from "./custom-copy-button.ts";
import { pluginLanguageBadge } from "./language-badge.ts";

export const ecTheme = expressiveCodeConfig.theme;

export const ecDefaultProps = {
  wrap: true,
  overridesByLang: { shellsession: { showLineNumbers: false } },
};

export const ecStyleOverrides = {
  codeBackground: "var(--codeblock-bg)",
  borderRadius: "0.75rem",
  borderColor: "none",
  codeFontSize: "0.875rem",
  codeFontFamily: "var(--mono-font)",
  codeLineHeight: "1.5rem",
  frames: {
    editorBackground: "var(--codeblock-bg)",
    terminalBackground: "var(--codeblock-bg)",
    terminalTitlebarBackground: "var(--codeblock-topbar-bg)",
    editorTabBarBackground: "var(--codeblock-topbar-bg)",
    editorActiveTabBackground: "none",
    editorActiveTabIndicatorBottomColor: "var(--primary)",
    editorActiveTabIndicatorTopColor: "none",
    editorTabBarBorderBottomColor: "var(--codeblock-topbar-bg)",
    terminalTitlebarBorderBottomColor: "none",
  },
  textMarkers: { delHue: 0, insHue: 180, markHue: 250 },
};

// Plugin presets for the two contexts we use:

// - Astro integration (astro-expressive-code) augments a default set.
export function ecAstroPlugins() {
  return [
    pluginCollapsibleSections(),
    pluginLineNumbers(),
    pluginLanguageBadge(),
    pluginCustomCopyButton(),
  ];
}

// - Raw engine in rehype (needs full set for parity with astro-expressive-code)
export function ecEnginePlugins() {
  return [
    pluginFrames({ showCopyToClipboardButton: false }),
    pluginTextMarkers(),
    pluginShiki(),
    pluginCollapsibleSections(),
    pluginLineNumbers(),
    pluginLanguageBadge(),
    pluginCustomCopyButton(),
  ];
}
