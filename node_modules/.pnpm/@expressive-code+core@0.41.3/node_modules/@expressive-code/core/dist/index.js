// src/hast.ts
import { toHtml } from "hast-util-to-html";
import { toText } from "hast-util-to-text";
import { matches, select, selectAll } from "hast-util-select";
import { visit } from "unist-util-visit";
import { visitParents, CONTINUE, EXIT, SKIP } from "unist-util-visit-parents";
import { h, s } from "hastscript";
import postcss, { Declaration } from "postcss";

// src/internal/escaping.ts
function escapeRegExp(input) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function serializeCssStringValue(value, quoteStyle = "single") {
  const quote = quoteStyle === "single" ? "'" : '"';
  const escapedValue = Array.from(value).map((char) => {
    const code = char.charCodeAt(0);
    switch (true) {
      case code === 0:
        return "\uFFFD";
      case (code >= 1 && code <= 31 || code === 127):
        return `\\${code.toString(16)} `;
      case (char === quote || char === "\\"):
        return `\\${char}`;
      default:
        return char;
    }
  }).join("");
  return `${quote}${escapedValue}${quote}`;
}

// src/hast.ts
function setProperty(node, propertyName, value) {
  const properties = node.properties || {};
  node.properties = properties;
  if (value !== null) {
    properties[propertyName] = value;
  } else {
    delete properties[propertyName];
  }
}
function getClassNames(node) {
  const stringOrArr = node.properties?.className;
  if (!stringOrArr || stringOrArr === true)
    return [];
  if (Array.isArray(stringOrArr))
    return stringOrArr.map((className) => className.toString());
  return stringOrArr.toString().split(" ");
}
function addClassName(node, className) {
  const classNames = getClassNames(node);
  if (classNames.indexOf(className) === -1)
    classNames.push(className);
  setProperty(node, "className", classNames);
}
function removeClassName(node, className) {
  const classNames = getClassNames(node);
  const index = classNames.indexOf(className);
  if (index === -1)
    return;
  classNames.splice(index, 1);
  setProperty(node, "className", classNames);
}
function getInlineStyles(node) {
  const styles = /* @__PURE__ */ new Map();
  const styleString = node.properties?.style?.toString().trim() || "";
  if (!styleString)
    return styles;
  const postCssOptions = { from: void 0 };
  try {
    const root = postcss.parse(styleString, postCssOptions);
    root.each((node2) => {
      if (node2.type === "decl")
        styles.set(node2.prop, node2.value);
    });
  } catch (error) {
  }
  return styles;
}
function setInlineStyles(node, styles) {
  const styleString = [...styles].map(
    ([prop, value]) => new Declaration({
      prop,
      value,
      raws: {
        between: ":"
      }
    }).toString()
  ).join(";");
  setProperty(node, "style", styleString);
}
function setInlineStyle(node, cssProperty, value, valueFormat = "raw") {
  const styles = getInlineStyles(node);
  if (value !== null) {
    styles.set(cssProperty, valueFormat === "string" ? serializeCssStringValue(value) : value);
  } else {
    styles.delete(cssProperty);
  }
  setInlineStyles(node, styles);
}

// src/common/annotation.ts
var AnnotationRenderPhaseOrder = ["earliest", "earlier", "normal", "later", "latest"];
var ExpressiveCodeAnnotation = class {
  constructor({ inlineRange, renderPhase }) {
    this.inlineRange = inlineRange;
    this.renderPhase = renderPhase;
  }
  /**
   * An optional name for the annotation. This can be used for debugging or logging purposes,
   * or to allow other plugins to identify the annotation.
   */
  name;
  /**
   * An optional range of columns within the line that this annotation applies to.
   * If not provided, the annotation will apply to the entire line.
   */
  inlineRange;
  /**
   * Determines the phase in which this annotation should be rendered.
   * Rendering is done in phases, from `earliest` to `latest`.
   * Annotations with the same phase are rendered in the order they were added.
   *
   * The earlier an annotation is rendered, the more likely it is to be split, modified
   * or wrapped by later annotations. Syntax highlighting is rendered in the `earliest` phase
   * to allow other annotations to wrap and modify the highlighted code.
   *
   * The default phase is `normal`.
   */
  renderPhase;
};
var InlineStyleAnnotation = class extends ExpressiveCodeAnnotation {
  name;
  color;
  bgColor;
  italic;
  bold;
  underline;
  strikethrough;
  styleVariantIndex;
  constructor({ color, bgColor, italic = false, bold = false, underline = false, strikethrough = false, styleVariantIndex, ...baseOptions }) {
    super(baseOptions);
    this.name = "Inline style";
    this.color = color;
    this.bgColor = bgColor;
    this.italic = italic;
    this.bold = bold;
    this.underline = underline;
    this.strikethrough = strikethrough;
    this.styleVariantIndex = styleVariantIndex;
  }
  render({ nodesToTransform, styleVariants }) {
    const newStyles = /* @__PURE__ */ new Map();
    const addStylesForVariantIndex = (variantIndex) => {
      const varPrefix = `--${variantIndex}`;
      if (this.color)
        newStyles.set(varPrefix, this.color);
      if (this.bgColor)
        newStyles.set(`${varPrefix}bg`, this.bgColor);
      if (this.italic)
        newStyles.set(`${varPrefix}fs`, "italic");
      if (this.bold)
        newStyles.set(`${varPrefix}fw`, "bold");
      const textDecorations = [];
      if (this.underline)
        textDecorations.push("underline");
      if (this.strikethrough)
        textDecorations.push("line-through");
      if (textDecorations.length)
        newStyles.set(`${varPrefix}td`, textDecorations.join(" "));
    };
    const variantIndices = this.styleVariantIndex !== void 0 ? [this.styleVariantIndex] : styleVariants.map((_, i) => i);
    variantIndices.forEach(addStylesForVariantIndex);
    if (newStyles.size === 0)
      return nodesToTransform;
    const buildStyleString = (styles) => {
      return [...styles].map(([key, value]) => `${key}:${value}`).join(";");
    };
    const isInlineStyleNode = (node) => node.tagName === "span" && // Our inline style nodes have no class names
    !getClassNames(node).length && // Our inline style nodes contain CSS variable declarations
    node.properties?.style?.toString().startsWith("--");
    const modifyExistingStyles = (node, remove = false) => {
      const existingStyles = (node.properties?.style?.toString() || "").split(";").map((style) => {
        const declParts = style.split(":");
        return [declParts[0], declParts.slice(1).join(":")];
      });
      const modifiedStylesMap = new Map(existingStyles);
      newStyles.forEach((value, key) => {
        if (remove) {
          modifiedStylesMap.delete(key);
        } else {
          modifiedStylesMap.set(key, value);
        }
      });
      const modifiedStyles = buildStyleString(modifiedStylesMap);
      if (modifiedStyles) {
        setProperty(node, "style", modifiedStyles);
      } else if (node.properties?.style) {
        delete node.properties.style;
      }
      return modifiedStyles;
    };
    const removeNestedConflictingStyles = (node) => {
      for (let childIdx = node.children?.length - 1; childIdx >= 0; childIdx--) {
        const child = node.children[childIdx];
        if (child.type === "element") {
          if (isInlineStyleNode(child)) {
            if (!modifyExistingStyles(child, true)) {
              node.children.splice(childIdx, 1, ...child.children);
            }
          }
          removeNestedConflictingStyles(child);
        }
      }
    };
    return nodesToTransform.map((node) => {
      removeNestedConflictingStyles(node);
      if (node.type === "element" && isInlineStyleNode(node)) {
        modifyExistingStyles(node);
        return node;
      }
      const transformedNode = h("span", { style: buildStyleString(newStyles) }, node);
      return transformedNode;
    });
  }
};
function isInlineStyleAnnotation(annotation) {
  return annotation instanceof InlineStyleAnnotation || annotation.name === "Inline style";
}

// src/helpers/meta-options.ts
var MetaOptions = class {
  constructor(input) {
    const { options, errors } = parseOptions(input);
    this.#parsedOptions = options;
    this.#errors = errors.length ? errors : void 0;
  }
  #parsedOptions;
  #errors;
  /**
   * A list of error messages that occurred when parsing the meta string,
   * or `undefined` if no errors occurred.
   */
  get errors() {
    return this.#errors;
  }
  /**
   * Returns a list of meta options, optionally filtered by their key and/or {@link MetaOptionKind}.
   *
   * @param keyOrKeys
   * Allows to filter the options by key. An empty string will return options without a key.
   * A non-empty string will return options with a matching key (case-insensitive).
   * An array of strings will return options with any of the matching keys.
   * If omitted, no key-based filtering will be applied.
   *
   * @param kind
   * Allows to filter the options by {@link MetaOptionKind}.
   * If omitted, no kind-based filtering will be applied.
   */
  list(keyOrKeys, kind) {
    const filtered = this.#parsedOptions.filter((option) => {
      if (kind !== void 0 && option.kind !== kind)
        return false;
      if (keyOrKeys === void 0)
        return true;
      const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
      return keys.some((key) => key === "" && !option.key || option.key?.toLowerCase() === key.toLowerCase());
    });
    return filtered;
  }
  value(key, kind) {
    if (!key)
      throw new Error("You must specify a non-empty key when using getString, getRange, getRegExp or getBoolean.");
    return this.list(key, kind)?.pop()?.value;
  }
  /**
   * Returns the last string value with the given key (case-insensitive),
   * or without a key by passing an empty string.
   */
  getString(key) {
    return this.value(key, "string");
  }
  /**
   * Returns an array of all string values with the given keys (case-insensitive),
   * or without a key by passing an empty string.
   */
  getStrings(keyOrKeys) {
    return this.list(keyOrKeys, "string").map((option) => option.value);
  }
  /**
   * Returns the last range value (`{value}`) with the given key (case-insensitive),
   * or without a key by passing an empty string.
   */
  getRange(key) {
    return this.value(key, "range");
  }
  /**
   * Returns an array of all range values (`{value}`) with the given keys (case-insensitive),
   * or without a key by passing an empty string.
   */
  getRanges(keyOrKeys) {
    return this.list(keyOrKeys, "range").map((option) => option.value);
  }
  /**
   * Returns the last integer value with the given key (case-insensitive),
   * or without a key by passing an empty string.
   */
  getInteger(key) {
    return this.getIntegers(key).pop();
  }
  /**
   * Returns an array of all integer values with the given keys (case-insensitive),
   * or without a key by passing an empty string.
   */
  getIntegers(keyOrKeys) {
    return this.list(keyOrKeys).map((option) => {
      if (option.kind !== "string" && option.kind !== "range")
        return NaN;
      if (!/^-?\d+$/.test(option.value.trim()))
        return NaN;
      return parseInt(option.value, 10);
    }).filter((value) => !isNaN(value));
  }
  /**
   * Returns the last RegExp value (`/value/`) with the given key (case-insensitive),
   * or without a key by passing an empty string.
   */
  getRegExp(key) {
    return this.value(key, "regexp");
  }
  /**
   * Returns an array of all RegExp values (`/value/`) with the given keys (case-insensitive),
   * or without a key by passing an empty string.
   */
  getRegExps(keyOrKeys) {
    return this.list(keyOrKeys, "regexp").map((option) => option.value);
  }
  /**
   * Returns the last boolean value with the given key (case-insensitive).
   */
  getBoolean(key) {
    return this.value(key, "boolean");
  }
};
function parseOptions(input, syntax = {
  valueDelimiters: ["'", '"', "/", "{...}"],
  keyValueSeparator: "="
}) {
  const options = [];
  const errors = [];
  const delimitedValues = parseDelimitedValues(input, syntax);
  let inputWithoutDelimited = input;
  delimitedValues.forEach(({ index, fullMatch: raw, key, value, valueStartDelimiter, valueEndDelimiter }) => {
    inputWithoutDelimited = inputWithoutDelimited.slice(0, index) + " ".repeat(raw.length) + inputWithoutDelimited.slice(index + raw.length);
    if (valueStartDelimiter === "/") {
      let regExp2;
      try {
        regExp2 = new RegExp(value, "gd");
      } catch (_error) {
        try {
          regExp2 = new RegExp(value, "g");
        } catch (error) {
          const msg = error instanceof Error ? error.message : error;
          errors.push(`Failed to parse option \`${raw.trim()}\`: ${msg}`);
          return;
        }
      }
      options.push({
        index,
        raw,
        kind: "regexp",
        key,
        value: regExp2,
        valueStartDelimiter,
        valueEndDelimiter
      });
      return;
    }
    if (valueStartDelimiter === "{") {
      options.push({
        index,
        raw,
        kind: "range",
        key,
        value,
        valueStartDelimiter,
        valueEndDelimiter
      });
      return;
    }
    options.push({
      index,
      raw,
      kind: "string",
      key,
      value,
      valueStartDelimiter,
      valueEndDelimiter
    });
  });
  const escapedSeparator = escapeRegExp(syntax.keyValueSeparator).replace(/-/g, "\\-");
  const regExp = new RegExp(`([^\\s${escapedSeparator}]+)(?:\\s*${escapedSeparator}\\s*(\\S+))?`, "g");
  const simpleOptions = [...inputWithoutDelimited.matchAll(regExp)];
  simpleOptions.forEach((match) => {
    const index = match.index ?? 0;
    const [raw, key, value] = match;
    if (value === "true" || value === "false" || value === void 0) {
      options.push({
        index,
        raw,
        kind: "boolean",
        key,
        value: value !== "false",
        valueStartDelimiter: "",
        valueEndDelimiter: ""
      });
    } else {
      options.push({
        index,
        raw,
        kind: "string",
        key,
        value,
        valueStartDelimiter: "",
        valueEndDelimiter: ""
      });
    }
  });
  options.sort((a, b) => a.index - b.index);
  return {
    options,
    errors
  };
}
function parseDelimitedValues(input, syntax) {
  const valueDelimiterPairs = syntax.valueDelimiters.map((valueDelimiter) => {
    const parts = valueDelimiter.split("...");
    const isPair = parts.length === 2;
    return {
      valueStartDelimiter: isPair ? parts[0] : valueDelimiter,
      valueEndDelimiter: isPair ? parts[1] : valueDelimiter
    };
  });
  const singleCharValueDelimiters = valueDelimiterPairs.map((pair) => pair.valueStartDelimiter).filter((delimiter) => delimiter.length === 1).join("");
  const regExpParts = valueDelimiterPairs.map(({ valueStartDelimiter, valueEndDelimiter }) => {
    const part = [
      // Whitespace or start of string
      `(?:\\s|^)`,
      // Optional group for key name and key/value separator
      [
        // Start of non-capturing optional group
        `(?:`,
        // Key name (captured)
        `([^\\s${escapeRegExp((singleCharValueDelimiters + syntax.keyValueSeparator).replace(/-/g, "\\-"))}]+)`,
        // Optional whitespace
        `\\s*`,
        // Key/value separator (e.g. `=`)
        escapeRegExp(syntax.keyValueSeparator),
        // Optional whitespace
        `\\s*`,
        // End of non-capturing optional group
        `)?`
      ],
      // Value start delimiter
      escapeRegExp(valueStartDelimiter),
      // Value string (captured, can be an empty string),
      // consisting of any of the following parts:
      // - any character that is not a backslash
      // - a backslash followed by any character
      `((?:[^\\\\]|\\\\.)*?)`,
      // Value end delimiter that is not escaped by a preceding `\`
      `${escapeRegExp(valueEndDelimiter)}`,
      // Whitespace or end of string
      `(?=\\s|$)`
    ];
    return part.flat().join("");
  });
  const regExp = new RegExp(regExpParts.join("|"), "g");
  const matches2 = [...input.matchAll(regExp)];
  return matches2.map((match) => {
    const [fullMatch, ...keyValuePairs] = match;
    const firstCaptureGroupIndex = keyValuePairs.findIndex((value2) => value2 !== void 0);
    const delimiterPairIdx = Math.floor(firstCaptureGroupIndex / 2);
    const { valueStartDelimiter, valueEndDelimiter } = valueDelimiterPairs[delimiterPairIdx];
    const [key, escapedValue] = keyValuePairs.slice(delimiterPairIdx * 2, delimiterPairIdx * 2 + 2);
    const escapedBackslashOrValueEndDelimiter = new RegExp(`\\\\(\\\\|${escapeRegExp(valueEndDelimiter)})`, "g");
    const value = escapedValue.replace(escapedBackslashOrValueEndDelimiter, "$1");
    return {
      index: match.index ?? 0,
      fullMatch,
      key,
      value,
      valueStartDelimiter,
      valueEndDelimiter
    };
  });
}

// src/common/logger.ts
var ExpressiveCodeLogger = class {
  label;
  logger;
  constructor(logger = {}) {
    this.label = logger.label ?? "expressive-code";
    this.logger = logger;
  }
  debug(message) {
    if (this.logger.debug) {
      this.logger.debug(message);
    } else {
      console.debug(`[${this.label}] ${message}`);
    }
  }
  info(message) {
    if (this.logger.info) {
      this.logger.info(message);
    } else {
      console.info(`[${this.label}] ${message}`);
    }
  }
  warn(message) {
    if (this.logger.warn) {
      this.logger.warn(message);
    } else {
      console.warn(`[${this.label}] ${message}`);
    }
  }
  error(message) {
    if (this.logger.error) {
      this.logger.error(message);
    } else {
      console.error(`[${this.label}] ${message}`);
    }
  }
};
function logErrorDetails(input) {
  const pad = (lines) => lines.map((line) => `    ${line}`);
  const getErrorDetails = (error2) => {
    const lines = [];
    const errMsgLines = error2.message.split(/\r?\n/);
    lines.push(`${error2.name}: ${errMsgLines[0]}`, ...errMsgLines.slice(1));
    if (error2.stack) {
      lines.push(...error2.stack.split(/\r?\n/).slice(errMsgLines.length));
    }
    if (error2.cause instanceof Error) {
      lines.push("Caused by:");
      lines.push(...pad(getErrorDetails(error2.cause)));
    }
    return lines;
  };
  const error = input.error instanceof Error ? input.error : new Error(String(input.error));
  const details = pad(getErrorDetails(error)).join("\n");
  input.logger.error(`${input.prefix} Error details:
${details}
`);
}

// src/common/plugin-hooks.ts
async function runHooks(key, context, runner) {
  const { plugins, config } = context;
  for (const plugin of plugins) {
    const hookFn = plugin.hooks?.[key];
    if (!hookFn)
      continue;
    try {
      await runner({ hookName: key, hookFn, plugin });
    } catch (error) {
      const msg = error instanceof Error ? error.message : error;
      const prefix = `Plugin "${plugin.name}" caused an error in its "${key}" hook.`;
      logErrorDetails({ logger: config.logger, prefix, error });
      throw new Error(`${prefix} Error message: ${msg}`, { cause: error });
    }
  }
}

// src/internal/css.ts
import postcss2 from "postcss";
import postcssNested from "postcss-nested";
var groupWrapperElement = "div";
var groupWrapperClassName = "expressive-code";
var cssVarReplacements = /* @__PURE__ */ new Map([
  ["background", "bg"],
  ["foreground", "fg"],
  ["color", "col"],
  ["border", "brd"],
  ["padding", "pad"],
  ["margin", "marg"],
  ["radius", "rad"],
  ["opacity", "opa"],
  ["width", "wd"],
  ["height", "ht"],
  ["weight", "wg"],
  ["block", "blk"],
  ["inline", "inl"],
  ["bottom", "btm"],
  ["value", "val"],
  ["active", "act"],
  ["inactive", "inact"],
  ["highlight", "hl"],
  ["selection", "sel"],
  ["indicator", "ind"],
  ["shadow", "shd"],
  ["family", "fml"],
  ["transform", "trf"],
  ["decoration", "dec"],
  ["button", "btn"],
  ["editor", "ed"],
  ["terminal", "trm"],
  ["scrollbar", "sb"],
  ["toolbar", "tb"],
  ["gutter", "gtr"],
  ["titlebar", "ttb"],
  ["textMarkers", "tm"],
  ["frames", "frm"]
]);
var preprocessor = postcss2([
  // Prevent top-level selectors that are already scoped from being scoped twice
  (root) => {
    const groupWrapperScope = `.${groupWrapperClassName}`;
    root.walkRules((rule) => {
      if (rule.parent?.parent === root) {
        rule.selectors = rule.selectors.map((selector) => {
          if (selector.indexOf(groupWrapperScope) === 0) {
            return selector.slice(groupWrapperScope.length).trim() || "&";
          }
          return selector;
        });
      }
    });
  },
  // Parse SASS-like nested selectors
  postcssNested()
]);
var processor = postcss2([
  // Prevent selectors targeting the wrapper class name or top-level elements from being scoped
  (root) => {
    const groupWrapperScope = escapeRegExp(`.${groupWrapperClassName}`);
    const regExpScopedTopLevel = new RegExp(`^${groupWrapperScope} .*(${groupWrapperScope}|:root|html|body)`, "g");
    root.walkRules((rule) => {
      rule.selectors = rule.selectors.map((selector) => selector.replace(regExpScopedTopLevel, "$1"));
    });
  },
  // Apply some simple minifications
  (root) => {
    root.raws.after = "";
    root.walkComments((comment) => {
      comment.remove();
    });
    root.walkRules((rule) => {
      rule.selector = rule.selectors.join(",");
      rule.raws.before = rule.raws.before?.trim() || "";
      rule.raws.between = "";
      rule.raws.after = "";
      rule.raws.semicolon = false;
    });
    root.walkAtRules((atRule) => {
      atRule.raws.before = atRule.raws.before?.trim() || "";
      atRule.raws.between = "";
      atRule.raws.after = "";
    });
    root.walkDecls((decl) => {
      decl.raws.before = decl.raws.before?.trim() || "";
      decl.raws.between = decl.raws.between?.trim() || ":";
      decl.raws.value = {
        value: decl.value,
        raw: decl.raws.value?.raw.trim() ?? decl.value.trim()
      };
    });
  }
]);
async function scopeAndMinifyNestedCss(css) {
  const postCssOptions = { from: void 0 };
  const root = postcss2.parse(`.${groupWrapperClassName}{${css}}`, postCssOptions);
  const preprocessedStyles = await preprocessor.process(root, postCssOptions);
  const processedStyles = await processor.process(preprocessedStyles, postCssOptions);
  return processedStyles.css;
}
var processedStylesCache = /* @__PURE__ */ new Map();
async function processPluginStyles(pluginStyles) {
  const result = /* @__PURE__ */ new Set();
  const seenStyles = /* @__PURE__ */ new Set();
  for (const { pluginName, styles } of pluginStyles) {
    if (seenStyles.has(styles))
      continue;
    seenStyles.add(styles);
    const cacheKey = styles;
    const cachedStyles = processedStylesCache.get(cacheKey);
    if (cachedStyles !== void 0) {
      result.add(cachedStyles);
      continue;
    }
    try {
      const processedCss = await scopeAndMinifyNestedCss(styles);
      result.add(processedCss);
      processedStylesCache.set(cacheKey, processedCss);
    } catch (error) {
      const msg = error instanceof Error ? error.message : error;
      throw new Error(`Plugin "${pluginName}" added CSS styles that could not be processed (error=${JSON.stringify(msg)}). Styles="${styles}"`);
    }
  }
  return result;
}
function wrapInCascadeLayer(css, cascadeLayerName) {
  if (!cascadeLayerName || cascadeLayerName.trim() === "")
    return css;
  return `@layer ${cascadeLayerName.trim()}{${css}}`;
}

