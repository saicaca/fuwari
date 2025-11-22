var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../../node_modules/.pnpm/parse-numeric-range@1.3.0/node_modules/parse-numeric-range/index.js
var require_parse_numeric_range = __commonJS({
  "../../../node_modules/.pnpm/parse-numeric-range@1.3.0/node_modules/parse-numeric-range/index.js"(exports, module) {
    "use strict";
    function parsePart(string) {
      let res = [];
      let m;
      for (let str of string.split(",").map((str2) => str2.trim())) {
        if (/^-?\d+$/.test(str)) {
          res.push(parseInt(str, 10));
        } else if (m = str.match(/^(-?\d+)(-|\.\.\.?|\u2025|\u2026|\u22EF)(-?\d+)$/)) {
          let [_, lhs, sep, rhs] = m;
          if (lhs && rhs) {
            lhs = parseInt(lhs);
            rhs = parseInt(rhs);
            const incr = lhs < rhs ? 1 : -1;
            if (sep === "-" || sep === ".." || sep === "\u2025")
              rhs += incr;
            for (let i = lhs; i !== rhs; i += incr)
              res.push(i);
          }
        }
      }
      return res;
    }
    exports.default = parsePart;
    module.exports = parsePart;
  }
});

// src/index.ts
var import_parse_numeric_range = __toESM(require_parse_numeric_range(), 1);
import {
  AnnotationRenderPhaseOrder,
  InlineStyleAnnotation,
  ensureColorContrastOnBackground,
  getStaticBackgroundColor,
  isInlineStyleAnnotation,
  onBackground
} from "@expressive-code/core";

// src/marker-types.ts
var MarkerTypeOrder = ["mark", "del", "ins"];
function markerTypeFromString(input) {
  if (input === "add")
    input = "ins";
  if (input === "rem")
    input = "del";
  const markerType = input;
  return MarkerTypeOrder.includes(markerType) ? markerType : void 0;
}

