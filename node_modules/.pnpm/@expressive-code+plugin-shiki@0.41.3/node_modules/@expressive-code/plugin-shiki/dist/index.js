// src/index.ts
import { ExpressiveCodeTheme as ExpressiveCodeTheme2, InlineStyleAnnotation } from "@expressive-code/core";
import { bundledThemes } from "shiki";

// src/highlighter.ts
import { getStableObjectHash } from "@expressive-code/core";
import { bundledLanguages, createHighlighterCore, isSpecialLang } from "shiki";

// src/languages.ts
function getNestedCodeBlockInjectionLangs(lang, langAlias = {}) {
  const injectionLangs = [];
  const langNameKey = lang.name.replace(/[^a-zA-Z0-9]/g, "_");
  const langNameAndAliases = [lang.name, ...lang.aliases ?? []];
  Object.entries(langAlias).forEach(([alias, target]) => {
    if (target === lang.name && !langNameAndAliases.includes(alias))
      langNameAndAliases.push(alias);
  });
  injectionLangs.push({
    name: `${lang.name}-fenced-md`,
    scopeName: `source.${lang.name}.fenced_code_block`,
    injectTo: ["text.html.markdown"],
    injectionSelector: "L:text.html.markdown",
    patterns: [
      {
        include: `#fenced_code_block_${langNameKey}`
      }
    ],
    repository: {
      [`fenced_code_block_${langNameKey}`]: {
        begin: `(^|\\G)(\\s*)(\`{3,}|~{3,})\\s*(?i:(${langNameAndAliases.join("|")})((\\s+|:|,|\\{|\\?)[^\`]*)?$)`,
        beginCaptures: {
          3: {
            name: "punctuation.definition.markdown"
          },
          4: {
            name: "fenced_code.block.language.markdown"
          },
          5: {
            name: "fenced_code.block.language.attributes.markdown"
          }
        },
        end: "(^|\\G)(\\2|\\s{0,3})(\\3)\\s*$",
        endCaptures: {
          3: {
            name: "punctuation.definition.markdown"
          }
        },
        name: "markup.fenced_code.block.markdown",
        patterns: [
          {
            begin: "(^|\\G)(\\s*)(.*)",
            while: "(^|\\G)(?!\\s*([`~]{3,})\\s*$)",
            contentName: `meta.embedded.block.${lang.name}`,
            patterns: [
              {
                include: lang.scopeName
              }
            ]
          }
        ]
      }
    }
  });
  injectionLangs.push({
    name: `${lang.name}-fenced-mdx`,
    scopeName: `source.${lang.name}.fenced_code_block`,
    injectTo: ["source.mdx"],
    injectionSelector: "L:source.mdx",
    patterns: [
      {
        include: `#fenced_code_block_${langNameKey}`
      }
    ],
    repository: {
      [`fenced_code_block_${langNameKey}`]: {
        begin: `(?:^|\\G)[\\t ]*(\`{3,})(?:[\\t ]*((?i:(?:.*\\.)?${langNameAndAliases.join("|")}))(?:[\\t ]+((?:[^\\n\\r\`])+))?)(?:[\\t ]*$)`,
        beginCaptures: {
          1: {
            name: "string.other.begin.code.fenced.mdx"
          },
          2: {
            name: "entity.name.function.mdx",
            patterns: [
              {
                include: "#markdown-string"
              }
            ]
          },
          3: {
            patterns: [
              {
                include: "#markdown-string"
              }
            ]
          }
        },
        end: "(?:^|\\G)[\\t ]*(\\1)(?:[\\t ]*$)",
        endCaptures: {
          1: {
            name: "string.other.end.code.fenced.mdx"
          }
        },
        name: `markup.code.${lang.name}.mdx`,
        patterns: [
          {
            begin: "(^|\\G)(\\s*)(.*)",
            contentName: `meta.embedded.${lang.name}`,
            patterns: [
              {
                include: lang.scopeName
              }
            ],
            while: "(^|\\G)(?![\\t ]*([`~]{3,})[\\t ]*$)"
          }
        ]
      }
    }
  });
  return injectionLangs;
}