// src/common/style-settings.ts
function getCssVarName(styleSetting) {
  let varName = styleSetting.replace(/\./g, "-");
  const capitalize = (word) => word[0].toUpperCase() + word.slice(1);
  cssVarReplacements.forEach((replacement, term) => {
    const termRegExp = new RegExp(
      [
        // The lowercase term,
        // preceded by a non-lowercase character or the beginning of the string,
        // and followed by a non-lowercase character or the end of the string
        `(?<=[^a-z]|^)${term}(?=[^a-z]|$)`,
        // The capitalized term,
        // preceded by a lowercase character or the beginning of the string,
        // and followed by a non-lowercase character or the end of the string
        `(?<=[a-z]|^)${capitalize(term)}(?=[^a-z]|$)`
      ].join("|"),
      "g"
    );
    varName = varName.replace(termRegExp, (match) => match === term ? replacement : capitalize(replacement));
  });
  return `--ec-${varName}`;
}
var codeLineClass = "ec-line";

// src/internal/type-checks.ts
function isNumber(input) {
  return typeof input === "number" && !isNaN(input);
}
function isString(input) {
  return typeof input === "string";
}
function isBoolean(input) {
  return typeof input === "boolean";
}
function isHastNode(node) {
  return node?.type ? typeof node.type === "string" : false;
}
function isHastElement(node) {
  return isHastNode(node) && node.type === "element";
}
function newTypeError(expectedTypeDescription, actualValue, fieldName) {
  return new Error(`${fieldName ? `Invalid ${fieldName} value: ` : ""}Expected a valid ${expectedTypeDescription}, but got ${JSON.stringify(actualValue)}`);
}

// src/internal/render-line.ts
function splitLineAtAnnotationBoundaries(line) {
  const textParts = [];
  const partIndicesByAnnotation = /* @__PURE__ */ new Map();
  const fullText = line.text;
  const annotations = line.getAnnotations();
  const annotationBoundaries = [
    ...new Set(
      annotations.flatMap(({ inlineRange }) => {
        if (!inlineRange)
          return [];
        return [inlineRange.columnStart, inlineRange.columnEnd];
      })
    )
  ].sort((a, b) => a - b);
  let lastColumn = 0;
  annotationBoundaries.forEach((column) => {
    if (column === lastColumn)
      return;
    textParts.push(fullText.slice(lastColumn, column));
    lastColumn = column;
  });
  if (lastColumn < fullText.length)
    textParts.push(fullText.slice(lastColumn));
  annotations.forEach((annotation) => {
    if (!annotation.inlineRange)
      return;
    const { columnStart, columnEnd } = annotation.inlineRange;
    const partIndices = [];
    let partStart = 0;
    textParts.forEach((part, partIndex) => {
      const partEnd = partStart + part.length;
      if (partStart >= columnStart && partEnd <= columnEnd) {
        partIndices.push(partIndex);
      }
      partStart = partEnd;
    });
    partIndicesByAnnotation.set(annotation, partIndices);
  });
  return {
    textParts,
    partIndicesByAnnotation
  };
}
function renderLineToAst({
  line,
  lineIndex,
  gutterElements,
  ...restContext
}) {
  const { textParts, partIndicesByAnnotation } = splitLineAtAnnotationBoundaries(line);
  const partNodes = textParts.map((textPart) => h(null, [textPart]));
  const annotations = [...line.getAnnotations()].sort(renderPhaseSortFn);
  annotations.forEach((annotation, annotationIndex) => {
    if (!annotation.inlineRange)
      return;
    const partIndices = partIndicesByAnnotation.get(annotation);
    if (!partIndices)
      throw new Error(`Failed to find inline annotation in part indices: ${JSON.stringify(annotation)}`);
    if (partIndices.length > 1) {
      const isPartiallyContainedInLaterAnnotations = annotations.slice(annotationIndex + 1).some((laterAnnotation) => {
        if (!laterAnnotation.inlineRange)
          return false;
        const laterPartIndices = partIndicesByAnnotation.get(laterAnnotation);
        if (!laterPartIndices)
          return false;
        const intersectingParts = laterPartIndices.filter((partIndex) => partIndices.includes(partIndex));
        const isPartiallyContained = intersectingParts.length > 0 && intersectingParts.length < partIndices.length;
        return isPartiallyContained;
      });
      if (!isPartiallyContainedInLaterAnnotations) {
        const mergedNode = h(
          null,
          partIndices.map((partIndex) => partNodes[partIndex])
        );
        partNodes.splice(partIndices[0], partIndices.length, mergedNode);
        const indicesToRemove = partIndices.length - 1;
        const firstPartIndex = partIndices[0];
        const lastPartIndex = partIndices[partIndices.length - 1];
        partIndicesByAnnotation.forEach((partIndicesToCheck) => {
          let anyChanges = false;
          const updatedIndices = partIndicesToCheck.map((partIndex) => {
            if (partIndex <= firstPartIndex)
              return partIndex;
            anyChanges = true;
            if (partIndex > lastPartIndex)
              return partIndex - indicesToRemove;
            return NaN;
          }).filter((partIndex) => !isNaN(partIndex));
          if (anyChanges) {
            partIndicesToCheck.splice(0, partIndicesToCheck.length, ...updatedIndices);
          }
        });
      }
    }
    const renderInput = partIndices.map((partIndex) => partNodes[partIndex]);
    const renderOutput = annotation.render({ nodesToTransform: [...renderInput], line, lineIndex, ...restContext });
    validateAnnotationRenderOutput(renderOutput, renderInput.length);
    partIndices.forEach((partIndex, index) => {
      partNodes[partIndex] = renderOutput[index];
    });
  });
  const sortedGutterElements = [...gutterElements].sort((a, b) => renderPhaseSortFn(a.gutterElement, b.gutterElement));
  const renderedGutterElements = sortedGutterElements.map(({ pluginName, gutterElement }) => {
    try {
      const node = gutterElement.renderLine({ ...restContext, line, lineIndex });
      if (!isHastElement(node))
        throw new Error(`renderLine function did not return a valid HAST Element node: ${JSON.stringify(node)}`);
      return node;
    } catch (error) {
      const msg = error instanceof Error ? error.message : error;
      throw new Error(`Plugin "${pluginName}" failed to render a gutter element. Error message: ${msg}`, { cause: error });
    }
  });
  let lineNode = h(`div.${codeLineClass}`);
  if (renderedGutterElements.length) {
    lineNode.children.push(h("div.gutter", renderedGutterElements));
  }
  lineNode.children.push(h("div.code", partNodes.length > 0 ? partNodes : h(null, "\n")));
  annotations.forEach((annotation) => {
    if (annotation.inlineRange)
      return;
    const renderOutput = annotation.render({ nodesToTransform: [lineNode], line, lineIndex, ...restContext });
    validateAnnotationRenderOutput(renderOutput, 1);
    lineNode = renderOutput[0];
    if (!isHastElement(lineNode)) {
      throw newTypeError("hast Element", lineNode, "line-level annotation render output");
    }
  });
  return lineNode;
}
function getRenderEmptyLineFn(context) {
  return () => {
    const { gutterElements } = context;
    const sortedGutterElements = [...gutterElements].sort((a, b) => renderPhaseSortFn(a.gutterElement, b.gutterElement));
    const renderedGutterElements = sortedGutterElements.map(({ pluginName, gutterElement }) => {
      try {
        const node = gutterElement.renderPlaceholder();
        if (!isHastElement(node))
          throw new Error(`renderPlaceholder function did not return a valid HAST Element node: ${JSON.stringify(node)}`);
        return node;
      } catch (error) {
        const msg = error instanceof Error ? error.message : error;
        throw new Error(`Plugin "${pluginName}" failed to render a gutter element placeholder. Error message: ${msg}`, { cause: error });
      }
    });
    const lineAst = h(`div.${codeLineClass}`);
    const gutterWrapper = renderedGutterElements.length ? h("div.gutter", renderedGutterElements) : void 0;
    if (gutterWrapper)
      lineAst.children.push(gutterWrapper);
    const codeWrapper = h("div.code");
    lineAst.children.push(codeWrapper);
    return {
      lineAst,
      gutterWrapper,
      codeWrapper
    };
  };
}
function renderPhaseSortFn(a, b) {
  const indexA = AnnotationRenderPhaseOrder.indexOf(a.renderPhase || "normal");
  const indexB = AnnotationRenderPhaseOrder.indexOf(b.renderPhase || "normal");
  return indexA - indexB;
}
function validateAnnotationRenderOutput(nodes, expectedLength) {
  if (!Array.isArray(nodes) || nodes.length !== expectedLength)
    throw new Error(`Expected annotation render function to return an array of ${expectedLength} node(s), but got ${JSON.stringify(nodes)}.`);
  nodes.forEach((node, nodeIndex) => {
    if (!node || !node.type)
      throw new Error(`Annotation render function returned an invalid node at index ${nodeIndex}: ${JSON.stringify(node)}`);
  });
}

// src/internal/render-block.ts
async function renderBlock({
  codeBlock,
  groupContents,
  locale,
  config,
  plugins,
  cssVar,
  cssVarName,
  styleVariants
}) {
  const state = {
    canEditAnnotations: true,
    canEditCode: true,
    canEditLanguage: true,
    canEditMetadata: true
  };
  codeBlock.state = state;
  const blockStyles = [];
  const gutterElements = [];
  const runHooksContext = {
    plugins,
    config
  };
  const baseContext = {
    codeBlock,
    groupContents,
    locale,
    config,
    cssVar,
    cssVarName,
    styleVariants
  };
  const runBeforeRenderingHooks = async (key) => {
    await runHooks(key, runHooksContext, async ({ hookFn, plugin }) => {
      await hookFn({
        ...baseContext,
        addStyles: (styles) => blockStyles.push({ pluginName: plugin.name, styles }),
        addGutterElement: (gutterElement) => {
          if (!gutterElement || typeof gutterElement !== "object")
            throw newTypeError("object", gutterElement, "gutterElement");
          if (typeof gutterElement.renderLine !== "function")
            throw newTypeError('"function" type', typeof gutterElement.renderLine, "gutterElement.renderLine");
          if (gutterElement.renderPhase && AnnotationRenderPhaseOrder.indexOf(gutterElement.renderPhase) === -1)
            throw newTypeError("AnnotationRenderPhase", gutterElement.renderPhase, "gutterElement.renderPhase");
          gutterElements.push({ pluginName: plugin.name, gutterElement });
        }
      });
    });
  };
  state.canEditCode = false;
  await runBeforeRenderingHooks("preprocessLanguage");
  state.canEditLanguage = false;
  applyDefaultProps(codeBlock, config);
  await runBeforeRenderingHooks("preprocessMetadata");
  state.canEditCode = true;
  await runBeforeRenderingHooks("preprocessCode");
  await runBeforeRenderingHooks("performSyntaxAnalysis");
  await runBeforeRenderingHooks("postprocessAnalyzedCode");
  state.canEditCode = false;
  await runBeforeRenderingHooks("annotateCode");
  await runBeforeRenderingHooks("postprocessAnnotations");
  state.canEditMetadata = false;
  state.canEditAnnotations = false;
  const lines = codeBlock.getLines();
  const renderedAstLines = [];
  const renderEmptyLine = getRenderEmptyLineFn({ gutterElements, ...baseContext });
  const { wrap = false, preserveIndent = true, hangingIndent = 0 } = codeBlock.props;
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    const lineRenderData = {
      lineAst: renderLineToAst({ line, lineIndex, gutterElements, ...baseContext })
    };
    if (wrap && (preserveIndent || hangingIndent > 0)) {
      const baseIndent = preserveIndent ? line.text.match(/^\s*/)?.[0].length ?? 0 : 0;
      const indent = baseIndent + hangingIndent;
      if (indent > 0)
        setInlineStyle(lineRenderData.lineAst, "--ecIndent", `${indent}ch`);
    }
    await runHooks("postprocessRenderedLine", runHooksContext, async ({ hookFn, plugin }) => {
      await hookFn({
        ...baseContext,
        addStyles: (styles) => blockStyles.push({ pluginName: plugin.name, styles }),
        line,
        lineIndex,
        renderData: lineRenderData,
        renderEmptyLine
      });
      if (!isHastElement(lineRenderData.lineAst)) {
        throw newTypeError("hast Element", lineRenderData.lineAst, "lineAst");
      }
    });
    renderedAstLines.push(lineRenderData.lineAst);
  }
  const blockRenderData = {
    blockAst: buildCodeBlockAstFromRenderedLines(codeBlock, renderedAstLines)
  };
  await runHooks("postprocessRenderedBlock", runHooksContext, async ({ hookFn, plugin }) => {
    await hookFn({
      ...baseContext,
      addStyles: (styles) => blockStyles.push({ pluginName: plugin.name, styles }),
      renderData: blockRenderData,
      renderEmptyLine
    });
    if (!isHastElement(blockRenderData.blockAst)) {
      throw newTypeError("hast Element", blockRenderData.blockAst, "blockAst");
    }
  });
  return {
    renderedBlockAst: blockRenderData.blockAst,
    blockStyles
  };
}
function buildCodeBlockAstFromRenderedLines(codeBlock, renderedLines) {
  const preProperties = { dataLanguage: codeBlock.language || "plaintext" };
  const preElement = h("pre", preProperties, h("code", renderedLines));
  if (codeBlock.props.wrap) {
    const maxLineLength = codeBlock.getLines().reduce((max, line) => Math.max(max, line.text.length), 0);
    addClassName(preElement, "wrap");
    setInlineStyle(preElement, "--ecMaxLine", `${maxLineLength}ch`);
  }
  return preElement;
}
function applyDefaultProps(codeBlock, config) {
  const { overridesByLang = {}, ...baseDefaults } = config.defaultProps;
  const mergedDefaults = { ...baseDefaults };
  Object.keys(overridesByLang).forEach((key) => {
    const langs = key.split(",").map((lang) => lang.trim());
    if (langs.includes(codeBlock.language)) {
      Object.assign(mergedDefaults, overridesByLang[key]);
    }
  });
  const defaultKeys = Object.keys(mergedDefaults);
  const undefinedValueKeys = defaultKeys.filter((key) => codeBlock.props[key] === void 0);
  Object.assign(codeBlock.props, Object.fromEntries(undefinedValueKeys.map((key) => [key, mergedDefaults[key]])));
}
function validateExpressiveCodeProcessingState(state) {
  const isValid = state && // Expect all properties to be defined and booleans
  isBoolean(state.canEditCode) && isBoolean(state.canEditLanguage) && isBoolean(state.canEditMetadata) && isBoolean(state.canEditAnnotations);
  if (!isValid)
    throw newTypeError("ExpressiveCodeProcessingState", state);
}

// src/internal/ranges.ts
function getAbsoluteRange({
  start,
  end,
  rangeMax
}) {
  start = Math.min(start ?? 0, rangeMax);
  end = Math.min(end ?? rangeMax, rangeMax);
  if (start < 0)
    start = Math.max(start + rangeMax, 0);
  if (end < 0)
    end = Math.max(end + rangeMax, 0);
  return [start, end];
}