// src/styles.ts
import { PluginStyleSettings, codeLineClass, toHexColor } from "@expressive-code/core";
var textMarkersStyleSettings = new PluginStyleSettings({
  defaultValues: {
    textMarkers: {
      lineMarkerAccentMargin: "0rem",
      lineMarkerAccentWidth: "0.15rem",
      lineMarkerLabelPaddingInline: "0.2rem",
      lineMarkerLabelColor: "white",
      lineDiffIndicatorMarginLeft: "0.3rem",
      inlineMarkerBorderWidth: "1.5px",
      inlineMarkerBorderRadius: "0.2rem",
      inlineMarkerPadding: "0.15rem",
      // Define base colors for all markers in the LCH color space,
      // which leads to consistent perceived brightness independent of hue
      markHue: "284",
      insHue: "136",
      delHue: "33",
      defaultChroma: "40",
      defaultLuminance: ["32%", "75%"],
      backgroundOpacity: "50%",
      borderLuminance: "48%",
      borderOpacity: "81.6%",
      indicatorLuminance: ["67%", "40%"],
      indicatorOpacity: "81.6%",
      // You can use these to override the diff indicator content
      insDiffIndicatorContent: "'+'",
      delDiffIndicatorContent: "'-'",
      // The settings below will be calculated based on the settings above
      markBackground: (context) => resolveBg(context, "textMarkers.markHue"),
      markBorderColor: (context) => resolveBorder(context, "textMarkers.markHue"),
      insBackground: (context) => resolveBg(context, "textMarkers.insHue"),
      insBorderColor: (context) => resolveBorder(context, "textMarkers.insHue"),
      insDiffIndicatorColor: (context) => resolveIndicator(context, "textMarkers.insHue"),
      delBackground: (context) => resolveBg(context, "textMarkers.delHue"),
      delBorderColor: (context) => resolveBorder(context, "textMarkers.delHue"),
      delDiffIndicatorColor: (context) => resolveIndicator(context, "textMarkers.delHue")
    }
  },
  cssVarExclusions: [
    // Exclude all settings from CSS variable output that will not be used directly in styles,
    // but instead be used to calculate other settings
    "textMarkers.markHue",
    "textMarkers.insHue",
    "textMarkers.delHue",
    "textMarkers.defaultChroma",
    "textMarkers.defaultLuminance",
    "textMarkers.backgroundOpacity",
    "textMarkers.borderLuminance",
    "textMarkers.borderOpacity",
    "textMarkers.indicatorLuminance",
    "textMarkers.indicatorOpacity"
  ],
  preventUnitlessValues: ["textMarkers.lineMarkerLabelPaddingInline", "textMarkers.lineMarkerAccentWidth"]
});
function getTextMarkersBaseStyles({ cssVar }) {
  const result = `
		.${codeLineClass} {
			/* Support line-level mark/ins/del */
			&.mark {
				--tmLineBgCol: ${cssVar("textMarkers.markBackground")};
				& .code {
					--ecLineBrdCol: ${cssVar("textMarkers.markBorderColor")};
				}
			}
			&.ins {
				--tmLineBgCol: ${cssVar("textMarkers.insBackground")};
				--tmLabel: ${cssVar("textMarkers.insDiffIndicatorContent")};
				& .code {
					--ecLineBrdCol: ${cssVar("textMarkers.insBorderColor")};
					&::before {
						color: ${cssVar("textMarkers.insDiffIndicatorColor")};
					}
				}
			}
			&.del {
				--tmLineBgCol: ${cssVar("textMarkers.delBackground")};
				--tmLabel: ${cssVar("textMarkers.delDiffIndicatorContent")};
				& .code {
					--ecLineBrdCol: ${cssVar("textMarkers.delBorderColor")};
					&::before {
						color: ${cssVar("textMarkers.delDiffIndicatorColor")};
					}
				}
			}
			&.mark,
			&.ins,
			&.del {
				background: var(--tmLineBgCol);

				& .code {
					--ecGtrBrdWd: ${cssVar("textMarkers.lineMarkerAccentWidth")};
				}
				& .code::before {
					display: block;
					position: absolute;
					left: 0;
					box-sizing: border-box;
					content: var(--tmLabel, ' ');
					padding-inline-start: ${cssVar("textMarkers.lineDiffIndicatorMarginLeft")};
					text-align: center;
					/* Prevent long labels from wrapping to avoid overlapping the code */
					white-space: pre;
				}

				&.tm-label {
					& .code::before {
						background: var(--ecLineBrdCol);
						padding: 0 calc(${cssVar("textMarkers.lineMarkerLabelPaddingInline")} + ${cssVar("textMarkers.lineMarkerAccentWidth")}) 0 ${cssVar("textMarkers.lineMarkerLabelPaddingInline")};
						color: ${cssVar("textMarkers.lineMarkerLabelColor")};
					}
				}
			}

			/* Support inline mark/ins/del */
			& mark {
				--tmInlineBgCol: ${cssVar("textMarkers.markBackground")};
				--tmInlineBrdCol: ${cssVar("textMarkers.markBorderColor")};
			}
			& ins {
				--tmInlineBgCol: ${cssVar("textMarkers.insBackground")};
				--tmInlineBrdCol: ${cssVar("textMarkers.insBorderColor")};
			}
			& del {
				--tmInlineBgCol: ${cssVar("textMarkers.delBackground")};
				--tmInlineBrdCol: ${cssVar("textMarkers.delBorderColor")};
			}
			& mark,
			& ins,
			& del {
				all: unset;
				display: inline-block;
				position: relative;
				--tmBrdL: ${cssVar("textMarkers.inlineMarkerBorderWidth")};
				--tmBrdR: ${cssVar("textMarkers.inlineMarkerBorderWidth")};
				--tmRadL: ${cssVar("textMarkers.inlineMarkerBorderRadius")};
				--tmRadR: ${cssVar("textMarkers.inlineMarkerBorderRadius")};
				margin-inline: 0.025rem;
				padding-inline: ${cssVar("textMarkers.inlineMarkerPadding")};
				border-radius: var(--tmRadL) var(--tmRadR) var(--tmRadR) var(--tmRadL);
				background: var(--tmInlineBgCol);
				background-clip: padding-box;

				&.open-start {
					margin-inline-start: 0;
					padding-inline-start: 0;
					--tmBrdL: 0px;
					--tmRadL: 0;
				}
				&.open-end {
					margin-inline-end: 0;
					padding-inline-end: 0;
					--tmBrdR: 0px;
					--tmRadR: 0;
				}
				&::before {
					content: '';
					position: absolute;
					pointer-events: none;
					display: inline-block;
					inset: 0;
					border-radius: var(--tmRadL) var(--tmRadR) var(--tmRadR) var(--tmRadL);
					border: ${cssVar("textMarkers.inlineMarkerBorderWidth")} solid var(--tmInlineBrdCol);
					border-inline-width: var(--tmBrdL) var(--tmBrdR);
				}
			}
		}
	`;
  return result;
}
var markerBgColorPaths = {
  mark: "textMarkers.markBackground",
  ins: "textMarkers.insBackground",
  del: "textMarkers.delBackground"
};
function resolveBg({ resolveSetting: r }, hue) {
  return toHexColor(`lch(${r("textMarkers.defaultLuminance")} ${r("textMarkers.defaultChroma")} ${r(hue)} / ${r("textMarkers.backgroundOpacity")})`);
}
function resolveBorder({ resolveSetting: r }, hue) {
  return toHexColor(`lch(${r("textMarkers.borderLuminance")} ${r("textMarkers.defaultChroma")} ${r(hue)} / ${r("textMarkers.borderOpacity")})`);
}
function resolveIndicator({ resolveSetting: r }, hue) {
  return toHexColor(`lch(${r("textMarkers.indicatorLuminance")} ${r("textMarkers.defaultChroma")} ${r(hue)} / ${r("textMarkers.indicatorOpacity")})`);
}