// src/highlighter.ts
var highlighterPromiseByConfig = /* @__PURE__ */ new Map();
var themeCacheKeysByStyleVariants = /* @__PURE__ */ new WeakMap();
async function getCachedHighlighter(config = {}) {
  const configCacheKey = getStableObjectHash(config);
  let highlighterPromise = highlighterPromiseByConfig.get(configCacheKey);
  if (highlighterPromise === void 0) {
    highlighterPromise = (async () => {
      const highlighter = await createHighlighterCore({
        themes: [],
        langs: [],
        engine: createRegexEngine(config.engine)
      });
      await ensureLanguagesAreLoaded({ highlighter, ...config });
      return highlighter;
    })();
    highlighterPromiseByConfig.set(configCacheKey, highlighterPromise);
  }
  return highlighterPromise;
}
async function createRegexEngine(engine) {
  if (engine === "javascript")
    return [(await import("shiki/engine/javascript")).createJavaScriptRegexEngine({ forgiving: true })][0];
  return [(await import("shiki/engine/oniguruma")).createOnigurumaEngine(import("shiki/wasm"))][0];
}
async function ensureThemeIsLoaded(highlighter, theme, styleVariants) {
  let themeCacheKeys = themeCacheKeysByStyleVariants.get(styleVariants);
  if (!themeCacheKeys) {
    themeCacheKeys = /* @__PURE__ */ new WeakMap();
    themeCacheKeysByStyleVariants.set(styleVariants, themeCacheKeys);
  }
  const existingCacheKey = themeCacheKeys.get(theme);
  const cacheKey = existingCacheKey ?? `${theme.name}-${getStableObjectHash({ bg: theme.bg, fg: theme.fg, settings: theme.settings })}`;
  if (!existingCacheKey)
    themeCacheKeys.set(theme, cacheKey);
  await runHighlighterTask(async () => {
    if (highlighter.getLoadedThemes().includes(cacheKey))
      return;
    const themeUsingCacheKey = { ...theme, name: cacheKey, settings: theme.settings ?? [] };
    await highlighter.loadTheme(themeUsingCacheKey);
  });
  return cacheKey;
}
async function ensureLanguagesAreLoaded(options) {
  const { highlighter, langs = [], langAlias = {}, injectLangsIntoNestedCodeBlocks } = options;
  const failedLanguages = /* @__PURE__ */ new Set();
  const failedEmbeddedLanguages = /* @__PURE__ */ new Set();
  if (!langs.length)
    return { failedLanguages, failedEmbeddedLanguages };
  await runHighlighterTask(async () => {
    const loadedLanguages = new Set(highlighter.getLoadedLanguages());
    const handledLanguageNames = /* @__PURE__ */ new Set();
    const registrations = /* @__PURE__ */ new Map();
    async function resolveLanguage(language, isEmbedded = false) {
      let languageInput;
      if (typeof language === "string") {
        language = langAlias[language] ?? language;
        if (handledLanguageNames.has(language))
          return [];
        handledLanguageNames.add(language);
        if (loadedLanguages.has(language) || isSpecialLang(language))
          return [];
        if (!Object.keys(bundledLanguages).includes(language)) {
          if (isEmbedded) {
            failedEmbeddedLanguages.add(language);
          } else {
            failedLanguages.add(language);
          }
          return [];
        }
        languageInput = bundledLanguages[language];
      } else {
        languageInput = language;
      }
      const potentialModule = await Promise.resolve(typeof languageInput === "function" ? languageInput() : languageInput);
      const potentialArray = "default" in potentialModule ? potentialModule.default : potentialModule;
      const languageRegistrations = Array.isArray(potentialArray) ? potentialArray : [potentialArray];
      languageRegistrations.forEach((lang) => {
        if (loadedLanguages.has(lang.name))
          return;
        const registration = { repository: {}, ...lang, embeddedLangsLazy: [] };
        registrations.set(lang.name, registration);
      });
      if (injectLangsIntoNestedCodeBlocks && !isEmbedded) {
        languageRegistrations.forEach((lang) => {
          const injectionLangs = getNestedCodeBlockInjectionLangs(lang, langAlias);
          injectionLangs.forEach((injectionLang) => registrations.set(injectionLang.name, injectionLang));
        });
      }
      const referencedLangs = [...new Set(languageRegistrations.map((lang) => lang.embeddedLangsLazy ?? []).flat())];
      await Promise.all(referencedLangs.map((lang) => resolveLanguage(lang, true)));
    }
    await Promise.all(langs.map((lang) => resolveLanguage(lang)));
    if (registrations.size)
      await highlighter.loadLanguage(...[...registrations.values()]);
  });
  return { failedLanguages, failedEmbeddedLanguages };
}
var taskQueue = [];
var processingQueue = false;
function runHighlighterTask(taskFn) {
  return new Promise((resolve, reject) => {
    taskQueue.push({ taskFn, resolve, reject });
    if (!processingQueue) {
      processingQueue = true;
      processQueue().catch((error) => {
        processingQueue = false;
        console.error("Error in Shiki highlighter task queue:", error);
      });
    }
  });
}
async function processQueue() {
  try {
    while (taskQueue.length > 0) {
      const task = taskQueue.shift();
      if (!task)
        break;
      const { taskFn, resolve, reject } = task;
      try {
        await taskFn();
        resolve();
      } catch (error) {
        reject(error);
      }
    }
  } finally {
    processingQueue = false;
  }
}