// src/common/line.ts
var ExpressiveCodeLine = class {
  constructor(text) {
    if (typeof text !== "string")
      throw new Error(`Expected code line text to be a string, but got ${JSON.stringify(text)}.`);
    this.#text = text;
  }
  #text;
  get text() {
    return this.#text;
  }
  #parent;
  get parent() {
    return this.#parent;
  }
  set parent(value) {
    if (!(value instanceof ExpressiveCodeBlock))
      throw new Error("When setting the parent of a code line, you must specify a valid code block instance.");
    if (this.#parent) {
      if (this.#parent === value)
        return;
      throw new Error(`You cannot change the parent of a code line after it has been added to a code block.`);
    }
    this.#parent = value;
  }
  #annotations = [];
  getAnnotations() {
    const matchingAnnotations = this.#annotations.filter((annotation) => !!annotation);
    return Object.freeze(matchingAnnotations);
  }
  addAnnotation(annotation) {
    validateExpressiveCodeAnnotation(annotation);
    if (this.#parent?.state?.canEditAnnotations === false)
      throw new Error("Cannot edit code line annotations in the current state.");
    this.#annotations.push(annotation);
  }
  deleteAnnotation(annotation) {
    validateExpressiveCodeAnnotation(annotation);
    if (this.#parent?.state?.canEditAnnotations === false)
      throw new Error("Cannot edit code line annotations in the current state.");
    const index = this.#annotations.indexOf(annotation);
    if (index === -1)
      throw new Error(
        `Failed to delete annotation as it was not found (name=${JSON.stringify(annotation.constructor.name)}, inlineRange=${JSON.stringify(annotation.inlineRange)})`
      );
    this.#annotations.splice(index, 1);
  }
  editText(columnStart, columnEnd, newText) {
    if (columnStart !== void 0 && !isNumber(columnStart))
      throw newTypeError("number", columnStart);
    if (columnEnd !== void 0 && !isNumber(columnEnd))
      throw newTypeError("number", columnEnd);
    if (!isString(newText))
      throw newTypeError("string", newText);
    if (this.#parent?.state?.canEditCode === false)
      throw new Error("Cannot edit code line text in the current state.");
    const [editStart, editEnd] = getAbsoluteRange({ start: columnStart, end: columnEnd, rangeMax: this.#text.length });
    const editDelta = newText.length - (editEnd - editStart);
    for (let index = this.#annotations.length - 1; index >= 0; index--) {
      const annotation = this.#annotations[index];
      if (!annotation.inlineRange)
        continue;
      const { columnStart: annotationStart, columnEnd: annotationEnd } = annotation.inlineRange;
      if (annotationEnd < editStart)
        continue;
      if (annotationStart > editEnd) {
        annotation.inlineRange.columnStart += editDelta;
        annotation.inlineRange.columnEnd += editDelta;
        continue;
      }
      if (editStart >= annotationStart && editEnd <= annotationEnd) {
        annotation.inlineRange.columnEnd += editDelta;
        continue;
      }
      if (editStart <= annotationStart && editEnd >= annotationEnd) {
        this.#annotations.splice(index, 1);
        continue;
      }
      if (editStart > annotationStart) {
        annotation.inlineRange.columnEnd = editStart;
      } else {
        annotation.inlineRange.columnStart = editEnd + editDelta;
        annotation.inlineRange.columnEnd += editDelta;
      }
    }
    this.#text = this.text.slice(0, editStart) + newText + this.text.slice(editEnd);
    return this.text;
  }
};
function validateExpressiveCodeInlineRange(inlineRange) {
  if (!isNumber(inlineRange.columnStart) || !isNumber(inlineRange.columnEnd))
    throw newTypeError("ExpressiveCodeAnnotation", inlineRange, "inlineRange");
}
function validateExpressiveCodeAnnotation(annotation) {
  if (typeof annotation?.render !== "function")
    throw newTypeError("ExpressiveCodeAnnotation", annotation?.render, "render");
  if (annotation.inlineRange)
    validateExpressiveCodeInlineRange(annotation.inlineRange);
}

// src/common/block.ts
var ExpressiveCodeBlock = class {
  constructor(options) {
    const { code, language, meta = "", props, locale, parentDocument } = options;
    if (!isString(code) || !isString(language) || !isString(meta))
      throw newTypeError("object of type ExpressiveCodeBlockOptions", options);
    this.#lines = [];
    this.#language = language;
    this.#meta = meta;
    this.#metaOptions = new MetaOptions(meta);
    this.#props = props || {};
    this.#locale = locale;
    this.#parentDocument = parentDocument;
    const lines = code.split(/\r?\n/).map((line) => line.trimEnd());
    while (lines.length && !lines[0].length)
      lines.shift();
    while (lines.length && !lines[lines.length - 1].length)
      lines.pop();
    if (lines.length)
      this.insertLines(0, lines);
    this.props.wrap = this.metaOptions.getBoolean("wrap") ?? this.props.wrap;
    this.props.preserveIndent = this.metaOptions.getBoolean("preserveIndent") ?? this.props.preserveIndent;
    this.props.hangingIndent = this.metaOptions.getInteger("hangingIndent") ?? this.props.hangingIndent;
  }
  /**
   * This field exists to ensure that only actual class instances are accepted
   * as the type `ExpressiveCodeBlock` by TypeScript. Without this workaround,
   * plain objects with the same structure would be accepted, but fail at runtime.
   */
  _requireInstance = Symbol("ExpressiveCodeBlock");
  #lines;
  #language;
  #meta;
  #metaOptions;
  #props;
  #locale;
  #parentDocument;
  #state;
  /**
   * Provides read-only access to the code block's plaintext contents.
   */
  get code() {
    return this.#lines.map((line) => line.text).join("\n");
  }
  get language() {
    return this.#language;
  }
  /**
   * Allows getting and setting the code block's language.
   *
   * Setting this property may throw an error if not allowed in the current {@link state}.
   */
  set language(value) {
    if (this.#state?.canEditLanguage === false)
      throw new Error('Cannot edit code block property "language" in the current state.');
    this.#language = value;
  }
  get meta() {
    return this.#meta;
  }
  /**
   * Allows getting or setting the code block's meta string. In markdown or MDX documents,
   * this is the part of the code block's opening fence that comes after the language name.
   *
   * Setting this property may throw an error if not allowed in the current {@link state}.
   */
  set meta(value) {
    if (this.#state?.canEditMetadata === false)
      throw new Error('Cannot edit code block property "meta" in the current state.');
    this.#meta = value;
    this.#metaOptions = new MetaOptions(value);
  }
  /**
   * Provides read-only access to the parsed version of the block's {@link meta} string.
   */
  get metaOptions() {
    return this.#metaOptions;
  }
  /**
   * Provides access to the code block's props.
   *
   * To allow users to set these props through the meta string, plugins can use the
   * `preprocessMetadata` hook to read `metaOptions` and update their props accordingly.
   *
   * Props can be modified until rendering starts and become read-only afterwards.
   */
  get props() {
    if (this.#state?.canEditMetadata === false) {
      return Object.freeze({ ...this.#props });
    }
    return this.#props;
  }
  /**
   * Allows getting the code block's locale (e.g. `en-US` or `de-DE`). It is used by plugins
   * to display localized strings depending on the language of the containing page.
   *
   * Integrations like `rehype-expressive-code` support multi-language sites by allowing you
   * to provide custom logic to determine a block's locale (e.g. based on its parent document).
   *
   * If no locale is defined here, `ExpressiveCodeEngine` will render the code block
   * using the `defaultLocale` provided in its configuration.
   */
  get locale() {
    return this.#locale;
  }
  /**
   * Provides read-only access to optional data about the parent document
   * the code block is located in.
   *
   * Integrations like `rehype-expressive-code` can provide this information based on
   * the source document being processed. There may be cases where no document is available,
   * e.g. when the code block was created dynamically.
   */
  get parentDocument() {
    return this.#parentDocument;
  }
  /**
   * Provides read-only access to the code block's processing state.
   *
   * The processing state controls which properties of the code block can be modified.
   * The engine updates it automatically during rendering.
   */
  get state() {
    if (this.#state) {
      const result = { ...this.#state };
      Object.freeze(result);
      return result;
    }
  }
  /**
   * @internal
   */
  set state(value) {
    validateExpressiveCodeProcessingState(value);
    if (this.#state) {
      if (this.#state === value)
        return;
      throw new Error(`You cannot change the state object of a code block after assigning it once.`);
    }
    this.#state = value;
  }
  /**
   * Returns the line at the given index, or `undefined` if the index is out of range.
   */
  getLine(index) {
    if (!isNumber(index) || index < 0)
      throw new Error("Line index must be a non-negative number.");
    return this.getLines(index, index + 1)[0];
  }
  /**
   * Returns a readonly array of lines starting at the given index and ending before
   * the given index (exclusive). The indices support the same syntax as JavaScript’s
   * `Array.slice` method.
   */
  getLines(startIndex, endIndex) {
    return Object.freeze(this.#lines.slice(startIndex, endIndex));
  }
  /**
   * Deletes the line at the given index.
   *
   * May throw an error if not allowed in the current {@link state}.
   */
  deleteLine(index) {
    this.deleteLines([index]);
  }
  /**
   * Deletes the lines at the given indices.
   *
   * This function automatically sorts the indices in descending order before deleting the lines,
   * so you do not need to worry about indices shifting after deleting a line.
   *
   * May throw an error if not allowed in the current {@link state}.
   */
  deleteLines(indices) {
    if (!Array.isArray(indices) || indices.length === 0 || indices.some((index) => !isNumber(index) || index < 0))
      throw newTypeError("non-empty non-negative number[]", indices);
    if (this.#state?.canEditCode === false)
      throw new Error("Cannot delete code block lines in the current state.");
    const sorted = [...indices].sort((a, b) => b - a);
    let lastIndex;
    sorted.forEach((index) => {
      if (lastIndex === index)
        throw new Error(`A batch of lines to delete cannot contain the same index twice. Given indices: ${JSON.stringify(indices)}`);
      lastIndex = index;
      const isValidIndex = index >= 0 && index < this.#lines.length;
      if (!isValidIndex)
        throw new Error(`Cannot delete invalid index ${JSON.stringify(index)} from line array (length=${this.#lines.length}). Given indices: ${JSON.stringify(indices)}`);
      this.#lines.splice(index, 1);
    });
  }
  /**
   * Inserts a new line at the given index.
   *
   * May throw an error if not allowed in the current {@link state}.
   */
  insertLine(index, textLine) {
    return this.insertLines(index, [textLine])[0];
  }
  /**
   * Inserts multiple new lines at the given index.
   *
   * May throw an error if not allowed in the current {@link state}.
   */
  insertLines(index, textLines) {
    if (!isNumber(index) || index < 0)
      throw newTypeError("non-negative number", index);
    if (!Array.isArray(textLines) || textLines.length === 0 || textLines.some((textLine) => !isString(textLine)))
      throw newTypeError("non-empty string[]", textLines);
    if (this.#state?.canEditCode === false)
      throw new Error("Cannot insert code block lines in the current state.");
    const isValidIndex = index >= 0 && index <= this.#lines.length;
    if (!isValidIndex)
      throw new Error(`Cannot insert at invalid index ${JSON.stringify(index)} into line array (length=${this.#lines.length}).`);
    const lineInstances = textLines.map((text) => {
      const line = new ExpressiveCodeLine(text);
      line.parent = this;
      return line;
    });
    this.#lines.splice(index, 0, ...lineInstances);
    return lineInstances;
  }
};

// ../../../node_modules/.pnpm/@shikijs+themes@3.2.2/node_modules/@shikijs/themes/dist/github-dark.mjs
var github_dark_default = Object.freeze(JSON.parse('{"colors":{"activityBar.activeBorder":"#f9826c","activityBar.background":"#24292e","activityBar.border":"#1b1f23","activityBar.foreground":"#e1e4e8","activityBar.inactiveForeground":"#6a737d","activityBarBadge.background":"#0366d6","activityBarBadge.foreground":"#fff","badge.background":"#044289","badge.foreground":"#c8e1ff","breadcrumb.activeSelectionForeground":"#d1d5da","breadcrumb.focusForeground":"#e1e4e8","breadcrumb.foreground":"#959da5","breadcrumbPicker.background":"#2b3036","button.background":"#176f2c","button.foreground":"#dcffe4","button.hoverBackground":"#22863a","button.secondaryBackground":"#444d56","button.secondaryForeground":"#fff","button.secondaryHoverBackground":"#586069","checkbox.background":"#444d56","checkbox.border":"#1b1f23","debugToolBar.background":"#2b3036","descriptionForeground":"#959da5","diffEditor.insertedTextBackground":"#28a74530","diffEditor.removedTextBackground":"#d73a4930","dropdown.background":"#2f363d","dropdown.border":"#1b1f23","dropdown.foreground":"#e1e4e8","dropdown.listBackground":"#24292e","editor.background":"#24292e","editor.findMatchBackground":"#ffd33d44","editor.findMatchHighlightBackground":"#ffd33d22","editor.focusedStackFrameHighlightBackground":"#2b6a3033","editor.foldBackground":"#58606915","editor.foreground":"#e1e4e8","editor.inactiveSelectionBackground":"#3392FF22","editor.lineHighlightBackground":"#2b3036","editor.linkedEditingBackground":"#3392FF22","editor.selectionBackground":"#3392FF44","editor.selectionHighlightBackground":"#17E5E633","editor.selectionHighlightBorder":"#17E5E600","editor.stackFrameHighlightBackground":"#C6902625","editor.wordHighlightBackground":"#17E5E600","editor.wordHighlightBorder":"#17E5E699","editor.wordHighlightStrongBackground":"#17E5E600","editor.wordHighlightStrongBorder":"#17E5E666","editorBracketHighlight.foreground1":"#79b8ff","editorBracketHighlight.foreground2":"#ffab70","editorBracketHighlight.foreground3":"#b392f0","editorBracketHighlight.foreground4":"#79b8ff","editorBracketHighlight.foreground5":"#ffab70","editorBracketHighlight.foreground6":"#b392f0","editorBracketMatch.background":"#17E5E650","editorBracketMatch.border":"#17E5E600","editorCursor.foreground":"#c8e1ff","editorError.foreground":"#f97583","editorGroup.border":"#1b1f23","editorGroupHeader.tabsBackground":"#1f2428","editorGroupHeader.tabsBorder":"#1b1f23","editorGutter.addedBackground":"#28a745","editorGutter.deletedBackground":"#ea4a5a","editorGutter.modifiedBackground":"#2188ff","editorIndentGuide.activeBackground":"#444d56","editorIndentGuide.background":"#2f363d","editorLineNumber.activeForeground":"#e1e4e8","editorLineNumber.foreground":"#444d56","editorOverviewRuler.border":"#1b1f23","editorWarning.foreground":"#ffea7f","editorWhitespace.foreground":"#444d56","editorWidget.background":"#1f2428","errorForeground":"#f97583","focusBorder":"#005cc5","foreground":"#d1d5da","gitDecoration.addedResourceForeground":"#34d058","gitDecoration.conflictingResourceForeground":"#ffab70","gitDecoration.deletedResourceForeground":"#ea4a5a","gitDecoration.ignoredResourceForeground":"#6a737d","gitDecoration.modifiedResourceForeground":"#79b8ff","gitDecoration.submoduleResourceForeground":"#6a737d","gitDecoration.untrackedResourceForeground":"#34d058","input.background":"#2f363d","input.border":"#1b1f23","input.foreground":"#e1e4e8","input.placeholderForeground":"#959da5","list.activeSelectionBackground":"#39414a","list.activeSelectionForeground":"#e1e4e8","list.focusBackground":"#044289","list.hoverBackground":"#282e34","list.hoverForeground":"#e1e4e8","list.inactiveFocusBackground":"#1d2d3e","list.inactiveSelectionBackground":"#282e34","list.inactiveSelectionForeground":"#e1e4e8","notificationCenterHeader.background":"#24292e","notificationCenterHeader.foreground":"#959da5","notifications.background":"#2f363d","notifications.border":"#1b1f23","notifications.foreground":"#e1e4e8","notificationsErrorIcon.foreground":"#ea4a5a","notificationsInfoIcon.foreground":"#79b8ff","notificationsWarningIcon.foreground":"#ffab70","panel.background":"#1f2428","panel.border":"#1b1f23","panelInput.border":"#2f363d","panelTitle.activeBorder":"#f9826c","panelTitle.activeForeground":"#e1e4e8","panelTitle.inactiveForeground":"#959da5","peekViewEditor.background":"#1f242888","peekViewEditor.matchHighlightBackground":"#ffd33d33","peekViewResult.background":"#1f2428","peekViewResult.matchHighlightBackground":"#ffd33d33","pickerGroup.border":"#444d56","pickerGroup.foreground":"#e1e4e8","progressBar.background":"#0366d6","quickInput.background":"#24292e","quickInput.foreground":"#e1e4e8","scrollbar.shadow":"#0008","scrollbarSlider.activeBackground":"#6a737d88","scrollbarSlider.background":"#6a737d33","scrollbarSlider.hoverBackground":"#6a737d44","settings.headerForeground":"#e1e4e8","settings.modifiedItemIndicator":"#0366d6","sideBar.background":"#1f2428","sideBar.border":"#1b1f23","sideBar.foreground":"#d1d5da","sideBarSectionHeader.background":"#1f2428","sideBarSectionHeader.border":"#1b1f23","sideBarSectionHeader.foreground":"#e1e4e8","sideBarTitle.foreground":"#e1e4e8","statusBar.background":"#24292e","statusBar.border":"#1b1f23","statusBar.debuggingBackground":"#931c06","statusBar.debuggingForeground":"#fff","statusBar.foreground":"#d1d5da","statusBar.noFolderBackground":"#24292e","statusBarItem.prominentBackground":"#282e34","statusBarItem.remoteBackground":"#24292e","statusBarItem.remoteForeground":"#d1d5da","tab.activeBackground":"#24292e","tab.activeBorder":"#24292e","tab.activeBorderTop":"#f9826c","tab.activeForeground":"#e1e4e8","tab.border":"#1b1f23","tab.hoverBackground":"#24292e","tab.inactiveBackground":"#1f2428","tab.inactiveForeground":"#959da5","tab.unfocusedActiveBorder":"#24292e","tab.unfocusedActiveBorderTop":"#1b1f23","tab.unfocusedHoverBackground":"#24292e","terminal.ansiBlack":"#586069","terminal.ansiBlue":"#2188ff","terminal.ansiBrightBlack":"#959da5","terminal.ansiBrightBlue":"#79b8ff","terminal.ansiBrightCyan":"#56d4dd","terminal.ansiBrightGreen":"#85e89d","terminal.ansiBrightMagenta":"#b392f0","terminal.ansiBrightRed":"#f97583","terminal.ansiBrightWhite":"#fafbfc","terminal.ansiBrightYellow":"#ffea7f","terminal.ansiCyan":"#39c5cf","terminal.ansiGreen":"#34d058","terminal.ansiMagenta":"#b392f0","terminal.ansiRed":"#ea4a5a","terminal.ansiWhite":"#d1d5da","terminal.ansiYellow":"#ffea7f","terminal.foreground":"#d1d5da","terminal.tab.activeBorder":"#f9826c","terminalCursor.background":"#586069","terminalCursor.foreground":"#79b8ff","textBlockQuote.background":"#24292e","textBlockQuote.border":"#444d56","textCodeBlock.background":"#2f363d","textLink.activeForeground":"#c8e1ff","textLink.foreground":"#79b8ff","textPreformat.foreground":"#d1d5da","textSeparator.foreground":"#586069","titleBar.activeBackground":"#24292e","titleBar.activeForeground":"#e1e4e8","titleBar.border":"#1b1f23","titleBar.inactiveBackground":"#1f2428","titleBar.inactiveForeground":"#959da5","tree.indentGuidesStroke":"#2f363d","welcomePage.buttonBackground":"#2f363d","welcomePage.buttonHoverBackground":"#444d56"},"displayName":"GitHub Dark","name":"github-dark","semanticHighlighting":true,"tokenColors":[{"scope":["comment","punctuation.definition.comment","string.comment"],"settings":{"foreground":"#6a737d"}},{"scope":["constant","entity.name.constant","variable.other.constant","variable.other.enummember","variable.language"],"settings":{"foreground":"#79b8ff"}},{"scope":["entity","entity.name"],"settings":{"foreground":"#b392f0"}},{"scope":"variable.parameter.function","settings":{"foreground":"#e1e4e8"}},{"scope":"entity.name.tag","settings":{"foreground":"#85e89d"}},{"scope":"keyword","settings":{"foreground":"#f97583"}},{"scope":["storage","storage.type"],"settings":{"foreground":"#f97583"}},{"scope":["storage.modifier.package","storage.modifier.import","storage.type.java"],"settings":{"foreground":"#e1e4e8"}},{"scope":["string","punctuation.definition.string","string punctuation.section.embedded source"],"settings":{"foreground":"#9ecbff"}},{"scope":"support","settings":{"foreground":"#79b8ff"}},{"scope":"meta.property-name","settings":{"foreground":"#79b8ff"}},{"scope":"variable","settings":{"foreground":"#ffab70"}},{"scope":"variable.other","settings":{"foreground":"#e1e4e8"}},{"scope":"invalid.broken","settings":{"fontStyle":"italic","foreground":"#fdaeb7"}},{"scope":"invalid.deprecated","settings":{"fontStyle":"italic","foreground":"#fdaeb7"}},{"scope":"invalid.illegal","settings":{"fontStyle":"italic","foreground":"#fdaeb7"}},{"scope":"invalid.unimplemented","settings":{"fontStyle":"italic","foreground":"#fdaeb7"}},{"scope":"carriage-return","settings":{"background":"#f97583","content":"^M","fontStyle":"italic underline","foreground":"#24292e"}},{"scope":"message.error","settings":{"foreground":"#fdaeb7"}},{"scope":"string variable","settings":{"foreground":"#79b8ff"}},{"scope":["source.regexp","string.regexp"],"settings":{"foreground":"#dbedff"}},{"scope":["string.regexp.character-class","string.regexp constant.character.escape","string.regexp source.ruby.embedded","string.regexp string.regexp.arbitrary-repitition"],"settings":{"foreground":"#dbedff"}},{"scope":"string.regexp constant.character.escape","settings":{"fontStyle":"bold","foreground":"#85e89d"}},{"scope":"support.constant","settings":{"foreground":"#79b8ff"}},{"scope":"support.variable","settings":{"foreground":"#79b8ff"}},{"scope":"meta.module-reference","settings":{"foreground":"#79b8ff"}},{"scope":"punctuation.definition.list.begin.markdown","settings":{"foreground":"#ffab70"}},{"scope":["markup.heading","markup.heading entity.name"],"settings":{"fontStyle":"bold","foreground":"#79b8ff"}},{"scope":"markup.quote","settings":{"foreground":"#85e89d"}},{"scope":"markup.italic","settings":{"fontStyle":"italic","foreground":"#e1e4e8"}},{"scope":"markup.bold","settings":{"fontStyle":"bold","foreground":"#e1e4e8"}},{"scope":["markup.underline"],"settings":{"fontStyle":"underline"}},{"scope":["markup.strikethrough"],"settings":{"fontStyle":"strikethrough"}},{"scope":"markup.inline.raw","settings":{"foreground":"#79b8ff"}},{"scope":["markup.deleted","meta.diff.header.from-file","punctuation.definition.deleted"],"settings":{"background":"#86181d","foreground":"#fdaeb7"}},{"scope":["markup.inserted","meta.diff.header.to-file","punctuation.definition.inserted"],"settings":{"background":"#144620","foreground":"#85e89d"}},{"scope":["markup.changed","punctuation.definition.changed"],"settings":{"background":"#c24e00","foreground":"#ffab70"}},{"scope":["markup.ignored","markup.untracked"],"settings":{"background":"#79b8ff","foreground":"#2f363d"}},{"scope":"meta.diff.range","settings":{"fontStyle":"bold","foreground":"#b392f0"}},{"scope":"meta.diff.header","settings":{"foreground":"#79b8ff"}},{"scope":"meta.separator","settings":{"fontStyle":"bold","foreground":"#79b8ff"}},{"scope":"meta.output","settings":{"foreground":"#79b8ff"}},{"scope":["brackethighlighter.tag","brackethighlighter.curly","brackethighlighter.round","brackethighlighter.square","brackethighlighter.angle","brackethighlighter.quote"],"settings":{"foreground":"#d1d5da"}},{"scope":"brackethighlighter.unmatched","settings":{"foreground":"#fdaeb7"}},{"scope":["constant.other.reference.link","string.other.link"],"settings":{"fontStyle":"underline","foreground":"#dbedff"}}],"type":"dark"}'));

// ../../../node_modules/.pnpm/@shikijs+themes@3.2.2/node_modules/@shikijs/themes/dist/github-light.mjs
var github_light_default = Object.freeze(JSON.parse('{"colors":{"activityBar.activeBorder":"#f9826c","activityBar.background":"#fff","activityBar.border":"#e1e4e8","activityBar.foreground":"#2f363d","activityBar.inactiveForeground":"#959da5","activityBarBadge.background":"#2188ff","activityBarBadge.foreground":"#fff","badge.background":"#dbedff","badge.foreground":"#005cc5","breadcrumb.activeSelectionForeground":"#586069","breadcrumb.focusForeground":"#2f363d","breadcrumb.foreground":"#6a737d","breadcrumbPicker.background":"#fafbfc","button.background":"#159739","button.foreground":"#fff","button.hoverBackground":"#138934","button.secondaryBackground":"#e1e4e8","button.secondaryForeground":"#1b1f23","button.secondaryHoverBackground":"#d1d5da","checkbox.background":"#fafbfc","checkbox.border":"#d1d5da","debugToolBar.background":"#fff","descriptionForeground":"#6a737d","diffEditor.insertedTextBackground":"#34d05822","diffEditor.removedTextBackground":"#d73a4922","dropdown.background":"#fafbfc","dropdown.border":"#e1e4e8","dropdown.foreground":"#2f363d","dropdown.listBackground":"#fff","editor.background":"#fff","editor.findMatchBackground":"#ffdf5d","editor.findMatchHighlightBackground":"#ffdf5d66","editor.focusedStackFrameHighlightBackground":"#28a74525","editor.foldBackground":"#d1d5da11","editor.foreground":"#24292e","editor.inactiveSelectionBackground":"#0366d611","editor.lineHighlightBackground":"#f6f8fa","editor.linkedEditingBackground":"#0366d611","editor.selectionBackground":"#0366d625","editor.selectionHighlightBackground":"#34d05840","editor.selectionHighlightBorder":"#34d05800","editor.stackFrameHighlightBackground":"#ffd33d33","editor.wordHighlightBackground":"#34d05800","editor.wordHighlightBorder":"#24943e99","editor.wordHighlightStrongBackground":"#34d05800","editor.wordHighlightStrongBorder":"#24943e50","editorBracketHighlight.foreground1":"#005cc5","editorBracketHighlight.foreground2":"#e36209","editorBracketHighlight.foreground3":"#5a32a3","editorBracketHighlight.foreground4":"#005cc5","editorBracketHighlight.foreground5":"#e36209","editorBracketHighlight.foreground6":"#5a32a3","editorBracketMatch.background":"#34d05840","editorBracketMatch.border":"#34d05800","editorCursor.foreground":"#044289","editorError.foreground":"#cb2431","editorGroup.border":"#e1e4e8","editorGroupHeader.tabsBackground":"#f6f8fa","editorGroupHeader.tabsBorder":"#e1e4e8","editorGutter.addedBackground":"#28a745","editorGutter.deletedBackground":"#d73a49","editorGutter.modifiedBackground":"#2188ff","editorIndentGuide.activeBackground":"#d7dbe0","editorIndentGuide.background":"#eff2f6","editorLineNumber.activeForeground":"#24292e","editorLineNumber.foreground":"#1b1f234d","editorOverviewRuler.border":"#fff","editorWarning.foreground":"#f9c513","editorWhitespace.foreground":"#d1d5da","editorWidget.background":"#f6f8fa","errorForeground":"#cb2431","focusBorder":"#2188ff","foreground":"#444d56","gitDecoration.addedResourceForeground":"#28a745","gitDecoration.conflictingResourceForeground":"#e36209","gitDecoration.deletedResourceForeground":"#d73a49","gitDecoration.ignoredResourceForeground":"#959da5","gitDecoration.modifiedResourceForeground":"#005cc5","gitDecoration.submoduleResourceForeground":"#959da5","gitDecoration.untrackedResourceForeground":"#28a745","input.background":"#fafbfc","input.border":"#e1e4e8","input.foreground":"#2f363d","input.placeholderForeground":"#959da5","list.activeSelectionBackground":"#e2e5e9","list.activeSelectionForeground":"#2f363d","list.focusBackground":"#cce5ff","list.hoverBackground":"#ebf0f4","list.hoverForeground":"#2f363d","list.inactiveFocusBackground":"#dbedff","list.inactiveSelectionBackground":"#e8eaed","list.inactiveSelectionForeground":"#2f363d","notificationCenterHeader.background":"#e1e4e8","notificationCenterHeader.foreground":"#6a737d","notifications.background":"#fafbfc","notifications.border":"#e1e4e8","notifications.foreground":"#2f363d","notificationsErrorIcon.foreground":"#d73a49","notificationsInfoIcon.foreground":"#005cc5","notificationsWarningIcon.foreground":"#e36209","panel.background":"#f6f8fa","panel.border":"#e1e4e8","panelInput.border":"#e1e4e8","panelTitle.activeBorder":"#f9826c","panelTitle.activeForeground":"#2f363d","panelTitle.inactiveForeground":"#6a737d","pickerGroup.border":"#e1e4e8","pickerGroup.foreground":"#2f363d","progressBar.background":"#2188ff","quickInput.background":"#fafbfc","quickInput.foreground":"#2f363d","scrollbar.shadow":"#6a737d33","scrollbarSlider.activeBackground":"#959da588","scrollbarSlider.background":"#959da533","scrollbarSlider.hoverBackground":"#959da544","settings.headerForeground":"#2f363d","settings.modifiedItemIndicator":"#2188ff","sideBar.background":"#f6f8fa","sideBar.border":"#e1e4e8","sideBar.foreground":"#586069","sideBarSectionHeader.background":"#f6f8fa","sideBarSectionHeader.border":"#e1e4e8","sideBarSectionHeader.foreground":"#2f363d","sideBarTitle.foreground":"#2f363d","statusBar.background":"#fff","statusBar.border":"#e1e4e8","statusBar.debuggingBackground":"#f9826c","statusBar.debuggingForeground":"#fff","statusBar.foreground":"#586069","statusBar.noFolderBackground":"#fff","statusBarItem.prominentBackground":"#e8eaed","statusBarItem.remoteBackground":"#fff","statusBarItem.remoteForeground":"#586069","tab.activeBackground":"#fff","tab.activeBorder":"#fff","tab.activeBorderTop":"#f9826c","tab.activeForeground":"#2f363d","tab.border":"#e1e4e8","tab.hoverBackground":"#fff","tab.inactiveBackground":"#f6f8fa","tab.inactiveForeground":"#6a737d","tab.unfocusedActiveBorder":"#fff","tab.unfocusedActiveBorderTop":"#e1e4e8","tab.unfocusedHoverBackground":"#fff","terminal.ansiBlack":"#24292e","terminal.ansiBlue":"#0366d6","terminal.ansiBrightBlack":"#959da5","terminal.ansiBrightBlue":"#005cc5","terminal.ansiBrightCyan":"#3192aa","terminal.ansiBrightGreen":"#22863a","terminal.ansiBrightMagenta":"#5a32a3","terminal.ansiBrightRed":"#cb2431","terminal.ansiBrightWhite":"#d1d5da","terminal.ansiBrightYellow":"#b08800","terminal.ansiCyan":"#1b7c83","terminal.ansiGreen":"#28a745","terminal.ansiMagenta":"#5a32a3","terminal.ansiRed":"#d73a49","terminal.ansiWhite":"#6a737d","terminal.ansiYellow":"#dbab09","terminal.foreground":"#586069","terminal.tab.activeBorder":"#f9826c","terminalCursor.background":"#d1d5da","terminalCursor.foreground":"#005cc5","textBlockQuote.background":"#fafbfc","textBlockQuote.border":"#e1e4e8","textCodeBlock.background":"#f6f8fa","textLink.activeForeground":"#005cc5","textLink.foreground":"#0366d6","textPreformat.foreground":"#586069","textSeparator.foreground":"#d1d5da","titleBar.activeBackground":"#fff","titleBar.activeForeground":"#2f363d","titleBar.border":"#e1e4e8","titleBar.inactiveBackground":"#f6f8fa","titleBar.inactiveForeground":"#6a737d","tree.indentGuidesStroke":"#e1e4e8","welcomePage.buttonBackground":"#f6f8fa","welcomePage.buttonHoverBackground":"#e1e4e8"},"displayName":"GitHub Light","name":"github-light","semanticHighlighting":true,"tokenColors":[{"scope":["comment","punctuation.definition.comment","string.comment"],"settings":{"foreground":"#6a737d"}},{"scope":["constant","entity.name.constant","variable.other.constant","variable.other.enummember","variable.language"],"settings":{"foreground":"#005cc5"}},{"scope":["entity","entity.name"],"settings":{"foreground":"#6f42c1"}},{"scope":"variable.parameter.function","settings":{"foreground":"#24292e"}},{"scope":"entity.name.tag","settings":{"foreground":"#22863a"}},{"scope":"keyword","settings":{"foreground":"#d73a49"}},{"scope":["storage","storage.type"],"settings":{"foreground":"#d73a49"}},{"scope":["storage.modifier.package","storage.modifier.import","storage.type.java"],"settings":{"foreground":"#24292e"}},{"scope":["string","punctuation.definition.string","string punctuation.section.embedded source"],"settings":{"foreground":"#032f62"}},{"scope":"support","settings":{"foreground":"#005cc5"}},{"scope":"meta.property-name","settings":{"foreground":"#005cc5"}},{"scope":"variable","settings":{"foreground":"#e36209"}},{"scope":"variable.other","settings":{"foreground":"#24292e"}},{"scope":"invalid.broken","settings":{"fontStyle":"italic","foreground":"#b31d28"}},{"scope":"invalid.deprecated","settings":{"fontStyle":"italic","foreground":"#b31d28"}},{"scope":"invalid.illegal","settings":{"fontStyle":"italic","foreground":"#b31d28"}},{"scope":"invalid.unimplemented","settings":{"fontStyle":"italic","foreground":"#b31d28"}},{"scope":"carriage-return","settings":{"background":"#d73a49","content":"^M","fontStyle":"italic underline","foreground":"#fafbfc"}},{"scope":"message.error","settings":{"foreground":"#b31d28"}},{"scope":"string variable","settings":{"foreground":"#005cc5"}},{"scope":["source.regexp","string.regexp"],"settings":{"foreground":"#032f62"}},{"scope":["string.regexp.character-class","string.regexp constant.character.escape","string.regexp source.ruby.embedded","string.regexp string.regexp.arbitrary-repitition"],"settings":{"foreground":"#032f62"}},{"scope":"string.regexp constant.character.escape","settings":{"fontStyle":"bold","foreground":"#22863a"}},{"scope":"support.constant","settings":{"foreground":"#005cc5"}},{"scope":"support.variable","settings":{"foreground":"#005cc5"}},{"scope":"meta.module-reference","settings":{"foreground":"#005cc5"}},{"scope":"punctuation.definition.list.begin.markdown","settings":{"foreground":"#e36209"}},{"scope":["markup.heading","markup.heading entity.name"],"settings":{"fontStyle":"bold","foreground":"#005cc5"}},{"scope":"markup.quote","settings":{"foreground":"#22863a"}},{"scope":"markup.italic","settings":{"fontStyle":"italic","foreground":"#24292e"}},{"scope":"markup.bold","settings":{"fontStyle":"bold","foreground":"#24292e"}},{"scope":["markup.underline"],"settings":{"fontStyle":"underline"}},{"scope":["markup.strikethrough"],"settings":{"fontStyle":"strikethrough"}},{"scope":"markup.inline.raw","settings":{"foreground":"#005cc5"}},{"scope":["markup.deleted","meta.diff.header.from-file","punctuation.definition.deleted"],"settings":{"background":"#ffeef0","foreground":"#b31d28"}},{"scope":["markup.inserted","meta.diff.header.to-file","punctuation.definition.inserted"],"settings":{"background":"#f0fff4","foreground":"#22863a"}},{"scope":["markup.changed","punctuation.definition.changed"],"settings":{"background":"#ffebda","foreground":"#e36209"}},{"scope":["markup.ignored","markup.untracked"],"settings":{"background":"#005cc5","foreground":"#f6f8fa"}},{"scope":"meta.diff.range","settings":{"fontStyle":"bold","foreground":"#6f42c1"}},{"scope":"meta.diff.header","settings":{"foreground":"#005cc5"}},{"scope":"meta.separator","settings":{"fontStyle":"bold","foreground":"#005cc5"}},{"scope":"meta.output","settings":{"foreground":"#005cc5"}},{"scope":["brackethighlighter.tag","brackethighlighter.curly","brackethighlighter.round","brackethighlighter.square","brackethighlighter.angle","brackethighlighter.quote"],"settings":{"foreground":"#586069"}},{"scope":"brackethighlighter.unmatched","settings":{"foreground":"#b31d28"}},{"scope":["constant.other.reference.link","string.other.link"],"settings":{"fontStyle":"underline","foreground":"#032f62"}}],"type":"light"}'));

// src/internal/render-group.ts
async function renderGroup({
  input,
  options,
  defaultLocale,
  config,
  plugins,
  cssVar,
  cssVarName,
  styleVariants
}) {
  const inputArray = Array.isArray(input) ? input : [input];
  const groupContents = inputArray.map((blockOrOptions) => {
    if (blockOrOptions instanceof ExpressiveCodeBlock) {
      return { codeBlock: blockOrOptions };
    } else {
      return { codeBlock: new ExpressiveCodeBlock(blockOrOptions) };
    }
  });
  Object.freeze(groupContents);
  options?.onInitGroup?.(groupContents);
  const renderedGroupContents = groupContents;
  const pluginStyles = [];
  for (const groupContent of renderedGroupContents) {
    const { renderedBlockAst, blockStyles } = await renderBlock({
      codeBlock: groupContent.codeBlock,
      groupContents,
      locale: groupContent.codeBlock.locale || defaultLocale,
      config,
      plugins,
      cssVar,
      cssVarName,
      styleVariants
    });
    groupContent.renderedBlockAst = renderedBlockAst;
    pluginStyles.push(...blockStyles);
  }
  const groupRenderData = {
    groupAst: buildGroupAstFromRenderedBlocks(renderedGroupContents.map(({ renderedBlockAst }) => renderedBlockAst))
  };
  const runHooksContext = {
    plugins,
    config
  };
  await runHooks("postprocessRenderedBlockGroup", runHooksContext, async ({ hookFn, plugin }) => {
    await hookFn({
      renderedGroupContents,
      pluginStyles,
      addStyles: (styles) => pluginStyles.push({ pluginName: plugin.name, styles }),
      renderData: groupRenderData
    });
    if (!isHastElement(groupRenderData.groupAst)) {
      throw newTypeError("hast Element", groupRenderData.groupAst, "groupAst");
    }
  });
  return {
    renderedGroupAst: groupRenderData.groupAst,
    renderedGroupContents,
    styles: await processPluginStyles(pluginStyles)
  };
}
function buildGroupAstFromRenderedBlocks(renderedBlocks) {
  return h(`${groupWrapperElement}.${groupWrapperClassName}`, renderedBlocks);
}

// src/helpers/color-transforms.ts
import { TinyColor, readability } from "@ctrl/tinycolor";

// ../../../node_modules/.pnpm/culori@4.0.1/node_modules/culori/src/lrgb/convertRgbToLrgb.js
var fn = (c = 0) => {
  const abs = Math.abs(c);
  if (abs <= 0.04045) {
    return c / 12.92;
  }
  return (Math.sign(c) || 1) * Math.pow((abs + 0.055) / 1.055, 2.4);
};
var convertRgbToLrgb = ({ r, g, b, alpha }) => {
  let res = {
    mode: "lrgb",
    r: fn(r),
    g: fn(g),
    b: fn(b)
  };
  if (alpha !== void 0)
    res.alpha = alpha;
  return res;
};
var convertRgbToLrgb_default = convertRgbToLrgb;

// ../../../node_modules/.pnpm/culori@4.0.1/node_modules/culori/src/lrgb/convertLrgbToRgb.js
var fn2 = (c = 0) => {
  const abs = Math.abs(c);
  if (abs > 31308e-7) {
    return (Math.sign(c) || 1) * (1.055 * Math.pow(abs, 1 / 2.4) - 0.055);
  }
  return c * 12.92;
};
var convertLrgbToRgb = ({ r, g, b, alpha }, mode = "rgb") => {
  let res = {
    mode,
    r: fn2(r),
    g: fn2(g),
    b: fn2(b)
  };
  if (alpha !== void 0)
    res.alpha = alpha;
  return res;
};
var convertLrgbToRgb_default = convertLrgbToRgb;

// ../../../node_modules/.pnpm/culori@4.0.1/node_modules/culori/src/util/normalizeHue.js
var normalizeHue = (hue) => (hue = hue % 360) < 0 ? hue + 360 : hue;
var normalizeHue_default = normalizeHue;

// ../../../node_modules/.pnpm/culori@4.0.1/node_modules/culori/src/lch/convertLabToLch.js
var convertLabToLch = ({ l, a, b, alpha }, mode = "lch") => {
  if (a === void 0)
    a = 0;
  if (b === void 0)
    b = 0;
  let c = Math.sqrt(a * a + b * b);
  let res = { mode, l, c };
  if (c)
    res.h = normalizeHue_default(Math.atan2(b, a) * 180 / Math.PI);
  if (alpha !== void 0)
    res.alpha = alpha;
  return res;
};
var convertLabToLch_default = convertLabToLch;

// ../../../node_modules/.pnpm/culori@4.0.1/node_modules/culori/src/lch/convertLchToLab.js
var convertLchToLab = ({ l, c, h: h2, alpha }, mode = "lab") => {
  if (h2 === void 0)
    h2 = 0;
  let res = {
    mode,
    l,
    a: c ? c * Math.cos(h2 / 180 * Math.PI) : 0,
    b: c ? c * Math.sin(h2 / 180 * Math.PI) : 0
  };
  if (alpha !== void 0)
    res.alpha = alpha;
  return res;
};
var convertLchToLab_default = convertLchToLab;

// ../../../node_modules/.pnpm/culori@4.0.1/node_modules/culori/src/hsl/convertHslToRgb.js
function convertHslToRgb({ h: h2, s: s2, l, alpha }) {
  h2 = normalizeHue_default(h2 !== void 0 ? h2 : 0);
  if (s2 === void 0)
    s2 = 0;
  if (l === void 0)
    l = 0;
  let m1 = l + s2 * (l < 0.5 ? l : 1 - l);
  let m2 = m1 - (m1 - l) * 2 * Math.abs(h2 / 60 % 2 - 1);
  let res;
  switch (Math.floor(h2 / 60)) {
    case 0:
      res = { r: m1, g: m2, b: 2 * l - m1 };
      break;
    case 1:
      res = { r: m2, g: m1, b: 2 * l - m1 };
      break;
    case 2:
      res = { r: 2 * l - m1, g: m1, b: m2 };
      break;
    case 3:
      res = { r: 2 * l - m1, g: m2, b: m1 };
      break;
    case 4:
      res = { r: m2, g: 2 * l - m1, b: m1 };
      break;
    case 5:
      res = { r: m1, g: 2 * l - m1, b: m2 };
      break;
    default:
      res = { r: 2 * l - m1, g: 2 * l - m1, b: 2 * l - m1 };
  }
  res.mode = "rgb";
  if (alpha !== void 0)
    res.alpha = alpha;
  return res;
}

// ../../../node_modules/.pnpm/culori@4.0.1/node_modules/culori/src/oklab/convertLrgbToOklab.js
var convertLrgbToOklab = ({ r, g, b, alpha }) => {
  if (r === void 0)
    r = 0;
  if (g === void 0)
    g = 0;
  if (b === void 0)
    b = 0;
  let L = Math.cbrt(
    0.41222147079999993 * r + 0.5363325363 * g + 0.0514459929 * b
  );
  let M = Math.cbrt(
    0.2119034981999999 * r + 0.6806995450999999 * g + 0.1073969566 * b
  );
  let S = Math.cbrt(
    0.08830246189999998 * r + 0.2817188376 * g + 0.6299787005000002 * b
  );
  let res = {
    mode: "oklab",
    l: 0.2104542553 * L + 0.793617785 * M - 0.0040720468 * S,
    a: 1.9779984951 * L - 2.428592205 * M + 0.4505937099 * S,
    b: 0.0259040371 * L + 0.7827717662 * M - 0.808675766 * S
  };
  if (alpha !== void 0) {
    res.alpha = alpha;
  }
  return res;
};
var convertLrgbToOklab_default = convertLrgbToOklab;

// ../../../node_modules/.pnpm/culori@4.0.1/node_modules/culori/src/oklab/convertRgbToOklab.js
var convertRgbToOklab = (rgb) => {
  let res = convertLrgbToOklab_default(convertRgbToLrgb_default(rgb));
  if (rgb.r === rgb.b && rgb.b === rgb.g) {
    res.a = res.b = 0;
  }
  return res;
};
var convertRgbToOklab_default = convertRgbToOklab;

// ../../../node_modules/.pnpm/culori@4.0.1/node_modules/culori/src/oklab/convertOklabToLrgb.js
var convertOklabToLrgb = ({ l, a, b, alpha }) => {
  if (l === void 0)
    l = 0;
  if (a === void 0)
    a = 0;
  if (b === void 0)
    b = 0;
  let L = Math.pow(
    l * 0.9999999984505198 + 0.39633779217376786 * a + 0.2158037580607588 * b,
    3
  );
  let M = Math.pow(
    l * 1.0000000088817609 - 0.10556134232365635 * a - 0.06385417477170591 * b,
    3
  );
  let S = Math.pow(
    l * 1.0000000546724108 - 0.08948418209496575 * a - 1.2914855378640917 * b,
    3
  );
  let res = {
    mode: "lrgb",
    r: 4.076741661347994 * L - 3.307711590408193 * M + 0.230969928729428 * S,
    g: -1.2684380040921763 * L + 2.6097574006633715 * M - 0.3413193963102197 * S,
    b: -0.004196086541837188 * L - 0.7034186144594493 * M + 1.7076147009309444 * S
  };
  if (alpha !== void 0) {
    res.alpha = alpha;
  }
  return res;
};
var convertOklabToLrgb_default = convertOklabToLrgb;

// ../../../node_modules/.pnpm/culori@4.0.1/node_modules/culori/src/oklab/convertOklabToRgb.js
var convertOklabToRgb = (c) => convertLrgbToRgb_default(convertOklabToLrgb_default(c));
var convertOklabToRgb_default = convertOklabToRgb;

// src/internal/search-algorithms.ts
function binarySearch({
  getValueFn,
  targetValue,
  preferHigher,
  tolerance = 0.1,
  low = 0,
  high = 1,
  minChangeFactor = 1e-3,
  maxIterations = 25
}) {
  const epsilon = minChangeFactor * Math.abs(high - low);
  let iterations = 0;
  let mid;
  let lastMid;
  while (mid = (low + high) / 2, iterations < maxIterations) {
    const currentValue = getValueFn(mid);
    const resultIsWithinTolerance = Math.abs(currentValue - targetValue) <= tolerance;
    const resultIsInPreferredDirection = preferHigher === void 0 ? true : preferHigher ? currentValue > targetValue : currentValue < targetValue;
    const midChangedLessThanEpsilon = lastMid !== void 0 && Math.abs(lastMid - mid) < epsilon;
    if (resultIsInPreferredDirection && (resultIsWithinTolerance || midChangedLessThanEpsilon)) {
      return mid;
    } else if (currentValue < targetValue) {
      low = mid;
    } else {
      high = mid;
    }
    iterations++;
    lastMid = mid;
  }
  return mid;
}
function bisect({
  checkFn,
  low = 0,
  high = 1,
  /**
   * If the midpoint changes less than `minChangeFactor * Math.abs(high - low)`
   * between iterations, the search will stop and return the highest value
   * that `checkFn` returned `true` for.
   */
  minChangeFactor = 1e-3,
  maxIterations = 25
}) {
  const epsilon = minChangeFactor * Math.abs(high - low);
  let iterations = 0;
  let highestValid;
  let mid;
  let lastMid;
  while (mid = (low + high) / 2, iterations < maxIterations) {
    const isValid = checkFn(mid);
    if (isValid) {
      highestValid = mid;
      low = mid;
    } else {
      high = mid;
    }
    const midChangedLessThanEpsilon = lastMid !== void 0 && Math.abs(lastMid - mid) < epsilon;
    if (midChangedLessThanEpsilon)
      return highestValid;
    iterations++;
    lastMid = mid;
  }
  return highestValid;
}

// src/internal/color-spaces.ts
var D65 = [0.3127 / 0.329, 1, (1 - 0.3127 - 0.329) / 0.329];
var D50 = [0.3457 / 0.3585, 1, (1 - 0.3457 - 0.3585) / 0.3585];
var m = [
  [3.240969941904521, -1.537383177570093, -0.498610760293],
  [-0.96924363628087, 1.87596750150772, 0.041555057407175],
  [0.055630079696993, -0.20397695888897, 1.056971514242878]
];
function xyzToRgb(xyz) {
  const [x, y, z] = [xyz.x, xyz.y, xyz.z].map((v) => v / 100);
  const linearToSrgb = (v) => v > 31308e-7 ? 1.055 * Math.pow(v, 1 / 2.4) - 0.055 : 12.92 * v;
  const r = x * m[0][0] + y * m[0][1] + z * m[0][2];
  const g = x * m[1][0] + y * m[1][1] + z * m[1][2];
  const b = x * m[2][0] + y * m[2][1] + z * m[2][2];
  return {
    r: linearToSrgb(r) * 255,
    g: linearToSrgb(g) * 255,
    b: linearToSrgb(b) * 255
  };
}
function labToXyz(lab, illuminant = D65) {
  const [l, a, b] = [lab.l, lab.a, lab.b].map((v) => v / 100);
  const y = (l + 0.16) / 1.16;
  const x = a / 5 + y;
  const z = y - b / 2;
  const transform = (v, whitepoint) => {
    const pow = Math.pow(v, 3);
    return (pow > 8856e-6 ? pow : (v - 16 / 116) / 7.787037) * whitepoint;
  };
  return {
    x: transform(x, illuminant[0]) * 100,
    y: transform(y, illuminant[1]) * 100,
    z: transform(z, illuminant[2]) * 100
  };
}
function lchabToLab(lch) {
  return {
    l: lch.l,
    a: lch.c * Math.cos((lch.h ?? 0) * Math.PI / 180),
    b: lch.c * Math.sin((lch.h ?? 0) * Math.PI / 180),
    alpha: lch.alpha
  };
}
function labToRgba(lab, illuminant = D65) {
  const xyz = labToXyz(lab, illuminant);
  return {
    ...xyzToRgb(xyz),
    a: lab.alpha
  };
}
function lchabToRgba(lch, illuminant = D65) {
  return labToRgba(lchabToLab(lch), illuminant);
}
function rgbaToCulori(rgba) {
  const { r, g, b, a } = rgba;
  return {
    mode: "rgb",
    r: r / 255,
    g: g / 255,
    b: b / 255,
    ...a !== void 0 && { alpha: a }
  };
}
function rgbaFromCulori(culoriRgb) {
  const { r, g, b, alpha } = culoriRgb;
  return {
    r: r * 255,
    g: g * 255,
    b: b * 255,
    a: alpha
  };
}
function hslToRgba(input) {
  return rgbaFromCulori(convertHslToRgb(input));
}
function rgbaToOklch(input) {
  const oklab = convertRgbToOklab_default(rgbaToCulori(input));
  return convertLabToLch_default(oklab, "oklch");
}
function oklchToRgba(input, clampChroma = true) {
  const convert = (oklch) => {
    const oklab = convertLchToLab_default(oklch, "oklab");
    const rgb = convertOklabToRgb_default(oklab);
    const minChannel = Math.min(rgb.r, rgb.g, rgb.b);
    const maxChannel = Math.max(rgb.r, rgb.g, rgb.b);
    const inGamut = minChannel >= 0 && maxChannel <= 1;
    return {
      rgb,
      c: oklch.c,
      inGamut
    };
  };
  let result = convert(input);
  if (!result.inGamut && clampChroma) {
    result = convert({ ...input, c: 0 });
    if (result.inGamut) {
      const maxChromaInGamut = bisect({
        checkFn: (c) => convert({ ...input, c }).inGamut,
        low: 0,
        high: input.c,
        minChangeFactor: 1e-4
      });
      result = convert({ ...input, c: maxChromaInGamut ?? 0 });
    }
  }
  return rgbaFromCulori(result.rgb);
}
function normalizeAngle(angle) {
  angle %= 360;
  return angle < 0 ? angle + 360 : angle;
}
function parseAngle(value) {
  return normalizeAngle(parseFloat(value));
}
function parseCssLabColor(labString) {
  const match = labString.match(/^lab\(\s*([\d.]+%?)\s+(-?[\d.]+%?)\s+(-?[\d.]+%?)(?:\s*\/\s*([\d.]+%?))?\s*\)$/i);
  if (!match) {
    return void 0;
  }
  const [, l, a, b, alpha] = match;
  return {
    l: parseCssValue(l, 0, 100),
    a: parseCssValue(a, -125, 125),
    b: parseCssValue(b, -125, 125),
    alpha: alpha !== void 0 ? parseCssValue(alpha, 0, 1) : void 0
  };
}
function parseCssLchColor(lchString) {
  const match = lchString.match(/^lch\(\s*([\d.]+%?)\s+([\d.]+%?)\s+([\d.]+(?:deg)?)(?:\s*\/\s*([\d.]+%?))?\s*\)$/i);
  if (!match) {
    return void 0;
  }
  const [, l, c, h2, alpha] = match;
  return {
    l: parseCssValue(l, 0, 100),
    c: parseCssValue(c, 0, 150),
    h: parseAngle(h2),
    alpha: alpha !== void 0 ? parseCssValue(alpha, 0, 1) : void 0
  };
}
function parseCssOklchColor(oklchString) {
  const match = oklchString.match(/^oklch\(\s*([\d.]+%?)\s+([\d.]+%?)\s+([\d.]+(?:deg)?)(?:\s*\/\s*([\d.]+%?))?\s*\)$/i);
  if (!match) {
    return void 0;
  }
  const [, l, c, h2, alpha] = match;
  return {
    mode: "oklch",
    l: parseCssValue(l, 0, 1),
    c: parseCssValue(c, 0, 0.5, 0.4),
    h: parseAngle(h2),
    ...alpha !== void 0 && { alpha: parseCssValue(alpha, 0, 1) }
  };
}
function parseCssValue(value, min, max, valueFor100Percent) {
  const isPercentage = value.endsWith("%");
  const floatValue = parseFloat(value);
  const convertedValue = isPercentage ? floatValue * (valueFor100Percent ?? max) / 100 : floatValue;
  return Math.max(min, Math.min(max, convertedValue));
}

// src/helpers/color-transforms.ts
function setAlpha(input, newAlpha) {
  return withParsedColor(input, (color) => {
    return toHexColor(color.setAlpha(newAlpha));
  });
}
function multiplyAlpha(input, factor) {
  return withParsedColor(input, (color) => {
    return toHexColor(color.setAlpha(minMaxRounded(color.getAlpha() * factor)));
  });
}
function getLuminance(input) {
  return toTinyColor(input).getLuminance();
}
function setLuminance(input, targetLuminance) {
  return withParsedColor(input, (color) => {
    targetLuminance = minMaxRounded(targetLuminance);
    const increasing = targetLuminance > color.getLuminance();
    const mixColor = increasing ? "#fff" : "#000";
    const mixAmount = binarySearch({
      getValueFn: (amount) => {
        return toTinyColor(color).mix(mixColor, amount * 100).getLuminance();
      },
      targetValue: targetLuminance,
      preferHigher: targetLuminance > 0 && targetLuminance < 1 ? increasing : void 0,
      tolerance: 1 / 256,
      // Ensure that the binary search range matches the luminance target direction
      low: increasing ? 0 : 1,
      high: increasing ? 1 : 0
    });
    return toHexColor(color.mix(mixColor, mixAmount * 100));
  });
}
function lighten(input, amount) {
  return withParsedColor(input, (color) => {
    const hsl = color.toHsl();
    const l = minMaxRounded(hsl.l);
    const { h: h2, s: s2, a: alpha } = hsl;
    return toHexColor(toTinyColor({ mode: "hsl", h: h2, s: s2, l: minMaxRounded(l + l * amount), alpha }));
  });
}
function darken(input, amount) {
  return lighten(input, -amount);
}
function mix(input, mixinInput, amount) {
  return withParsedColor(input, (color) => {
    const mixinColor = toTinyColor(mixinInput);
    const mixAmount = minMaxRounded(amount * 100, 0, 100);
    return toHexColor(color.mix(mixinColor, mixAmount));
  });
}
function onBackground(input, background) {
  return withParsedColor(
    input,
    (color) => {
      const backgroundColor = toTinyColor(background);
      return toHexColor(color.onBackground(backgroundColor));
    },
    background
  );
}
function getColorContrast(color1, color2) {
  const color = toTinyColor(color1);
  const backgroundColor = toTinyColor(color2);
  return readability(color, backgroundColor);
}
function getColorContrastOnBackground(input, background) {
  const color = toTinyColor(input);
  const backgroundColor = toTinyColor(background);
  return readability(color.onBackground(backgroundColor), backgroundColor);
}
function ensureColorContrastOnBackground(input, background, minContrast = 5.5, maxContrast = 22) {
  return withParsedColor(input, (color) => {
    return withParsedColor(
      background,
      (backgroundColor) => {
        const hexBackgroundColor = toHexColor(backgroundColor);
        let newColor = toTinyColor(color);
        let curContrast = readability(newColor.onBackground(backgroundColor), backgroundColor);
        if (curContrast < minContrast) {
          const contrastWithoutAlpha = readability(newColor, backgroundColor);
          if (contrastWithoutAlpha < minContrast) {
            newColor = toTinyColor(changeLuminanceToReachColorContrast(toHexColor(newColor), hexBackgroundColor, minContrast));
            curContrast = readability(newColor.onBackground(backgroundColor), backgroundColor);
          }
        }
        if (curContrast < minContrast || curContrast > maxContrast) {
          newColor = toTinyColor(changeAlphaToReachColorContrast(toHexColor(newColor), hexBackgroundColor, minContrast, maxContrast));
        }
        return toHexColor(newColor);
      },
      toHexColor(color)
    );
  });
}
function changeLuminanceToReachColorContrast(input1, input2, minContrast = 6) {
  const color1 = toTinyColor(input1);
  const color2 = toTinyColor(input2);
  const oldContrast = readability(color1, color2);
  if (oldContrast >= minContrast)
    return toHexColor(color1);
  const color1L = color1.getLuminance();
  const color2L = color2.getLuminance();
  const lightenTargetL = (color2L + 0.05) * minContrast - 0.05;
  const darkenTargetL = (color2L + 0.05) / minContrast - 0.05;
  const lightenedColor = setLuminance(input1, lightenTargetL);
  const darkenedColor = setLuminance(input1, darkenTargetL);
  const lightenedContrast = readability(lightenedColor, color2);
  const darkenedContrast = readability(darkenedColor, color2);
  if (lightenedContrast <= oldContrast && darkenedContrast <= oldContrast)
    return toHexColor(color1);
  if (color1L >= color2L && lightenedContrast >= minContrast)
    return lightenedColor;
  if (color1L < color2L && darkenedContrast >= minContrast)
    return darkenedColor;
  return lightenedContrast > darkenedContrast ? lightenedColor : darkenedColor;
}
function changeAlphaToReachColorContrast(input, background, minContrast = 6, maxContrast = 22) {
  const color = toTinyColor(input);
  const backgroundColor = toTinyColor(background);
  const colorOnBackground = color.onBackground(backgroundColor);
  const curContrast = readability(colorOnBackground, backgroundColor);
  if (curContrast >= minContrast && curContrast <= maxContrast)
    return toHexColor(color);
  const newAlpha = binarySearch({
    getValueFn: (alpha) => {
      const newColor = toTinyColor(color).setAlpha(alpha);
      const onBg = newColor.onBackground(backgroundColor);
      const result = readability(onBg, backgroundColor);
      return result;
    },
    targetValue: curContrast < minContrast ? minContrast : maxContrast,
    preferHigher: curContrast < minContrast,
    tolerance: 1 / 256,
    low: 0.15,
    high: 1
  });
  return setAlpha(toHexColor(color), newAlpha);
}
function getFirstStaticColor(...inputs) {
  const extractFallbackFromCssVar = (input) => {
    const match = input.match(/^\s*var\([^,]+,\s*(.+?)\s*\)\s*$/i);
    return match ? match[1] : void 0;
  };
  const isValid = (input) => toTinyColor(input)?.isValid;
  for (const input of inputs) {
    if (!input)
      continue;
    if (isValid(input))
      return input;
    let cssVarFallback = extractFallbackFromCssVar(input);
    while (cssVarFallback) {
      if (isValid(cssVarFallback))
        return cssVarFallback;
      cssVarFallback = extractFallbackFromCssVar(cssVarFallback);
    }
  }
  return void 0;
}
function getStaticBackgroundColor(styleVariant) {
  const color = getFirstStaticColor(styleVariant.resolvedStyleSettings.get("codeBackground"), styleVariant.theme.bg);
  return color ?? (styleVariant.theme.type === "dark" ? "#202020" : "#fff");
}
function chromaticRecolor(input, target) {
  let targetHue;
  let targetChroma;
  let targetChromaMeasuredAtLightness;
  if (typeof target === "string") {
    const targetOklch = rgbaToOklch(toTinyColor(target));
    targetHue = targetOklch.h ?? 0;
    targetChroma = targetOklch.c;
    targetChromaMeasuredAtLightness = targetOklch.l;
  } else {
    targetHue = target.hue;
    targetChroma = target.chroma;
    targetChromaMeasuredAtLightness = target.chromaMeasuredAtLightness;
  }
  return withParsedColor(input, (color) => {
    const oklch = rgbaToOklch(color);
    oklch.h = targetHue;
    const maxChromaForInputLightness = rgbaToOklch(oklchToRgba({ ...oklch, c: 0.4 })).c;
    let newChroma;
    if (targetChromaMeasuredAtLightness !== void 0) {
      const maxChromaForTargetLightness = rgbaToOklch(oklchToRgba({ ...oklch, c: 0.4, l: targetChromaMeasuredAtLightness })).c;
      const relativeTargetChroma = Math.min(targetChroma, maxChromaForTargetLightness) / maxChromaForTargetLightness;
      newChroma = maxChromaForInputLightness * relativeTargetChroma;
    } else {
      newChroma = Math.min(targetChroma, maxChromaForInputLightness);
    }
    const linearDecrease = (i, start, end) => Math.max(0, Math.min(1, 1 - (i - start) / (end - start)));
    const highLightnessFactor = linearDecrease(oklch.l, 0.95, 0.99);
    oklch.c = newChroma * highLightnessFactor;
    return toHexColor(toTinyColor(oklchToRgba(oklch, true)));
  });
}
function withParsedColor(input, transform, fallback) {
  const color = input && toTinyColor(input);
  if (!color || !color.isValid) {
    const fallbackOrInput = fallback !== void 0 ? fallback : input;
    return !fallbackOrInput || typeof fallbackOrInput === "string" ? fallbackOrInput : toHexColor(fallbackOrInput);
  }
  return transform(color);
}
function toTinyColor(input) {
  if (input instanceof TinyColor) {
    return new TinyColor(input.toRgb());
  }
  if (typeof input === "string") {
    const labColor = parseCssLabColor(input);
    if (labColor) {
      return new TinyColor(labToRgba(labColor));
    }
    const lchColor = parseCssLchColor(input);
    if (lchColor) {
      return new TinyColor(lchabToRgba(lchColor));
    }
    const oklchColor = parseCssOklchColor(input);
    if (oklchColor) {
      return new TinyColor(oklchToRgba(oklchColor));
    }
    return new TinyColor(input);
  }
  if (typeof input === "object" && "mode" in input) {
    if (input.mode === "hsl")
      return new TinyColor(hslToRgba(input));
    if (input.mode === "oklch")
      return new TinyColor(oklchToRgba(input));
  }
  return new TinyColor(input);
}
function toHexColor(input) {
  const color = input instanceof TinyColor ? input : toTinyColor(input);
  return color.toHexShortString();
}
function toRgbaString(input) {
  return toTinyColor(input).toRgbString().toLowerCase();
}
function roundFloat(number, decimalPoints) {
  const decimal = Math.pow(10, decimalPoints);
  return Math.round(number * decimal) / decimal;
}
function minMaxRounded(number, min = 0, max = 1, decimalPoints = 3) {
  return Math.max(min, Math.min(max, roundFloat(number, decimalPoints)));
}

// src/internal/vscode-colors.ts
var groupedDefaultWorkbenchColorKeys = {
  backgrounds: [
    "editor.background",
    "editorGroupHeader.tabsBackground",
    "editorGroupHeader.tabsBorder",
    "titleBar.activeBackground",
    "titleBar.border",
    "panel.background",
    "tab.activeBackground",
    "tab.activeBorderTop",
    "tab.activeBorder",
    "terminal.background",
    "widget.shadow"
  ],
  accents: [
    "focusBorder",
    "editor.selectionBackground",
    "textBlockQuote.border",
    "textLink.activeForeground",
    "textLink.foreground",
    "editorLink.activeForeground",
    "tab.activeForeground",
    "tab.inactiveForeground",
    "tab.unfocusedActiveForeground",
    "tab.unfocusedInactiveForeground"
  ]
};
var defaultEditorBackgroundColors = ["#1e1e1e", "#ffffff"];
var defaultEditorForegroundColors = ["#bbbbbb", "#333333"];
var defaultWorkbenchColors = {
  // Base colors
  focusBorder: ["#007fd4", "#0090f1"],
  foreground: ["#cccccc", "#616161"],
  disabledForeground: ["#cccccc80", "#61616180"],
  descriptionForeground: [["transparent", "foreground", 0.7], "#717171"],
  errorForeground: ["#f48771", "#a1260d"],
  "icon.foreground": ["#c5c5c5", "#424242"],
  // Contrast colors
  contrastActiveBorder: null,
  contrastBorder: null,
  // Colors inside a text document, such as the welcome page
  "textBlockQuote.background": ["#7f7f7f1a", "#7f7f7f1a"],
  "textBlockQuote.border": ["#007acc80", "#007acc80"],
  "textCodeBlock.background": ["#0a0a0a66", "#dcdcdc66"],
  "textLink.activeForeground": ["#3794ff", "#006ab1"],
  "textLink.foreground": ["#3794ff", "#006ab1"],
  "textPreformat.foreground": ["#d7ba7d", "#a31515"],
  "textSeparator.foreground": ["#ffffff2e", "#0000002e"],
  // Editor colors
  "editor.background": defaultEditorBackgroundColors,
  "editor.foreground": defaultEditorForegroundColors,
  "editorLineNumber.foreground": ["#858585", "#237893"],
  "editorLineNumber.activeForeground": "editorActiveLineNumber.foreground",
  "editorActiveLineNumber.foreground": ["#c6c6c6", "#0b216f"],
  "editor.selectionBackground": ["#264f78", "#add6ff"],
  "editor.inactiveSelectionBackground": ["transparent", "editor.selectionBackground", 0.5],
  "editor.selectionHighlightBackground": ["lessProminent", "editor.selectionBackground", "editor.background", 0.3, 0.6],
  // Editor status colors & icons
  "editorError.foreground": ["#f14c4c", "#e51400"],
  "editorWarning.foreground": ["#cca700", "#bf8803"],
  "editorInfo.foreground": ["#3794ff", "#1a85ff"],
  "editorHint.foreground": ["#eeeeeeb2", "#6c6c6c"],
  "problemsErrorIcon.foreground": "editorError.foreground",
  "problemsWarningIcon.foreground": "editorWarning.foreground",
  "problemsInfoIcon.foreground": "editorInfo.foreground",
  // Editor find matches
  "editor.findMatchBackground": ["#515c6a", "#a8ac94"],
  "editor.findMatchHighlightBackground": ["#ea5c0055", "#ea5c0055"],
  "editor.findRangeHighlightBackground": ["#3a3d4166", "#b4b4b44d"],
  // Editor links
  "editorLink.activeForeground": ["#4e94ce", "#0000ff"],
  // Editor lightbulb icons
  "editorLightBulb.foreground": ["#ffcc00", "#ddb100"],
  "editorLightBulbAutoFix.foreground": ["#75beff", "#007acc"],
  // Editor diffs
  "diffEditor.insertedTextBackground": ["#9ccc2c33", "#9ccc2c40"],
  "diffEditor.insertedTextBorder": null,
  "diffEditor.removedTextBackground": ["#ff000033", "#ff000033"],
  "diffEditor.removedTextBorder": null,
  "diffEditor.insertedLineBackground": ["#9bb95533", "#9bb95533"],
  "diffEditor.removedLineBackground": ["#ff000033", "#ff000033"],
  // Editor sticky scroll
  "editorStickyScroll.background": "editor.background",
  "editorStickyScrollHover.background": ["#2a2d2e", "#f0f0f0"],
  // Editor inlays (hints displayed inside an editor line)
  "editorInlayHint.background": [
    ["transparent", "badge.background", 0.8],
    ["transparent", "badge.background", 0.6]
  ],
  "editorInlayHint.foreground": "badge.foreground",
  "editorInlayHint.typeBackground": "editorInlayHint.background",
  "editorInlayHint.typeForeground": "editorInlayHint.foreground",
  "editorInlayHint.parameterBackground": "editorInlayHint.background",
  "editorInlayHint.parameterForeground": "editorInlayHint.foreground",
  // Editor groups & panes
  "editorPane.background": ["editor.background", "editor.background"],
  "editorGroup.emptyBackground": null,
  "editorGroup.focusedEmptyBorder": null,
  "editorGroupHeader.tabsBackground": ["#252526", "#f3f3f3"],
  "editorGroupHeader.tabsBorder": null,
  "editorGroupHeader.noTabsBackground": ["editor.background", "editor.background"],
  "editorGroupHeader.border": null,
  "editorGroup.border": ["#444444", "#e7e7e7"],
  "editorGroup.dropBackground": ["#53595d80", "#2677cb2d"],
  "editorGroup.dropIntoPromptForeground": ["editorWidget.foreground", "editorWidget.foreground"],
  "editorGroup.dropIntoPromptBackground": ["editorWidget.background", "editorWidget.background"],
  "editorGroup.dropIntoPromptBorder": null,
  "sideBySideEditor.horizontalBorder": ["editorGroup.border", "editorGroup.border"],
  "sideBySideEditor.verticalBorder": ["editorGroup.border", "editorGroup.border"],
  // Scrollbars
  "scrollbar.shadow": ["#000000", "#dddddd"],
  "scrollbarSlider.background": ["#79797966", "#64646466"],
  "scrollbarSlider.hoverBackground": ["#646464b2", "#646464b2"],
  "scrollbarSlider.activeBackground": ["#bfbfbf66", "#00000099"],
  // Panels
  "panel.background": "editor.background",
  "panel.border": "#80808059",
  "panelTitle.activeBorder": "panelTitle.activeForeground",
  "panelTitle.activeForeground": ["#e7e7e7", "#424242"],
  "panelTitle.inactiveForeground": [
    ["transparent", "panelTitle.activeForeground", 0.6],
    ["transparent", "panelTitle.activeForeground", 0.75]
  ],
  "panelSectionHeader.background": "#80808051",
  "terminal.background": "panel.background",
  // Widgets
  "widget.shadow": ["#0000005b", "#00000028"],
  "editorWidget.background": ["#252526", "#f3f3f3"],
  "editorWidget.foreground": "foreground",
  "editorWidget.border": ["#454545", "#c8c8c8"],
  "quickInput.background": "editorWidget.background",
  "quickInput.foreground": "editorWidget.foreground",
  "quickInputTitle.background": ["#ffffff1a", "#0000000f"],
  "pickerGroup.foreground": ["#3794ff", "#0066bf"],
  "pickerGroup.border": ["#3f3f46", "#cccedb"],
  "editor.hoverHighlightBackground": ["#264f7840", "#add6ff26"],
  "editorHoverWidget.background": "editorWidget.background",
  "editorHoverWidget.foreground": "editorWidget.foreground",
  "editorHoverWidget.border": "editorWidget.border",
  "editorHoverWidget.statusBarBackground": [
    ["lighten", "editorHoverWidget.background", 0.2],
    ["darken", "editorHoverWidget.background", 0.05]
  ],
  // Title bar
  "titleBar.activeBackground": ["#3c3c3c", "#dddddd"],
  "titleBar.activeForeground": ["#cccccc", "#333333"],
  "titleBar.inactiveBackground": ["transparent", "titleBar.activeBackground", 0.6],
  "titleBar.inactiveForeground": ["transparent", "titleBar.activeForeground", 0.6],
  "titleBar.border": null,
  // Toolbars
  "toolbar.hoverBackground": ["#5a5d5e50", "#b8b8b850"],
  "toolbar.activeBackground": [
    ["lighten", "toolbar.hoverBackground", 0.1],
    ["darken", "toolbar.hoverBackground", 0.1]
  ],
  // Tab background
  "tab.activeBackground": ["editor.background", "editor.background"],
  "tab.unfocusedActiveBackground": ["tab.activeBackground", "tab.activeBackground"],
  "tab.inactiveBackground": ["#2d2d2d", "#ececec"],
  "tab.unfocusedInactiveBackground": ["tab.inactiveBackground", "tab.inactiveBackground"],
  // Tab foreground
  "tab.activeForeground": ["#ffffff", "#333333"],
  "tab.inactiveForeground": [
    ["transparent", "tab.activeForeground", 0.5],
    ["transparent", "tab.activeForeground", 0.7]
  ],
  "tab.unfocusedActiveForeground": [
    ["transparent", "tab.activeForeground", 0.5],
    ["transparent", "tab.activeForeground", 0.7]
  ],
  "tab.unfocusedInactiveForeground": [
    ["transparent", "tab.inactiveForeground", 0.5],
    ["transparent", "tab.inactiveForeground", 0.5]
  ],
  // Tab hover foreground/background
  "tab.hoverBackground": null,
  "tab.unfocusedHoverBackground": [
    ["transparent", "tab.hoverBackground", 0.5],
    ["transparent", "tab.hoverBackground", 0.7]
  ],
  "tab.hoverForeground": null,
  "tab.unfocusedHoverForeground": [
    ["transparent", "tab.hoverForeground", 0.5],
    ["transparent", "tab.hoverForeground", 0.5]
  ],
  // Tab borders
  "tab.border": ["#252526", "#f3f3f3"],
  "tab.lastPinnedBorder": ["tree.indentGuidesStroke", "tree.indentGuidesStroke"],
  "tab.activeBorder": null,
  "tab.unfocusedActiveBorder": [
    ["transparent", "tab.activeBorder", 0.5],
    ["transparent", "tab.activeBorder", 0.7]
  ],
  "tab.activeBorderTop": null,
  "tab.unfocusedActiveBorderTop": [
    ["transparent", "tab.activeBorderTop", 0.5],
    ["transparent", "tab.activeBorderTop", 0.7]
  ],
  "tab.hoverBorder": null,
  "tab.unfocusedHoverBorder": [
    ["transparent", "tab.hoverBorder", 0.5],
    ["transparent", "tab.hoverBorder", 0.7]
  ],
  // Tab modified border
  "tab.activeModifiedBorder": ["#3399cc", "#33aaee"],
  "tab.inactiveModifiedBorder": [
    ["transparent", "tab.activeModifiedBorder", 0.5],
    ["transparent", "tab.activeModifiedBorder", 0.5]
  ],
  "tab.unfocusedActiveModifiedBorder": [
    ["transparent", "tab.activeModifiedBorder", 0.5],
    ["transparent", "tab.activeModifiedBorder", 0.7]
  ],
  "tab.unfocusedInactiveModifiedBorder": [
    ["transparent", "tab.inactiveModifiedBorder", 0.5],
    ["transparent", "tab.inactiveModifiedBorder", 0.5]
  ],
  // Badges (small information labels, for example, search results count)
  "badge.background": ["#4d4d4d", "#c4c4c4"],
  "badge.foreground": ["#ffffff", "#333333"],
  // Buttons
  "button.background": ["#0e639c", "#007acc"],
  "button.foreground": ["#ffffff", "#ffffff"],
  "button.border": "contrastBorder",
  "button.separator": ["transparent", "button.foreground", 0.4],
  "button.hoverBackground": [
    ["lighten", "button.background", 0.2],
    ["darken", "button.background", 0.2]
  ],
  "button.secondaryBackground": ["#3a3d41", "#5f6a79"],
  "button.secondaryForeground": ["#ffffff", "#ffffff"],
  "button.secondaryHoverBackground": [
    ["lighten", "button.secondaryBackground", 0.2],
    ["darken", "button.secondaryBackground", 0.2]
  ],
  // Dropdowns (selects)
  "dropdown.background": ["#3c3c3c", "#ffffff"],
  "dropdown.foreground": ["#f0f0f0", "foreground"],
  "dropdown.border": ["dropdown.background", "#cecece"],
  // Lists
  "list.activeSelectionBackground": ["#04395e", "#0060c0"],
  "list.activeSelectionForeground": "#ffffff",
  // Trees
  "tree.indentGuidesStroke": ["#585858", "#a9a9a9"],
  // Input fields
  "input.background": ["#3c3c3c", "#ffffff"],
  "input.foreground": "foreground",
  "input.placeholderForeground": ["transparent", "foreground", 0.5],
  "inputOption.activeBorder": ["#007acc", "#007acc"],
  "inputOption.hoverBackground": ["#5a5d5e80", "#b8b8b850"],
  "inputOption.activeBackground": [
    ["transparent", "focusBorder", 0.4],
    ["transparent", "focusBorder", 0.2]
  ],
  "inputOption.activeForeground": ["#ffffff", "#000000"],
  "inputValidation.infoBackground": ["#063b49", "#d6ecf2"],
  "inputValidation.infoBorder": ["#007acc", "#007acc"],
  "inputValidation.warningBackground": ["#352a05", "#f6f5d2"],
  "inputValidation.warningBorder": ["#b89500", "#b89500"],
  "inputValidation.errorBackground": ["#5a1d1d", "#f2dede"],
  "inputValidation.errorBorder": ["#be1100", "#be1100"],
  // Keybinding labels
  "keybindingLabel.background": ["#8080802b", "#dddddd66"],
  "keybindingLabel.foreground": ["#cccccc", "#555555"],
  "keybindingLabel.border": ["#33333399", "#cccccc66"],
  "keybindingLabel.bottomBorder": ["#44444499", "#bbbbbb66"],
  // Menu colors
  "menu.foreground": "dropdown.foreground",
  "menu.background": "dropdown.background",
  "menu.selectionForeground": "list.activeSelectionForeground",
  "menu.selectionBackground": "list.activeSelectionBackground",
  "menu.separatorBackground": ["#606060", "#d4d4d4"],
  // Snippet placeholder colors
  "editor.snippetTabstopHighlightBackground": ["#7c7c74c", "#0a326433"],
  "editor.snippetFinalTabstopHighlightBorder": ["#525252", "#0a326480"],
  // Terminal colors
  "terminal.ansiBlack": "#000000",
  "terminal.ansiRed": "#cd3131",
  "terminal.ansiGreen": ["#0dbc79", "#00bc00"],
  "terminal.ansiYellow": ["#e5e510", "#949800"],
  "terminal.ansiBlue": ["#2472c8", "#0451a5"],
  "terminal.ansiMagenta": ["#bc3fbc", "#bc05bc"],
  "terminal.ansiCyan": ["#11a8cd", "#0598bc"],
  "terminal.ansiWhite": ["#e5e5e5", "#555555"],
  "terminal.ansiBrightBlack": "#666666",
  "terminal.ansiBrightRed": ["#f14c4c", "#cd3131"],
  "terminal.ansiBrightGreen": ["#23d18b", "#14ce14"],
  "terminal.ansiBrightYellow": ["#f5f543", "#b5ba00"],
  "terminal.ansiBrightBlue": ["#3b8eea", "#0451a5"],
  "terminal.ansiBrightMagenta": ["#d670d6", "#bc05bc"],
  "terminal.ansiBrightCyan": ["#29b8db", "#0598bc"],
  "terminal.ansiBrightWhite": ["#e5e5e5", "#a5a5a5"]
};
function resolveVSCodeWorkbenchColors(colors, themeType) {
  const typeIndex = themeType === "dark" ? 0 : 1;
  const workbenchColors = {
    ...defaultWorkbenchColors,
    ...colors
  };
  const colorsStartedResolving = /* @__PURE__ */ new Set();
  const colorsResolved = /* @__PURE__ */ new Map();
  function applyColorTransform(unresolvedColor) {
    if (unresolvedColor.length === 3) {
      const [type, colorKey, amount] = unresolvedColor;
      const hexColor = resolveColor(colorKey);
      if (hexColor === null)
        return null;
      if (type === "transparent") {
        return multiplyAlpha(hexColor, amount);
      } else if (type === "lighten") {
        return lighten(hexColor, amount);
      } else if (type === "darken") {
        return darken(hexColor, amount);
      }
    }
    if (unresolvedColor.length === 5 && unresolvedColor[0] === "lessProminent") {
      const [, colorKey, backgroundKey, factor, transparency] = unresolvedColor;
      const hexFrom = resolveColor(colorKey);
      if (hexFrom === null)
        return null;
      const hexBackground = resolveColor(backgroundKey);
      if (hexBackground === null)
        return multiplyAlpha(hexFrom, factor * transparency);
      const fromLum = getLuminance(hexFrom);
      const bgLum = getLuminance(hexBackground);
      let combinedFactor = factor ? factor : 0.5;
      if (fromLum < bgLum) {
        combinedFactor *= (bgLum - fromLum) / bgLum;
        const lightened = lighten(hexFrom, combinedFactor);
        return multiplyAlpha(lightened, transparency);
      } else {
        combinedFactor *= (fromLum - bgLum) / fromLum;
        const darkened = darken(hexFrom, combinedFactor);
        return multiplyAlpha(darkened, transparency);
      }
    }
  }
  function resolveColor(unresolvedColor) {
    if (unresolvedColor === null)
      return null;
    const alreadyResolvedColor = colorsResolved.get(unresolvedColor);
    if (alreadyResolvedColor !== void 0)
      return alreadyResolvedColor;
    if (colorsStartedResolving.has(unresolvedColor))
      throw new Error("Circular reference in default colors.");
    colorsStartedResolving.add(unresolvedColor);
    let resolved;
    if (typeof unresolvedColor === "string") {
      if (unresolvedColor.startsWith("#")) {
        resolved = unresolvedColor.toLowerCase();
      } else {
        const referencedColor = workbenchColors[unresolvedColor];
        if (referencedColor !== void 0)
          resolved = resolveColor(referencedColor);
      }
    } else if (Array.isArray(unresolvedColor)) {
      if (unresolvedColor.length === 2) {
        resolved = resolveColor(unresolvedColor[typeIndex]);
      } else {
        resolved = applyColorTransform(unresolvedColor);
      }
    }
    if (resolved === void 0)
      throw new Error(`Invalid color value ${JSON.stringify(unresolvedColor)}, expected a hex color.`);
    colorsResolved.set(unresolvedColor, resolved);
    return resolved;
  }
  const keys = Object.keys(workbenchColors);
  keys.forEach((key) => {
    try {
      workbenchColors[key] = resolveColor(workbenchColors[key]);
    } catch (error) {
      const msg = error instanceof Error ? error.message : error;
      throw new Error(`Failed to resolve theme color for key ${key}: ${msg}`);
    }
  });
  return workbenchColors;
}
function guessThemeTypeFromEditorColors(colors) {
  const bgLuminance = getLuminance(colors?.["editor.background"] || defaultEditorBackgroundColors[0]);
  const fgLuminance = getLuminance(colors?.["editor.foreground"] || defaultEditorForegroundColors[0]);
  return bgLuminance < fgLuminance ? "dark" : "light";
}

// ../../../node_modules/.pnpm/strip-json-comments@5.0.1/node_modules/strip-json-comments/index.js
var singleComment = Symbol("singleComment");
var multiComment = Symbol("multiComment");
var stripWithoutWhitespace = () => "";
var stripWithWhitespace = (string, start, end) => string.slice(start, end).replace(/\S/g, " ");
var isEscaped = (jsonString, quotePosition) => {
  let index = quotePosition - 1;
  let backslashCount = 0;
  while (jsonString[index] === "\\") {
    index -= 1;
    backslashCount += 1;
  }
  return Boolean(backslashCount % 2);
};
function stripJsonComments(jsonString, { whitespace = true, trailingCommas = false } = {}) {
  if (typeof jsonString !== "string") {
    throw new TypeError(`Expected argument \`jsonString\` to be a \`string\`, got \`${typeof jsonString}\``);
  }
  const strip = whitespace ? stripWithWhitespace : stripWithoutWhitespace;
  let isInsideString = false;
  let isInsideComment = false;
  let offset = 0;
  let buffer = "";
  let result = "";
  let commaIndex = -1;
  for (let index = 0; index < jsonString.length; index++) {
    const currentCharacter = jsonString[index];
    const nextCharacter = jsonString[index + 1];
    if (!isInsideComment && currentCharacter === '"') {
      const escaped = isEscaped(jsonString, index);
      if (!escaped) {
        isInsideString = !isInsideString;
      }
    }
    if (isInsideString) {
      continue;
    }
    if (!isInsideComment && currentCharacter + nextCharacter === "//") {
      buffer += jsonString.slice(offset, index);
      offset = index;
      isInsideComment = singleComment;
      index++;
    } else if (isInsideComment === singleComment && currentCharacter + nextCharacter === "\r\n") {
      index++;
      isInsideComment = false;
      buffer += strip(jsonString, offset, index);
      offset = index;
      continue;
    } else if (isInsideComment === singleComment && currentCharacter === "\n") {
      isInsideComment = false;
      buffer += strip(jsonString, offset, index);
      offset = index;
    } else if (!isInsideComment && currentCharacter + nextCharacter === "/*") {
      buffer += jsonString.slice(offset, index);
      offset = index;
      isInsideComment = multiComment;
      index++;
      continue;
    } else if (isInsideComment === multiComment && currentCharacter + nextCharacter === "*/") {
      index++;
      isInsideComment = false;
      buffer += strip(jsonString, offset, index + 1);
      offset = index + 1;
      continue;
    } else if (trailingCommas && !isInsideComment) {
      if (commaIndex !== -1) {
        if (currentCharacter === "}" || currentCharacter === "]") {
          buffer += jsonString.slice(offset, index);
          result += strip(buffer, 0, 1) + buffer.slice(1);
          buffer = "";
          offset = index;
          commaIndex = -1;
        } else if (currentCharacter !== " " && currentCharacter !== "	" && currentCharacter !== "\r" && currentCharacter !== "\n") {
          buffer += jsonString.slice(offset, index);
          offset = index;
          commaIndex = -1;
        }
      } else if (currentCharacter === ",") {
        result += buffer + jsonString.slice(offset, index);
        buffer = "";
        offset = index;
        commaIndex = index;
      }
    }
  }
  return result + buffer + (isInsideComment ? strip(jsonString.slice(offset)) : jsonString.slice(offset));
}

// src/common/theme.ts
var ExpressiveCodeTheme = class _ExpressiveCodeTheme {
  name;
  type;
  colors;
  fg;
  bg;
  semanticHighlighting;
  settings;
  styleOverrides;
  /**
   * Loads the given theme for use with Expressive Code. Supports both Shiki and VS Code themes.
   *
   * You can also pass an existing `ExpressiveCodeTheme` instance to create a copy of it.
   *
   * Note: To save on bundle size, this constructor does not support loading themes
   * bundled with Shiki by name (e.g. `dracula`). Instead, import Shiki's `loadTheme`
   * function yourself, use it to load its bundled theme (e.g. `themes/dracula.json`),
   * and pass the result to this constructor.
   */
  constructor(theme) {
    let themeType = theme.type;
    if (themeType === "css")
      throw new Error('Theme type "css" is not supported.');
    if (themeType !== "dark" && themeType !== "light") {
      themeType = guessThemeTypeFromEditorColors(theme.colors);
    }
    const themeColors = { ...theme.colors };
    for (const key in themeColors) {
      if (typeof themeColors[key] !== "string" || !themeColors[key].trim().length)
        delete themeColors[key];
    }
    this.name = theme.name || themeType;
    this.type = themeType;
    this.colors = resolveVSCodeWorkbenchColors(themeColors, this.type);
    this.fg = theme.fg || this.colors["editor.foreground"];
    this.bg = theme.bg || this.colors["editor.background"];
    this.semanticHighlighting = theme.semanticHighlighting || false;
    const premultiplyTable = [["editorGroupHeader.tabsBackground", "editor.background"]];
    premultiplyTable.forEach(([colorKey, bgKey]) => {
      this.colors[colorKey] = onBackground(this.colors[colorKey], this.colors[bgKey]);
    });
    const themeTokenSettings = theme.tokenColors || theme.settings;
    this.settings = this.parseThemeSettings(themeTokenSettings);
    this.styleOverrides = theme.styleOverrides ?? {};
  }
  /**
   * Applies chromatic adjustments to entire groups of theme colors while keeping their
   * relative lightness and alpha components intact. This can be used to quickly create
   * theme variants that fit the color scheme of any website or brand.
   *
   * Adjustments can either be defined as hue and chroma values in the OKLCH color space
   * (range 0–360 for hue, 0–0.4 for chroma), or these values can be extracted from
   * hex color strings (e.g. `#3b82f6`).
   *
   * You can target predefined groups of theme colors (e.g. `backgrounds`, `accents`)
   * and/or use the `custom` property to define your own groups of theme colors to be adjusted.
   * Each custom group must contain a `themeColorKeys` property with an array of VS Code
   * theme color keys (e.g. `['panel.background', 'panel.border']`) and a `targetHueAndChroma`
   * property that accepts the same adjustment target values as `backgrounds` and `accents`.
   * Custom groups will be applied in the order they are defined.
   *
   * Returns the same `ExpressiveCodeTheme` instance to allow chaining.
   */
  applyHueAndChromaAdjustments(adjustments) {
    const adjustedColors = {};
    const adjustColors = (colors, target) => {
      colors.forEach((color) => {
        if (!this.colors[color])
          return;
        adjustedColors[color] = chromaticRecolor(this.colors[color], target);
      });
    };
    if (adjustments.backgrounds) {
      adjustColors(groupedDefaultWorkbenchColorKeys.backgrounds, adjustments.backgrounds);
    }
    if (adjustments.accents) {
      adjustColors(groupedDefaultWorkbenchColorKeys.accents, adjustments.accents);
    }
    if (adjustments.custom) {
      adjustments.custom.forEach((custom) => {
        adjustColors(custom.themeColorKeys, custom.targetHueAndChroma);
      });
    }
    Object.assign(this.colors, adjustedColors);
    return this;
  }
  /**
   * Processes the theme's syntax highlighting colors to ensure a minimum contrast ratio
   * between foreground and background colors.
   *
   * The default value of 5.5 ensures optimal accessibility with a contrast ratio of 5.5:1.
   *
   * You can optionally pass a custom background color to use for the contrast checks.
   * By default, the theme's background color will be used.
   *
   * Returns the same `ExpressiveCodeTheme` instance to allow chaining.
   */
  ensureMinSyntaxHighlightingColorContrast(minContrast = 5.5, backgroundColor) {
    const fixedContrastCache = /* @__PURE__ */ new Map();
    const fixContrast = (color) => {
      const cachedResult = fixedContrastCache.get(color);
      if (cachedResult)
        return cachedResult;
      const newColor = ensureColorContrastOnBackground(color, backgroundColor || this.bg, minContrast);
      fixedContrastCache.set(color, newColor);
      return newColor;
    };
    this.colors["editor.foreground"] = fixContrast(this.colors["editor.foreground"]);
    this.fg = fixContrast(this.colors["editor.foreground"]);
    this.settings.forEach((s2) => {
      if (!s2.settings.foreground)
        return;
      s2.settings.foreground = fixContrast(s2.settings.foreground);
    });
    return this;
  }
  /**
   * Parses the given theme settings into a properly typed format
   * that can be used by both Expressive Code and Shiki.
   *
   * As theme scopes can be defined as either a comma-separated string, or an array of strings,
   * they will always be converted to their array form to simplify further processing.
   *
   * Also recreates known object properties to prevent accidental mutation
   * of the original settings when copying a theme.
   */
  parseThemeSettings(settings) {
    if (!settings || !Array.isArray(settings))
      return [];
    return settings.map((unknownSetting) => {
      const { name, scope: anyScope, settings: settings2, ...rest } = unknownSetting;
      const scope = Array.isArray(anyScope) ? anyScope.slice() : typeof anyScope === "string" ? anyScope.split(/\s*,\s*/) : void 0;
      return {
        ...name !== void 0 ? { name } : {},
        ...scope !== void 0 ? { scope } : {},
        settings: { ...settings2 },
        ...rest
      };
    });
  }
  /**
   * Attempts to parse the given JSON string as a theme.
   *
   * As some themes follow the JSONC format and may contain comments and trailing commas,
   * this method will attempt to strip them before parsing the result.
   */
  static fromJSONString(json) {
    return new _ExpressiveCodeTheme(JSON.parse(stripJsonComments(json, { trailingCommas: true })));
  }
};

// src/common/plugin-style-settings.ts
var PluginStyleSettings = class {
  defaultValues;
  cssVarExclusions;
  cssVarReplacements;
  preventUnitlessValues;
  constructor({
    defaultValues,
    cssVarExclusions = [],
    cssVarReplacements: cssVarReplacements3 = [],
    preventUnitlessValues = []
  }) {
    this.defaultValues = defaultValues;
    this.cssVarExclusions = cssVarExclusions;
    this.cssVarReplacements = cssVarReplacements3;
    this.preventUnitlessValues = preventUnitlessValues;
  }
};

// src/internal/core-styles.ts
var coreStyleSettings = new PluginStyleSettings({
  defaultValues: {
    // Outer container
    borderRadius: "0.3rem",
    borderWidth: "1.5px",
    borderColor: ({ theme }) => theme.colors["titleBar.border"] || lighten(theme.colors["editor.background"], theme.type === "dark" ? 0.5 : -0.15) || "transparent",
    // Code editor content
    codeFontFamily: minifyFontFamily(`ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace`),
    codeFontSize: "0.85rem",
    codeFontWeight: "400",
    codeLineHeight: "1.65",
    codePaddingBlock: "1rem",
    codePaddingInline: "1.35rem",
    codeBackground: ({ theme }) => theme.colors["editor.background"],
    codeForeground: ({ theme }) => theme.colors["editor.foreground"],
    codeSelectionBackground: ({ theme }) => theme.colors["editor.selectionBackground"],
    // Gutter
    gutterBorderColor: ({ resolveSetting }) => setAlpha(resolveSetting("gutterForeground"), 0.2),
    gutterBorderWidth: "1.5px",
    gutterForeground: ({ theme, resolveSetting }) => ensureColorContrastOnBackground(theme.colors["editorLineNumber.foreground"] || resolveSetting("codeForeground"), resolveSetting("codeBackground"), 3.3, 3.6),
    gutterHighlightForeground: ({ theme, resolveSetting }) => ensureColorContrastOnBackground(
      theme.colors["editorLineNumber.activeForeground"] || theme.colors["editorLineNumber.foreground"] || resolveSetting("codeForeground"),
      resolveSetting("codeBackground"),
      4.5,
      5
    ),
    // UI elements
    uiFontFamily: minifyFontFamily(
      `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`
    ),
    uiFontSize: "0.9rem",
    uiFontWeight: "400",
    uiLineHeight: "1.65",
    uiPaddingBlock: "0.25rem",
    uiPaddingInline: "1rem",
    uiSelectionBackground: ({ theme }) => theme.colors["menu.selectionBackground"],
    uiSelectionForeground: ({ theme }) => theme.colors["menu.selectionForeground"],
    // Special colors
    focusBorder: ({ theme }) => theme.colors["focusBorder"],
    scrollbarThumbColor: ({ theme, resolveSetting }) => ensureColorContrastOnBackground(theme.colors["scrollbarSlider.background"], resolveSetting("codeBackground"), 1, 2),
    scrollbarThumbHoverColor: ({ theme, resolveSetting }) => ensureColorContrastOnBackground(theme.colors["scrollbarSlider.hoverBackground"], resolveSetting("codeBackground"), 2.5, 3.5)
  },
  preventUnitlessValues: ["borderRadius", "borderWidth", "gutterBorderWidth"]
});
function getCoreBaseStyles({
  cssVar,
  useStyleReset,
  useThemedScrollbars,
  useThemedSelectionColors
}) {
  const ifThemedScrollbars = (css) => useThemedScrollbars ? css : "";
  const ifThemedSelectionColors = (css) => useThemedSelectionColors ? css : "";
  return `
		font-family: ${cssVar("uiFontFamily")};
		font-size: ${cssVar("uiFontSize")};
		font-weight: ${cssVar("uiFontWeight")};
		line-height: ${cssVar("uiLineHeight")};
		text-size-adjust: none;
		-webkit-text-size-adjust: none;

		*:not(:is(svg, svg *)) {
			${useStyleReset ? "all: revert;" : ""}
			box-sizing: border-box;
		}

		${ifThemedSelectionColors(`::selection {
			background: ${cssVar("uiSelectionBackground")};
			color: ${cssVar("uiSelectionForeground")};
		}`)}

		pre {
			display: flex;
			margin: 0;
			padding: 0;
			border: ${cssVar("borderWidth")} solid ${cssVar("borderColor")};
			border-radius: calc(${cssVar("borderRadius")} + ${cssVar("borderWidth")});
			background: ${cssVar("codeBackground")};

			&:focus-visible {
				outline: 3px solid ${cssVar("focusBorder")};
				outline-offset: -3px;
			}

			& > code {
				all: unset;
				display: block;
				flex: 1 0 100%;

				padding: ${cssVar("codePaddingBlock")} 0;
				color: ${cssVar("codeForeground")};

				font-family: ${cssVar("codeFontFamily")};
				font-size: ${cssVar("codeFontSize")};
				font-weight: ${cssVar("codeFontWeight")};
				line-height: ${cssVar("codeLineHeight")};
			}

			${ifThemedSelectionColors(`::selection {
				background: ${cssVar("codeSelectionBackground")};
				color: inherit;
			}`)}

			/* Show horizontal scrollbar if required */
			overflow-x: auto;

			/* Enable word wrapping on demand */
			&.wrap .${codeLineClass} .code {
				white-space: pre-wrap;
				overflow-wrap: break-word;
				min-width: min(20ch, var(--ecMaxLine, 20ch));
				& span.indent {
					white-space: pre;
				}
			}

			${ifThemedScrollbars(`
			&::-webkit-scrollbar,
			&::-webkit-scrollbar-track {
				background-color: inherit;
				border-radius: calc(${cssVar("borderRadius")} + ${cssVar("borderWidth")});
				border-top-left-radius: 0;
				border-top-right-radius: 0;
			}
			&::-webkit-scrollbar-thumb {
				background-color: ${cssVar("scrollbarThumbColor")};
				border: 4px solid transparent;
				background-clip: content-box;
				border-radius: 10px;
			}
			&::-webkit-scrollbar-thumb:hover {
				background-color: ${cssVar("scrollbarThumbHoverColor")};
			}
			`)}
		}

		/* Code lines */
		.${codeLineClass} {
			/* RTL support: Code is always LTR */
			direction: ltr;
			unicode-bidi: isolate;

			/* Prepare grid layout for optional gutter */
			display: grid;
			grid-template-areas: 'gutter code';
			grid-template-columns: auto 1fr;
			position: relative;

			.gutter {
				grid-area: gutter;
				color: ${cssVar("gutterForeground")};

				/* Make all gutter elements non-interactive by default */
				& > * {
					pointer-events: none;
					user-select: none;
					-webkit-user-select: none;
				}

				/* Apply conditional styles if a gutter is present */
				& ~ .code {
					--ecLineBrdCol: ${cssVar("gutterBorderColor")};
				}
			}

			&.highlight .gutter {
				color: ${cssVar("gutterHighlightForeground")};
			}

			.code {
				grid-area: code;
				position: relative;
				box-sizing: content-box;
				padding-inline-start: calc(var(--ecIndent, 0ch) + ${cssVar("codePaddingInline")} - var(--ecGtrBrdWd));
				padding-inline-end: ${cssVar("codePaddingInline")};
				text-indent: calc(var(--ecIndent, 0ch) * -1);

				&::before,
				&::after,
				& :where(*) {
					text-indent: 0;
				}

				/* Support a colorful border on the start of the code line */
				--ecGtrBrdWd: ${cssVar("gutterBorderWidth")};
				border-inline-start: var(--ecGtrBrdWd) solid var(--ecLineBrdCol, transparent);
			}
		}

		/* Common style to hide elements from screen readers */
		.sr-only {
			position: absolute;
			width: 1px;
			height: 1px;
			padding: 0;
			margin: -1px;
			overflow: hidden;
			clip: rect(0, 0, 0, 0);
			white-space: nowrap;
			border-width: 0;							
		}
	`;
}
function getCoreThemeStyles(styleVariantIndex) {
  return `
		/* Theme-dependent styles for InlineStyleAnnotation */
		.${codeLineClass} :where(span[style^='--']:not([class])) {
			color: var(--${styleVariantIndex}, inherit);
			background-color: var(--${styleVariantIndex}bg, transparent);
			font-style: var(--${styleVariantIndex}fs, inherit);
			font-weight: var(--${styleVariantIndex}fw, inherit);
			text-decoration: var(--${styleVariantIndex}td, inherit);
		}
	`;
}
function minifyFontFamily(fontFamily) {
  return fontFamily.split(",").map((font) => font.trim()).join(",");
}

// src/internal/style-resolving.ts
function resolveStyleSettings({
  theme,
  styleVariantIndex,
  plugins,
  styleOverrides
}) {
  const attemptedToResolve = /* @__PURE__ */ new Set();
  const resolvedByPath = /* @__PURE__ */ new Map();
  const resolverArgs = { theme, styleVariantIndex, resolveSetting };
  const unresolvedByPath = getStyleSettingsByPath(coreStyleSettings.defaultValues);
  plugins.forEach((plugin) => {
    if (!plugin.styleSettings)
      return;
    applyStyleSettings(unresolvedByPath, getStyleSettingsByPath(plugin.styleSettings.defaultValues));
  });
  applyStyleSettings(unresolvedByPath, getStyleSettingsByPath(styleOverrides ?? {}));
  applyStyleSettings(unresolvedByPath, getStyleSettingsByPath(theme.styleOverrides ?? {}));
  const preventUnitlessValues = new Set(coreStyleSettings.preventUnitlessValues);
  plugins.forEach((plugin) => {
    plugin.styleSettings?.preventUnitlessValues.forEach((path) => preventUnitlessValues.add(path));
  });
  function resolveSetting(settingPath) {
    let result = resolvedByPath.get(settingPath);
    if (result === void 0 && !resolvedByPath.has(settingPath)) {
      if (attemptedToResolve.has(settingPath))
        throw new Error(`Circular dependency detected while resolving style setting '${settingPath}'`);
      attemptedToResolve.add(settingPath);
      const valueOrResolver = unresolvedByPath.get(settingPath);
      const resolvedDefinition = typeof valueOrResolver === "function" ? valueOrResolver(resolverArgs) : valueOrResolver;
      result = Array.isArray(resolvedDefinition) ? resolvedDefinition[theme.type === "dark" ? 0 : 1] : resolvedDefinition;
      if (preventUnitlessValues.has(settingPath)) {
        result = result.trim();
        if (result in ["", "none"])
          result = "0px";
        if (result.match(/^[0-9.]+$/))
          result = `${result}px`;
      }
      resolvedByPath.set(settingPath, result);
    }
    if (result === void 0)
      throw new Error(
        `Failed to resolve style setting '${settingPath}' for theme '${theme.name}': The resolved value was undefined. This could be caused by your plugins or styleOverrides.`
      );
    return result;
  }
  unresolvedByPath.forEach((_, settingPath) => resolveSetting(settingPath));
  return resolvedByPath;
}
function getCssVarDeclarations({
  resolvedStyleSettings,
  plugins,
  cssVarName
}) {
  const cssVarDeclarations = /* @__PURE__ */ new Map();
  const excludedPaths = /* @__PURE__ */ new Set();
  plugins.forEach((plugin) => {
    plugin.styleSettings?.cssVarExclusions.forEach((path) => excludedPaths.add(path));
  });
  resolvedStyleSettings.forEach((value, path) => {
    if (excludedPaths.has(path))
      return;
    cssVarDeclarations.set(cssVarName(path), value);
  });
  return cssVarDeclarations;
}
function getStyleSettingsByPath(styleSettings) {
  const result = /* @__PURE__ */ new Map();
  for (const [key, value] of Object.entries(styleSettings)) {
    if (typeof value === "object" && !Array.isArray(value)) {
      Object.entries(value).forEach(([subKey, subValue]) => {
        result.set(`${key}.${subKey}`, subValue);
      });
    } else {
      result.set(key, value);
    }
  }
  return result;
}
function applyStyleSettings(target, source) {
  source.forEach((value, path) => value !== void 0 && target.set(path, value));
}

// src/common/style-variants.ts
function resolveStyleVariants({
  themes,
  plugins,
  styleOverrides,
  cssVarName
}) {
  return themes.map((theme, styleVariantIndex) => {
    const resolvedStyleSettings = resolveStyleSettings({ theme, styleVariantIndex, plugins, styleOverrides });
    const cssVarDeclarations = getCssVarDeclarations({ resolvedStyleSettings, plugins, cssVarName });
    return {
      theme,
      resolvedStyleSettings,
      cssVarDeclarations
    };
  });
}

// src/internal/tabindex-js-module.min.ts
var tabindex_js_module_min_default = 'try{(()=>{function a(e){if(!e)return;let t=e.getAttribute("tabindex")!==null,r=e.scrollWidth>e.clientWidth;r&&!t?(e.setAttribute("tabindex","0"),e.setAttribute("role","region")):!r&&t&&(e.removeAttribute("tabindex"),e.removeAttribute("role"))}var u=window.requestIdleCallback||(e=>setTimeout(e,1)),s=window.cancelIdleCallback||clearTimeout;function l(e){let t=new Set,r,n;return new ResizeObserver(c=>{c.forEach(o=>t.add(o.target)),r&&clearTimeout(r),n&&s(n),r=setTimeout(()=>{n&&s(n),n=u(()=>{t.forEach(o=>e(o)),t.clear()})},250)})}function i(e,t){e.querySelectorAll?.(".expressive-code pre > code").forEach(r=>{let n=r.parentElement;n&&t.observe(n)})}var d=l(a);i(document,d);var b=new MutationObserver(e=>e.forEach(t=>t.addedNodes.forEach(r=>{i(r,d)})));b.observe(document.body,{childList:!0,subtree:!0});document.addEventListener("astro:page-load",()=>{i(document,d)});})();}catch(e){console.error("[EC] tabindex-js-module failed:",e)}';

// src/internal/core-plugins.ts
var corePlugins = [
  {
    name: "Indent wrapper",
    hooks: {
      postprocessAnnotations: ({ codeBlock }) => {
        codeBlock.getLines().forEach((line) => {
          const indent = line.text.match(/^\s+/)?.[0].length ?? 0;
          if (indent > 0) {
            line.getAnnotations().forEach((annotation) => {
              const { inlineRange } = annotation;
              if (!inlineRange || !isInlineStyleAnnotation(annotation))
                return;
              if (inlineRange.columnStart >= 0 && inlineRange?.columnEnd <= indent) {
                line.deleteAnnotation(annotation);
              }
            });
            line.addAnnotation(
              new IndentAnnotation({
                inlineRange: { columnStart: 0, columnEnd: indent },
                renderPhase: "earlier"
              })
            );
          }
        });
      }
    }
  },
  {
    name: "Scrollable block tabindex",
    jsModules: [tabindex_js_module_min_default]
  }
];
var IndentAnnotation = class extends ExpressiveCodeAnnotation {
  render({ nodesToTransform }) {
    return nodesToTransform.map((node) => h("span.indent", node));
  }
};

// src/common/engine.ts
var ExpressiveCodeEngine = class {
  /**
   * Creates a new instance of the Expressive Code engine.
   *
   * To minimize overhead caused by loading plugins, you can create a single instance
   * for your application and keep using it to render all your code blocks.
   */
  constructor(config) {
    const deprecatedConfig = config;
    if (deprecatedConfig.theme && !config.themes) {
      config.themes = Array.isArray(deprecatedConfig.theme) ? deprecatedConfig.theme : [deprecatedConfig.theme];
      delete deprecatedConfig.theme;
    }
    this.themes = Array.isArray(config.themes) ? [...config.themes] : config.themes ? [config.themes] : [new ExpressiveCodeTheme(github_dark_default), new ExpressiveCodeTheme(github_light_default)];
    this.minSyntaxHighlightingColorContrast = config.minSyntaxHighlightingColorContrast ?? 5.5;
    this.useDarkModeMediaQuery = config.useDarkModeMediaQuery ?? (this.themes.length === 2 && this.themes[0].type !== this.themes[1].type);
    this.themeCssRoot = config.themeCssRoot ?? ":root";
    this.themeCssSelector = config.themeCssSelector ?? ((theme) => `[data-theme='${theme.name}']`);
    this.cascadeLayer = config.cascadeLayer ?? "";
    this.useStyleReset = config.useStyleReset ?? true;
    this.customizeTheme = config.customizeTheme;
    this.useThemedScrollbars = config.useThemedScrollbars ?? true;
    this.useThemedSelectionColors = config.useThemedSelectionColors ?? false;
    this.styleOverrides = { ...config.styleOverrides };
    this.defaultLocale = config.defaultLocale || "en-US";
    this.defaultProps = config.defaultProps || {};
    this.plugins = [...corePlugins, ...config.plugins?.flat() || []];
    this.logger = new ExpressiveCodeLogger(config.logger);
    this.plugins.forEach((plugin) => {
      plugin.styleSettings?.cssVarReplacements?.forEach(([search, replace]) => {
        cssVarReplacements.set(search, replace);
      });
    });
    this.themes = this.themes.map((theme, styleVariantIndex) => {
      if (this.customizeTheme) {
        theme = this.customizeTheme(theme) ?? theme;
      }
      if (this.minSyntaxHighlightingColorContrast > 0) {
        const themeStyleSettings = resolveStyleSettings({
          theme,
          styleVariantIndex,
          plugins: this.plugins,
          styleOverrides: this.styleOverrides
        });
        const codeBg = getFirstStaticColor(themeStyleSettings.get("codeBackground"));
        theme.ensureMinSyntaxHighlightingColorContrast(this.minSyntaxHighlightingColorContrast, codeBg);
      }
      return theme;
    });
    this.styleVariants = resolveStyleVariants({
      themes: this.themes,
      styleOverrides: this.styleOverrides,
      plugins: this.plugins,
      cssVarName: getCssVarName
    });
  }
  /**
   * Renders the given code block(s) and returns the rendered group & block ASTs,
   * the rendered code block contents after all transformations have been applied,
   * and a set of non-global CSS styles required by the rendered code blocks.
   *
   * In Expressive Code, all processing of your code blocks and their metadata
   * is performed by plugins. To render markup around lines or inline ranges of characters,
   * the `render` method calls the hook functions registered by all added plugins.
   *
   * @param input
   * The code block(s) to render. Can either be an `ExpressiveCodeBlockOptions` object
   * containing the properties required to create a new `ExpressiveCodeBlock` internally,
   * an existing `ExpressiveCodeBlock`, or an array containing any combination of these.
   *
   * @param options
   * Optional configuration options for the rendering process.
   */
  async render(input, options) {
    return await renderGroup({
      input,
      options,
      defaultLocale: this.defaultLocale,
      config: {
        ...this
      },
      plugins: this.plugins,
      // Also pass resolved style variants in case plugins need them
      ...this.getResolverContext()
    });
  }
  /**
   * Returns a string containing all CSS styles that should be added to every page
   * using Expressive Code. These styles are static base styles which do not depend
   * on the configured theme(s).
   *
   * The calling code must take care of actually adding the returned styles to the page.
   *
   * Please note that the styles contain references to CSS variables, which must also
   * be added to the page. These can be obtained by calling {@link getThemeStyles}.
   */
  async getBaseStyles() {
    const pluginStyles = [];
    const resolverContext = this.getResolverContext();
    pluginStyles.push({
      pluginName: "core",
      styles: getCoreBaseStyles({
        ...resolverContext,
        useStyleReset: this.useStyleReset,
        useThemedScrollbars: this.useThemedScrollbars,
        useThemedSelectionColors: this.useThemedSelectionColors
      })
    });
    for (const plugin of this.plugins) {
      if (!plugin.baseStyles)
        continue;
      const resolvedStyles = typeof plugin.baseStyles === "function" ? await plugin.baseStyles(resolverContext) : plugin.baseStyles;
      if (!resolvedStyles)
        continue;
      pluginStyles.push({
        pluginName: plugin.name,
        styles: resolvedStyles
      });
    }
    const processedStyles = await processPluginStyles(pluginStyles);
    return wrapInCascadeLayer([...processedStyles].join(""), this.cascadeLayer);
  }
  /**
   * Returns a string containing theme-dependent styles that should be added to every page
   * using Expressive Code. These styles contain CSS variable declarations that are generated
   * automatically based on the configured {@link ExpressiveCodeEngineConfig.themes themes},
   * {@link ExpressiveCodeEngineConfig.useDarkModeMediaQuery useDarkModeMediaQuery} and
   * {@link ExpressiveCodeEngineConfig.themeCssSelector themeCssSelector} config options.
   *
   * The first theme defined in the `themes` option is considered the "base theme",
   * for which a full set of CSS variables is declared and scoped to the selector
   * defined by the `themeCssRoot` option (defaults to `:root`).
   *
   * For all alternate themes, a differential set of CSS variables is declared for cases where
   * their values differ from the base theme, and scoped to theme-specific selectors that are
   * generated by combining `themeCssRoot` with the theme selector specified by this option.
   *
   * The calling code must take care of actually adding the returned styles to the page.
   *
   * Please note that these styles must be added to the page together with the base styles
   * returned by {@link getBaseStyles}.
   */
  async getThemeStyles() {
    const themeStyles = [];
    const renderDeclarations = (declarations) => [...declarations].map(([varName, varValue]) => `${varName}:${varValue}`).join(";");
    const { cssVarDeclarations: baseVars, theme: baseTheme } = this.styleVariants[0];
    const baseThemeSelector = this.themeCssSelector && this.themeCssSelector(baseTheme, { styleVariants: this.styleVariants });
    const notBaseThemeSelector = baseThemeSelector ? `:not(${baseThemeSelector})` : "";
    const baseThemeBlockInsideAlternateThemeRoot = notBaseThemeSelector && `${this.themeCssRoot}${notBaseThemeSelector} &${baseThemeSelector}`;
    const baseVarSelectors = [
      // Root selector without any specific theme selectors
      this.themeCssRoot,
      // Code blocks with base theme selector inside root with non-base theme selector
      baseThemeBlockInsideAlternateThemeRoot
    ].filter((selector) => selector).join(",");
    const baseThemeStyleSelectors = [
      // Code blocks with no specific theme selector
      "&",
      // Code blocks with base theme selector inside root with non-base theme selector
      baseThemeBlockInsideAlternateThemeRoot
    ].filter((selector) => selector).join(",");
    themeStyles.push(
      await scopeAndMinifyNestedCss(`
				${baseVarSelectors} {
					${renderDeclarations(baseVars)}
				}
				${baseThemeStyleSelectors} {
					${getCoreThemeStyles(0)}
				}
			`)
    );
    const alternateVariants = [];
    for (let styleVariantIndex = 1; styleVariantIndex < this.styleVariants.length; styleVariantIndex++) {
      const styleVariant = this.styleVariants[styleVariantIndex];
      const diffVars = /* @__PURE__ */ new Map();
      styleVariant.cssVarDeclarations.forEach((varValue, varName) => {
        if (baseVars.get(varName) !== varValue) {
          diffVars.set(varName, varValue);
        }
      });
      alternateVariants.push({
        theme: styleVariant.theme,
        cssVars: renderDeclarations(diffVars),
        coreStyles: getCoreThemeStyles(styleVariantIndex)
      });
    }
    if (this.useDarkModeMediaQuery) {
      const baseTheme2 = this.styleVariants[0].theme;
      const altType = baseTheme2.type === "dark" ? "light" : "dark";
      const firstAltVariant = alternateVariants.find((variant) => variant.theme.type === altType);
      if (!firstAltVariant)
        throw new Error(
          [
            `The config option "useDarkModeMediaQuery: true" requires at least`,
            `one dark and one light theme, but the following themes were given:`,
            this.themes.map((theme) => `${theme.name} (${theme.type})`).join(", ")
          ].join(" ")
        );
      const darkModeMediaQuery = await scopeAndMinifyNestedCss(`
				@media (prefers-color-scheme: ${altType}) {
					${this.themeCssRoot}${notBaseThemeSelector} {
						${firstAltVariant.cssVars}
					}
					${this.themeCssRoot}${notBaseThemeSelector} & {
						${firstAltVariant.coreStyles}
					}
				}
			`);
      themeStyles.push(darkModeMediaQuery);
    }
    if (this.themeCssSelector !== false) {
      for (const { theme, cssVars, coreStyles } of alternateVariants) {
        const themeSelector = this.themeCssSelector && this.themeCssSelector(theme, { styleVariants: this.styleVariants });
        if (!themeSelector)
          continue;
        themeStyles.push(
          await scopeAndMinifyNestedCss(`
						${this.themeCssRoot}${themeSelector} &${notBaseThemeSelector}, &${themeSelector} {
							${cssVars};
							${coreStyles}
						}
					`)
        );
      }
    }
    return wrapInCascadeLayer(themeStyles.join(""), this.cascadeLayer);
  }
  /**
   * Returns an array of JavaScript modules (pure code without any wrapping `script` tags)
   * that should be added to every page containing code blocks.
   *
   * The contents are collected from the `jsModules` property of all registered plugins.
   * Any duplicates are removed.
   *
   * The calling code must take care of actually adding the collected scripts to the page.
   * For example, it could create site-wide JavaScript files from the returned modules
   * and refer to them in a script tag with `type="module"`, or it could insert them
   * into inline `<script type="module">` elements.
   */
  async getJsModules() {
    const jsModules = /* @__PURE__ */ new Set();
    for (const plugin of this.plugins) {
      const pluginModules = typeof plugin.jsModules === "function" ? await plugin.jsModules(this.getResolverContext()) : plugin.jsModules;
      pluginModules?.forEach((moduleCode) => {
        moduleCode = moduleCode.trim();
        if (moduleCode)
          jsModules.add(moduleCode);
      });
    }
    return [...jsModules];
  }
  cssVar(styleSetting, fallbackValue) {
    return `var(${getCssVarName(styleSetting)}${fallbackValue ? `, ${fallbackValue}` : ""})`;
  }
  getResolverContext() {
    return {
      cssVar: (styleSetting, fallbackValue) => this.cssVar(styleSetting, fallbackValue),
      cssVarName: getCssVarName,
      styleVariants: this.styleVariants
    };
  }
  themes;
  minSyntaxHighlightingColorContrast;
  useDarkModeMediaQuery;
  themeCssRoot;
  themeCssSelector;
  cascadeLayer;
  useStyleReset;
  customizeTheme;
  useThemedScrollbars;
  useThemedSelectionColors;
  styleOverrides;
  styleVariants;
  defaultLocale;
  defaultProps;
  plugins;
  logger;
};

// src/common/plugin-data.ts
var AttachedPluginData = class {
  dataStorage = /* @__PURE__ */ new WeakMap();
  getInitialValueFn;
  constructor(getInitialValueFn) {
    this.getInitialValueFn = getInitialValueFn;
  }
  getOrCreateFor(target) {
    let data = this.dataStorage.get(target);
    if (data === void 0) {
      data = this.getInitialValueFn();
      this.dataStorage.set(target, data);
    }
    return data;
  }
  setFor(target, data) {
    this.dataStorage.set(target, data);
  }
};

// src/common/plugin-texts.ts
var PluginTexts = class {
  defaultTexts;
  localizedTexts = /* @__PURE__ */ new Map();
  overridesByLocale = /* @__PURE__ */ new Map();
  constructor(defaultTexts) {
    this.defaultTexts = defaultTexts;
  }
  /**
   * Adds localized texts for a specific locale. You must provide a full set of localized texts
   * for the given locale.
   *
   * It is recommended to use two-letter language codes (e.g. `de`, `fr`, `es`) without region
   * codes to make your localized texts available to all users speaking the same language.
   * Region codes should only be added if regional differences must be taken into account.
   *
   * Plugin authors can use this to provide localized versions of their texts.
   * Users can also call this function to provide their own localizations.
   *
   * If you only want to customize a few texts of an existing localization,
   * have a look at `overrideTexts` instead.
   */
  addLocale(locale, localizedTexts) {
    locale = this.parseLocale(locale).locale;
    this.localizedTexts.set(locale, localizedTexts);
  }
  /**
   * Allows you to override any defined texts. This is useful if you want to customize a few
   * selected texts without having to provide a full set of localized texts.
   *
   * You can either override texts for a specific `locale`, or override the default texts
   * by setting `locale` to `undefined`.
   *
   * It is recommended to use two-letter language codes (e.g. `de`, `fr`, `es`) without region
   * codes to apply your overrides to all users speaking the same language.
   * Region codes should only be added if regional differences must be taken into account.
   */
  overrideTexts(locale, localeTextOverrides) {
    locale = locale && this.parseLocale(locale).locale;
    const localeOverrides = this.overridesByLocale.get(locale) || this.overridesByLocale.set(locale, {}).get(locale);
    Object.assign(localeOverrides, localeTextOverrides);
  }
  /**
   * Returns the best matching texts for the requested locale,
   * taking any available localized texts and overrides into account.
   *
   * Example for locale `de-DE`:
   * - If localized texts for `de-DE` are available, these will be returned.
   * - If `de-DE` is not available, but `de` is, these will be returned.
   * - As the final fallback, the default texts will be returned.
   */
  get(locale) {
    const { acceptedLocales } = this.parseLocale(locale);
    const localizedTexts = this.getLocalizedTexts(acceptedLocales);
    return this.applyOverrides(localizedTexts, acceptedLocales);
  }
  parseLocale(locale) {
    const parts = locale.trim().toLowerCase().split(/[-_]/);
    const language = parts[0];
    const region = parts[1];
    const normalizedLocale = region ? `${language}-${region}` : language;
    const acceptedLocales = [];
    acceptedLocales.push(language);
    if (region)
      acceptedLocales.push(normalizedLocale);
    return {
      language,
      region,
      locale: normalizedLocale,
      acceptedLocales
    };
  }
  getLocalizedTexts(acceptedLocales) {
    for (const acceptedLocale of acceptedLocales) {
      const localizedTexts = this.localizedTexts.get(acceptedLocale);
      if (localizedTexts) {
        return localizedTexts;
      }
    }
    return this.defaultTexts;
  }
  applyOverrides(texts, acceptedLocales) {
    const result = { ...texts };
    const overrides = [...acceptedLocales, void 0].map((locale) => this.overridesByLocale.get(locale)).filter((x) => x);
    if (overrides.length) {
      const keys = Object.keys(texts);
      keys.forEach((key) => {
        for (const override of overrides) {
          const overrideValue = override?.[key];
          if (overrideValue) {
            result[key] = overrideValue;
            return;
          }
        }
      });
    }
    return result;
  }
};

// src/common/plugin.ts
function definePlugin(plugin) {
  return plugin;
}

// src/helpers/assets.ts
function createInlineSvgUrl(svgContents, options = {}) {
  const { keepSize = false } = options;
  let svgString = Array.isArray(svgContents) ? svgContents.join("") : svgContents;
  svgString = svgString.replace(/^\s*(<svg)\s+([^>]+)\s*(\/?>)/, (match, tagStart, attrs, tagEnd) => {
    if (typeof attrs !== "string")
      return match;
    if (!keepSize)
      attrs = attrs.replaceAll(/(?:width|height)\s*=\s*(?:(["'])[\w\s]*\1|\d+)\s*/g, "");
    return `${tagStart} ${attrs}${tagEnd}`;
  });
  return `url("data:image/svg+xml,${encodeURIComponent(svgString)}")`;
}

// src/helpers/ast.ts
var addClassName2 = addClassName;
var getClassNames2 = getClassNames;
var getInlineStyles2 = getInlineStyles;
var removeClassName2 = removeClassName;
var setInlineStyle2 = setInlineStyle;
var setInlineStyles2 = setInlineStyles;
var setProperty2 = setProperty;

// src/helpers/i18n.ts
function formatTemplate(template, variables) {
  const getReplacement = (varName, ...choices) => {
    const value = variables[varName];
    if (value === void 0)
      throw new Error(`Unknown variable name "${varName}" found in string template "${template}". Available variables: ${JSON.stringify(Object.keys(variables))}`);
    if (!choices.length)
      return value.toString();
    const parsedChoices = choices.map((choice) => {
      const condition = choice.match(/^\s*(<|>|)\s*(-?[0-9.]+?)\s*=\s?/);
      if (!condition)
        return { text: choice.replace(/^\s/, "") };
      const [fullMatch, operator, conditionValue] = condition;
      const number = Number.parseFloat(conditionValue);
      if (isNaN(number))
        throw new Error(`Expected condition value "${conditionValue}" to be a number in string template "${template}".`);
      if (typeof value !== "number")
        throw new Error(
          `Condition "${operator}${conditionValue}" in string template "${template}" requires variable "${varName}" to be a number, but it's ${JSON.stringify(value)}.`
        );
      return {
        condition: {
          operator: operator || "=",
          number
        },
        text: choice.slice(fullMatch.length)
      };
    });
    const catchAllCount = parsedChoices.filter((choice) => !choice.condition).length;
    if (catchAllCount !== 1)
      throw new Error(`Expected exactly 1 catch-all choice for variable "${varName}", but found ${catchAllCount} in string template "${template}".`);
    for (const { condition, text } of parsedChoices) {
      if (!condition)
        return text;
      if (typeof value !== "number")
        continue;
      const conditionIsMatching = (
        // Less than
        condition.operator === "<" && value < condition.number || // Greater than
        condition.operator === ">" && value > condition.number || // Equals
        condition.operator === "=" && value === condition.number
      );
      if (conditionIsMatching)
        return text;
    }
    return "";
  };
  let result = template;
  result = result.replace(/(?<!\\)\\{/g, "\f(").replace(/(?<!\\)\\}/g, "\f)");
  result = result.replace(/\\(\\[{}])/g, "$1");
  const innermostPlaceholderRegex = /\{([^{]*?)\}/g;
  let keepGoing = true;
  while (keepGoing) {
    keepGoing = false;
    result = result.replace(innermostPlaceholderRegex, (match, contents) => {
      keepGoing = true;
      const [varName, ...choices] = contents.split(";");
      return getReplacement(varName, ...choices).replace(/{/g, "\f(").replace(/}/g, "\f)");
    });
  }
  result = result.replace(/\f\(/g, "{").replace(/\f\)/g, "}");
  return result;
}

// ../../../node_modules/.pnpm/djb2a@2.0.0/node_modules/djb2a/index.js
var MAGIC_CONSTANT = 5381;
function djb2a(string) {
  let hash = MAGIC_CONSTANT;
  for (let index = 0; index < string.length; index++) {
    hash = (hash << 5) + hash ^ string.charCodeAt(index);
  }
  return hash >>> 0;
}

// src/helpers/objects.ts
function stableStringify(obj, options = {}) {
  const { includeFunctionContents = false } = options;
  const visited = /* @__PURE__ */ new WeakSet();
  const toJson = (value) => {
    if (typeof value === "object" && value !== null) {
      if (visited.has(value)) {
        return "[Circular]";
      }
      visited.add(value);
      let result;
      if (Array.isArray(value)) {
        result = value.map(toJson);
      } else {
        const objValue = value;
        const sortedKeys = Object.keys(objValue).sort();
        const sortedObj = {};
        for (const key of sortedKeys) {
          sortedObj[key] = toJson(objValue[key]);
        }
        result = sortedObj;
      }
      visited.delete(value);
      return result;
    }
    if (typeof value === "function") {
      return includeFunctionContents ? value.toString() : "[Function]";
    }
    return value;
  };
  if (obj === void 0)
    return "undefined";
  return JSON.stringify(toJson(obj));
}
function getStableObjectHash(obj, options = {}) {
  const { includeFunctionContents = false, hashLength = 5 } = options;
  const numericHash = djb2a(stableStringify(obj, { includeFunctionContents }));
  const padding = "0".repeat(hashLength);
  return (padding + numericHash.toString(36)).slice(-hashLength);
}

// src/index.ts
var cssVarReplacements2 = cssVarReplacements;
export {
  AnnotationRenderPhaseOrder,
  AttachedPluginData,
  ExpressiveCodeAnnotation,
  ExpressiveCodeBlock,
  ExpressiveCodeEngine,
  ExpressiveCodeLine,
  ExpressiveCodeTheme,
  InlineStyleAnnotation,
  MetaOptions,
  PluginStyleSettings,
  PluginTexts,
  addClassName2 as addClassName,
  changeAlphaToReachColorContrast,
  changeLuminanceToReachColorContrast,
  chromaticRecolor,
  codeLineClass,
  createInlineSvgUrl,
  cssVarReplacements2 as cssVarReplacements,
  darken,
  definePlugin,
  ensureColorContrastOnBackground,
  formatTemplate,
  getClassNames2 as getClassNames,
  getColorContrast,
  getColorContrastOnBackground,
  getCssVarName,
  getFirstStaticColor,
  getInlineStyles2 as getInlineStyles,
  getLuminance,
  getStableObjectHash,
  getStaticBackgroundColor,
  isInlineStyleAnnotation,
  lighten,
  mix,
  multiplyAlpha,
  onBackground,
  removeClassName2 as removeClassName,
  resolveStyleVariants,
  runHooks,
  setAlpha,
  setInlineStyle2 as setInlineStyle,
  setInlineStyles2 as setInlineStyles,
  setLuminance,
  setProperty2 as setProperty,
  stableStringify,
  toHexColor,
  toRgbaString,
  validateExpressiveCodeAnnotation
};
//# sourceMappingURL=index.js.map