// src/utils.ts
function getGroupIndicesFromRegExpMatch(match) {
  let groupIndices = match.indices;
  if (groupIndices?.length)
    return groupIndices;
  const fullMatchIndex = match.index;
  groupIndices = match.map((groupValue) => {
    const groupIndex = groupValue ? match[0].indexOf(groupValue) : -1;
    if (groupIndex === -1)
      return null;
    const groupStart = fullMatchIndex + groupIndex;
    const groupEnd = groupStart + groupValue.length;
    return [groupStart, groupEnd];
  });
  return groupIndices;
}
function toDefinitionsArray(value) {
  if (value === void 0)
    return [];
  return Array.isArray(value) ? value : [value];
}

// src/inline-markers.ts
function getInlineSearchTermMatches(lineText, codeBlock) {
  const markerMatches = [];
  MarkerTypeOrder.forEach((markerType) => {
    toDefinitionsArray(codeBlock.props[markerType]).forEach((definition) => {
      if (typeof definition === "string") {
        let idx = lineText.indexOf(definition, 0);
        while (idx > -1) {
          markerMatches.push({
            markerType,
            start: idx,
            end: idx + definition.length
          });
          idx = lineText.indexOf(definition, idx + definition.length);
        }
      }
      if (definition instanceof RegExp) {
        const matches = lineText.matchAll(definition);
        for (const match of matches) {
          const rawGroupIndices = getGroupIndicesFromRegExpMatch(match);
          let groupIndices = rawGroupIndices.flatMap((range) => range ? [range] : []);
          if (!groupIndices.length) {
            const fullMatchIndex = match.index;
            groupIndices = [[fullMatchIndex, fullMatchIndex + match[0].length]];
          }
          if (groupIndices.length > 1) {
            groupIndices.shift();
          }
          groupIndices.forEach((range) => {
            markerMatches.push({
              markerType,
              start: range[0],
              end: range[1]
            });
          });
        }
      }
    });
  });
  return markerMatches;
}
function flattenInlineMarkerRanges(markerRanges) {
  const flattenedRanges = [];
  const addRange = (newRange) => {
    for (let idx = flattenedRanges.length - 1; idx >= 0; idx--) {
      const curRange = flattenedRanges[idx];
      if (newRange.end <= curRange.start || newRange.start >= curRange.end)
        continue;
      if (newRange.start <= curRange.start && newRange.end >= curRange.end) {
        flattenedRanges.splice(idx, 1);
        continue;
      }
      if (newRange.markerType === curRange.markerType) {
        flattenedRanges.splice(idx, 1);
        newRange = {
          ...newRange,
          start: Math.min(newRange.start, curRange.start),
          end: Math.max(newRange.end, curRange.end)
        };
        continue;
      }
      if (newRange.start > curRange.start && newRange.end < curRange.end) {
        flattenedRanges.splice(idx, 1, { ...curRange, end: newRange.start }, { ...curRange, start: newRange.end });
        continue;
      }
      if (newRange.start > curRange.start) {
        curRange.end = newRange.start;
      }
      if (newRange.end < curRange.end) {
        curRange.start = newRange.end;
      }
    }
    flattenedRanges.push(newRange);
    flattenedRanges.sort((a, b) => a.start - b.start);
  };
  MarkerTypeOrder.forEach((markerType) => {
    markerRanges.filter((range) => range.markerType === markerType).forEach(addRange);
  });
  return flattenedRanges;
}