// src/transformers.ts
function validateTransformers(options) {
  if (!options.transformers)
    return;
  const unsupportedTransformerHooks = ["code", "line", "postprocess", "pre", "root", "span"];
  for (const transformer of coerceTransformers(options.transformers)) {
    const unsupportedHook = unsupportedTransformerHooks.find((hook) => transformer[hook] != null);
    if (unsupportedHook) {
      throw new ExpressiveCodeShikiTransformerError(transformer, `The transformer hook "${unsupportedHook}" is not supported by Expressive Code yet.`);
    }
  }
}
function runPreprocessHook(args) {
  const { options, code, codeBlock, codeToTokensOptions } = args;
  coerceTransformers(options.transformers).forEach((transformer) => {
    if (!transformer.preprocess)
      return;
    const transformerContext = getTransformerContext({ transformer, code, codeBlock, codeToTokensOptions });
    const transformedCode = transformer.preprocess.call(transformerContext, code, codeToTokensOptions);
    if (typeof transformedCode === "string" && transformedCode !== code) {
      throw new ExpressiveCodeShikiTransformerError(transformer, `Transformers that modify code in the "preprocess" hook are not supported yet.`);
    }
  });
}
function runTokensHook(args) {
  const { options, code, codeBlock, codeToTokensOptions } = args;
  const originalTokenLinesText = getTokenLinesText(args.tokenLines);
  coerceTransformers(options.transformers).forEach((transformer) => {
    if (!transformer.tokens)
      return;
    const transformerContext = getTransformerContext({ transformer, code, codeBlock, codeToTokensOptions });
    const transformedTokenLines = transformer.tokens.call(transformerContext, args.tokenLines);
    if (transformedTokenLines) {
      args.tokenLines = transformedTokenLines;
    }
    const newTokenLinesText = getTokenLinesText(args.tokenLines);
    if (originalTokenLinesText.length !== args.tokenLines.length) {
      throw new ExpressiveCodeShikiTransformerError(
        transformer,
        `Transformers that modify code in the "tokens" hook are not supported yet. The number of lines changed from ${originalTokenLinesText.length} to ${args.tokenLines.length}.`
      );
    }
    for (let i = 0; i < newTokenLinesText.length; i++) {
      if (originalTokenLinesText[i] !== newTokenLinesText[i]) {
        throw new ExpressiveCodeShikiTransformerError(
          transformer,
          `Transformers that modify code in the "tokens" hook are not supported yet. Line ${i + 1} changed from "${originalTokenLinesText[i]}" to "${newTokenLinesText[i]}".`
        );
      }
    }
  });
  return args.tokenLines;
}
function coerceTransformers(transformers) {
  if (!transformers)
    return [];
  return transformers.map((transformer) => transformer);
}
function getTokenLinesText(tokenLines) {
  return tokenLines.map((line) => line.map((token) => token.content).join(""));
}
function getTransformerContext(contextBase) {
  const { transformer, code, codeBlock, codeToTokensOptions } = contextBase;
  const getUnsupportedFnHandler = (name) => {
    return () => {
      throw new ExpressiveCodeShikiTransformerError(transformer, `The context function "${name}" is not available in Expressive Code transformers yet.`);
    };
  };
  return {
    source: code,
    options: codeToTokensOptions,
    meta: {
      ...Object.fromEntries(codeBlock.metaOptions.list().map((option) => [option.key, option.value])),
      __raw: codeBlock.meta
    },
    codeToHast: getUnsupportedFnHandler("codeToHast"),
    codeToTokens: getUnsupportedFnHandler("codeToTokens")
  };
}
var ExpressiveCodeShikiTransformerError = class extends Error {
  constructor(transformer, message) {
    super(
      `Failed to run Shiki transformer${transformer.name ? ` "${transformer.name}"` : ""}: ${message}
			
			IMPORTANT: This is not a bug - neither in Shiki, nor in the transformer or Expressive Code.
			Transformer support in Expressive Code is still experimental and limited to a few cases
			(e.g. transformers that modify syntax highlighting tokens).

			To continue, remove this transformer from the Expressive Code configuration,
			or visit the following link for more information and other options:
			https://expressive-code.com/key-features/syntax-highlighting/#transformers`.replace(/^\t+/gm, "").replace(/(?<!\n)\n(?!\n)/g, " ")
    );
    this.name = "ExpressiveCodeShikiTransformerError";
  }
};

