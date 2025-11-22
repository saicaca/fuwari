// src/index.ts
import { create } from "fontkit";
function getWeight(font) {
  if (font.variationAxes.wght) {
    return `${font.variationAxes.wght.min} ${font.variationAxes.wght.max}`;
  }
  const weight = font["OS/2"]?.usWeightClass || (font["OS/2"]?.fsSelection?.["bold"] ? 700 : 400);
  return `${weight}`;
}
function getStyle(font) {
  return font["OS/2"]?.fsSelection?.italic || font.italicAngle !== 0 ? "italic" : "normal";
}
function fontace(fontBuffer) {
  const font = create(fontBuffer);
  if (font.type === "TTC") {
    throw new Error("TrueType Collection (TTC) files are not supported.");
  } else if (font.type === "DFont") {
    throw new Error("DFONT files are not supported.");
  } else if (font.type !== "TTF" && font.type !== "WOFF" && font.type !== "WOFF2") {
    throw new Error(`Unknown font type: ${font.type}`);
  }
  return {
    ...getUnicodeRange(font),
    family: font.familyName,
    style: getStyle(font),
    weight: getWeight(font),
    format: { TTF: "truetype", WOFF: "woff", WOFF2: "woff2" }[font.type],
    isVariable: Object.keys(font.variationAxes).length > 0
  };
}
function getUnicodeRange({ characterSet }) {
  if (!characterSet || characterSet.length === 0) {
    const defaultRange = "U+0-10FFFF";
    return { unicodeRange: defaultRange, unicodeRangeArray: [defaultRange] };
  }
  characterSet.sort((a, b) => a - b);
  const ranges = [];
  let start = characterSet[0];
  let end = start;
  for (let i = 1; i < characterSet.length; i++) {
    if (characterSet[i] === end + 1) {
      end = characterSet[i];
    } else {
      ranges.push(formatRange(start, end));
      start = characterSet[i];
      end = start;
    }
  }
  ranges.push(formatRange(start, end));
  return { unicodeRange: ranges.join(", "), unicodeRangeArray: ranges };
}
function formatRange(start, end) {
  return start === end ? `U+${start.toString(16).toUpperCase()}` : `U+${start.toString(16).toUpperCase()}-${end.toString(16).toUpperCase()}`;
}
export {
  fontace
};