// src/annotations.ts
import { ExpressiveCodeAnnotation } from "@expressive-code/core";
import { addClassName, h, setInlineStyle } from "@expressive-code/core/hast";
var TextMarkerAnnotation = class extends ExpressiveCodeAnnotation {
  markerType;
  backgroundColor;
  label;
  constructor({ markerType, backgroundColor, label, ...baseOptions }) {
    super(baseOptions);
    this.markerType = markerType;
    this.backgroundColor = backgroundColor;
    this.label = label;
  }
  render(options) {
    if (!this.inlineRange)
      return this.renderFullLineMarker(options);
    return this.renderInlineMarker(options);
  }
  renderFullLineMarker({ nodesToTransform }) {
    return nodesToTransform.map((node) => {
      if (node.type === "element") {
        addClassName(node, "highlight");
        addClassName(node, this.markerType);
        if (this.label) {
          addClassName(node, "tm-label");
          setInlineStyle(node, "--tmLabel", this.label, "string");
        }
      }
      return node;
    });
  }
  renderInlineMarker({ nodesToTransform }) {
    return nodesToTransform.map((node, idx) => {
      const transformedNode = h(this.markerType, node);
      if (nodesToTransform.length > 0 && idx > 0) {
        addClassName(transformedNode, "open-start");
      }
      if (nodesToTransform.length > 0 && idx < nodesToTransform.length - 1) {
        addClassName(transformedNode, "open-end");
      }
      return transformedNode;
    });
  }
};