// src/index.ts
async function loadShikiTheme(bundledThemeName) {
  const shikiTheme = (await bundledThemes[bundledThemeName]()).default;
  return new ExpressiveCodeTheme2(shikiTheme);
}
function pluginShiki(options = {}) {
  const { langs, langAlias = {}, injectLangsIntoNestedCodeBlocks, engine } = options;
  validateTransformers(options);
  return {
    name: "Shiki",
    hooks: {
      performSyntaxAnalysis: async ({ codeBlock, styleVariants, config: { logger } }) => {
        const codeLines = codeBlock.getLines();
        let code = codeBlock.code;
        if (isTerminalLanguage(codeBlock.language)) {
          code = code.replace(/<([^>]*[^>\s])>/g, "X$1X");
        }
        let highlighter;
        try {
          highlighter = await getCachedHighlighter({ langs, langAlias, injectLangsIntoNestedCodeBlocks, engine });
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err));
          throw new Error(`Failed to load syntax highlighter. Please ensure that the configured langs are supported by Shiki.
Received error message: "${error.message}"`, {
            cause: error
          });
        }
        const languageLoadErrors = await ensureLanguagesAreLoaded({ highlighter, langs: [codeBlock.language], langAlias });
        const resolvedLanguage = langAlias[codeBlock.language] ?? codeBlock.language;
        const primaryLanguageFailed = languageLoadErrors.failedLanguages.has(resolvedLanguage);
        const embeddedLanguagesFailed = languageLoadErrors.failedEmbeddedLanguages.size > 0;
        const loadedLanguageName = primaryLanguageFailed ? "txt" : resolvedLanguage;
        if (primaryLanguageFailed || embeddedLanguagesFailed) {
          const formatLangs = (langs2) => `language${[...langs2].length !== 1 ? "s" : ""} ${[...langs2].sort().map((lang) => `"${lang}"`).join(", ")}`;
          const errorParts = [
            `Error while highlighting code block using ${formatLangs([codeBlock.language])} in ${codeBlock.parentDocument?.sourceFilePath ? `document "${codeBlock.parentDocument?.sourceFilePath}"` : "markdown/MDX document"}.`
          ];
          if (primaryLanguageFailed)
            errorParts.push(`The language could not be found. Using "${loadedLanguageName}" instead.`);
          if (embeddedLanguagesFailed) {
            errorParts.push(`The embedded ${formatLangs(languageLoadErrors.failedEmbeddedLanguages)} could not be found, so highlighting may be incomplete.`);
          }
          errorParts.push('Ensure that all required languages are either part of the bundle or custom languages provided in the "langs" config option.');
          logger.warn(errorParts.join(" "));
        }
        for (let styleVariantIndex = 0; styleVariantIndex < styleVariants.length; styleVariantIndex++) {
          const theme = styleVariants[styleVariantIndex].theme;
          const loadedThemeName = await ensureThemeIsLoaded(highlighter, theme, styleVariants);
          let tokenLines = [];
          try {
            const codeToTokensOptions = {
              lang: loadedLanguageName,
              theme: loadedThemeName,
              includeExplanation: false
            };
            runPreprocessHook({ options, code, codeBlock, codeToTokensOptions });
            const codeToTokensBase = highlighter.codeToTokensBase;
            await runHighlighterTask(() => {
              tokenLines = codeToTokensBase(code, codeToTokensOptions);
            });
            tokenLines = runTokensHook({ options, code, codeBlock, codeToTokensOptions, tokenLines });
          } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            throw new Error(`Failed to highlight code block with language "${codeBlock.language}" and theme "${theme.name}".
Received error message: "${error.message}"`, {
              cause: error
            });
          }
          tokenLines.forEach((line, lineIndex) => {
            if (codeBlock.language === "ansi" && styleVariantIndex === 0)
              removeAnsiSequencesFromCodeLine(codeLines[lineIndex], line);
            let charIndex = 0;
            line.forEach((token) => {
              const tokenLength = token.content.length;
              const tokenEndIndex = charIndex + tokenLength;
              const fontStyle = token.fontStyle || 0 /* None */;
              codeLines[lineIndex]?.addAnnotation(
                new InlineStyleAnnotation({
                  styleVariantIndex,
                  color: token.color || theme.fg,
                  bgColor: token.bgColor,
                  italic: (fontStyle & 1 /* Italic */) === 1 /* Italic */,
                  bold: (fontStyle & 2 /* Bold */) === 2 /* Bold */,
                  underline: (fontStyle & 4 /* Underline */) === 4 /* Underline */,
                  strikethrough: (fontStyle & 8 /* Strikethrough */) === 8 /* Strikethrough */,
                  inlineRange: {
                    columnStart: charIndex,
                    columnEnd: tokenEndIndex
                  },
                  renderPhase: "earliest"
                })
              );
              charIndex = tokenEndIndex;
            });
          });
        }
      }
    }
  };
}
function isTerminalLanguage(language) {
  return ["shellscript", "shell", "bash", "sh", "zsh", "nu", "nushell"].includes(language);
}
function removeAnsiSequencesFromCodeLine(codeLine, lineTokens) {
  const newLine = lineTokens.map((token) => token.content).join("");
  const rangesToRemove = getRemovedRanges(codeLine.text, newLine);
  for (let index = rangesToRemove.length - 1; index >= 0; index--) {
    const [start, end] = rangesToRemove[index];
    codeLine.editText(start, end, "");
  }
}
function getRemovedRanges(original, edited) {
  const ranges = [];
  let from = -1;
  let orgIdx = 0;
  let edtIdx = 0;
  while (orgIdx < original.length && edtIdx < edited.length) {
    if (original[orgIdx] !== edited[edtIdx]) {
      if (from === -1)
        from = orgIdx;
      orgIdx++;
    } else {
      if (from > -1) {
        ranges.push([from, orgIdx]);
        from = -1;
      }
      orgIdx++;
      edtIdx++;
    }
  }
  if (edtIdx < edited.length)
    throw new Error(`Edited string contains characters not present in original (${JSON.stringify({ original, edited })})`);
  if (orgIdx < original.length)
    ranges.push([orgIdx, original.length]);
  return ranges;
}
export {
  loadShikiTheme,
  pluginShiki
};
//# sourceMappingURL=index.js.map