// src/index.ts
function pluginTextMarkers() {
  return {
    name: "TextMarkers",
    styleSettings: textMarkersStyleSettings,
    baseStyles: (context) => getTextMarkersBaseStyles(context),
    hooks: {
      preprocessLanguage: ({ codeBlock }) => {
        const lang = codeBlock.metaOptions.getString("lang");
        if (lang && codeBlock.language === "diff") {
          codeBlock.language = lang;
          codeBlock.props.useDiffSyntax = true;
        }
      },
      preprocessMetadata: ({ codeBlock, cssVar }) => {
        const addDefinition = (target, definition) => {
          const definitions = toDefinitionsArray(codeBlock.props[target]);
          definitions.push(definition);
          codeBlock.props[target] = definitions;
        };
        codeBlock.metaOptions.list([...MarkerTypeOrder, "", "add", "rem"]).forEach((option) => {
          const { kind, key, value } = option;
          const markerType = markerTypeFromString(key || "mark");
          if (!markerType)
            return;
          if (kind === "string" || kind === "regexp")
            addDefinition(markerType, value);
          if (kind === "range") {
            let label = void 0;
            const range = value.replace(/^\s*?(["'])((?:(?!\1).)+?)\1:\s*?/, (_match, _quote, labelValue) => {
              label = labelValue;
              return "";
            });
            addDefinition(markerType, { range, label });
          }
        });
        codeBlock.props.useDiffSyntax = codeBlock.metaOptions.getBoolean("useDiffSyntax") ?? codeBlock.props.useDiffSyntax;
        MarkerTypeOrder.forEach((markerType) => {
          toDefinitionsArray(codeBlock.props[markerType]).forEach((definition) => {
            if (typeof definition === "string" || definition instanceof RegExp)
              return;
            const objDefinition = typeof definition === "number" ? { range: `${definition}` } : definition;
            const { range = "", label } = objDefinition;
            const lineNumbers = (0, import_parse_numeric_range.default)(range);
            lineNumbers.forEach((lineNumber, idx) => {
              const lineIndex = lineNumber - 1;
              codeBlock.getLine(lineIndex)?.addAnnotation(
                new TextMarkerAnnotation({
                  markerType,
                  backgroundColor: cssVar(markerBgColorPaths[markerType]),
                  // Add a label to the first line of each consecutive range
                  label: idx === 0 || lineNumber - lineNumbers[idx - 1] !== 1 ? label : void 0
                })
              );
            });
          });
        });
      },
      preprocessCode: ({ codeBlock, cssVar }) => {
        if (codeBlock.language === "diff" || codeBlock.props.useDiffSyntax) {
          const lines = codeBlock.getLines();
          const couldBeRealDiffFile = lines.slice(0, 4).some((line) => line.text.match(/^([*+-]{3}\s|@@\s|[0-9,]+[acd][0-9,]+\s*$)/));
          if (!couldBeRealDiffFile) {
            let minIndentation = Infinity;
            const parsedLines = lines.map((line) => {
              const [, indentation, marker, content] = line.text.match(/^(([+-](?![+-]))?\s*)(.*)$/) || [];
              const markerType = marker === "+" ? "ins" : marker === "-" ? "del" : void 0;
              if (content.trim().length > 0 && indentation.length < minIndentation)
                minIndentation = indentation.length;
              return {
                line,
                markerType
              };
            });
            parsedLines.forEach(({ line, markerType }) => {
              const colsToRemove = minIndentation || (markerType ? 1 : 0);
              if (colsToRemove > 0)
                line.editText(0, colsToRemove, "");
              if (markerType) {
                line.addAnnotation(
                  new TextMarkerAnnotation({
                    markerType,
                    backgroundColor: cssVar(markerBgColorPaths[markerType])
                  })
                );
              }
            });
          }
        }
      },
      annotateCode: ({ codeBlock, cssVar }) => {
        codeBlock.getLines().forEach((line) => {
          const markerRanges = getInlineSearchTermMatches(line.text, codeBlock);
          if (!markerRanges.length)
            return;
          const flattenedRanges = flattenInlineMarkerRanges(markerRanges);
          flattenedRanges.forEach(({ markerType, start, end }) => {
            line.addAnnotation(
              new TextMarkerAnnotation({
                markerType,
                backgroundColor: cssVar(markerBgColorPaths[markerType]),
                inlineRange: {
                  columnStart: start,
                  columnEnd: end
                }
              })
            );
          });
        });
      },
      postprocessAnnotations: ({ codeBlock, styleVariants, config }) => {
        if (config.minSyntaxHighlightingColorContrast <= 0)
          return;
        codeBlock.getLines().forEach((line) => {
          const annotations = line.getAnnotations();
          const markers = [];
          let fullLineMarker = void 0;
          for (const annotation of annotations) {
            if (!(annotation instanceof TextMarkerAnnotation))
              continue;
            if (annotation.inlineRange) {
              markers.push(annotation);
              continue;
            }
            if (fullLineMarker) {
              if (MarkerTypeOrder.indexOf(annotation.markerType) < MarkerTypeOrder.indexOf(fullLineMarker.markerType))
                continue;
              if (AnnotationRenderPhaseOrder.indexOf(annotation.renderPhase || "normal") < AnnotationRenderPhaseOrder.indexOf(fullLineMarker.renderPhase || "normal"))
                continue;
            }
            fullLineMarker = annotation;
          }
          if (fullLineMarker)
            markers.unshift(fullLineMarker);
          styleVariants.forEach((styleVariant, styleVariantIndex) => {
            const fullLineMarkerBgColor = fullLineMarker && styleVariant.resolvedStyleSettings.get(markerBgColorPaths[fullLineMarker.markerType]) || "transparent";
            const lineBgColor = onBackground(fullLineMarkerBgColor, getStaticBackgroundColor(styleVariant));
            const textColors = annotations.filter(
              (annotation) => isInlineStyleAnnotation(annotation) && annotation.color && // Only consider annotations that apply to the current style variant
              (annotation.styleVariantIndex === void 0 || annotation.styleVariantIndex === styleVariantIndex)
            );
            textColors.forEach((textColor) => {
              const textFgColor = textColor.color;
              const textStart = textColor.inlineRange?.columnStart;
              const textEnd = textColor.inlineRange?.columnEnd;
              if (textFgColor === void 0 || textStart === void 0 || textEnd === void 0)
                return;
              markers.forEach((marker) => {
                const markerStart = marker.inlineRange?.columnStart ?? 0;
                const markerEnd = marker.inlineRange?.columnEnd ?? line.text.length;
                if (markerStart > textEnd || markerEnd < textStart)
                  return;
                const inlineMarkerBgColor = marker.inlineRange && styleVariant.resolvedStyleSettings.get(markerBgColorPaths[marker.markerType]) || "transparent";
                const combinedBgColor = onBackground(inlineMarkerBgColor, lineBgColor);
                const readableTextColor = ensureColorContrastOnBackground(textFgColor, combinedBgColor, config.minSyntaxHighlightingColorContrast);
                if (readableTextColor.toLowerCase() === textFgColor.toLowerCase())
                  return;
                line.addAnnotation(
                  new InlineStyleAnnotation({
                    styleVariantIndex,
                    inlineRange: {
                      columnStart: Math.max(textStart, markerStart),
                      columnEnd: Math.min(textEnd, markerEnd)
                    },
                    color: readableTextColor,
                    renderPhase: "earlier"
                  })
                );
              });
            });
          });
        });
      }
    }
  };
}
export {
  pluginTextMarkers
};
//# sourceMappingURL=index.js.map