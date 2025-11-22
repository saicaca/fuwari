"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const blobToBuffer = require("blob-to-buffer");
const fontkit = require("fontkit");
const _interopDefaultCompat = (e) => e && typeof e === "object" && "default" in e ? e : { default: e };
function _interopNamespaceCompat(e) {
  if (e && typeof e === "object" && "default" in e)
    return e;
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const blobToBuffer__default = /* @__PURE__ */ _interopDefaultCompat(blobToBuffer);
const fontkit__namespace = /* @__PURE__ */ _interopNamespaceCompat(fontkit);
const weightings = {
  "latin": {
    "0": 53e-4,
    "1": 23e-4,
    "2": 26e-4,
    "3": 1e-3,
    "4": 8e-4,
    "5": 15e-4,
    "6": 7e-4,
    "7": 5e-4,
    "8": 7e-4,
    "9": 6e-4,
    ",": 83e-4,
    " ": 0.154,
    "t": 0.0672,
    "h": 0.0351,
    "e": 0.0922,
    "o": 0.0571,
    "f": 0.017,
    "P": 23e-4,
    "p": 0.0163,
    "l": 0.0304,
    "'": 14e-4,
    "s": 0.0469,
    "R": 15e-4,
    "u": 0.0207,
    "b": 0.0114,
    "i": 0.0588,
    "c": 0.0232,
    "C": 31e-4,
    "n": 0.0578,
    "a": 0.0668,
    "d": 0.0298,
    "y": 0.0123,
    "w": 0.011,
    "B": 2e-3,
    "r": 0.0526,
    "z": 11e-4,
    "G": 11e-4,
    "j": 9e-4,
    "T": 41e-4,
    ".": 79e-4,
    "L": 12e-4,
    "k": 46e-4,
    "m": 0.0181,
    "]": 7e-4,
    "J": 9e-4,
    "F": 15e-4,
    "v": 76e-4,
    "g": 0.0155,
    "A": 4e-3,
    "N": 14e-4,
    "-": 18e-4,
    "H": 13e-4,
    "D": 13e-4,
    "M": 25e-4,
    "I": 22e-4,
    "E": 11e-4,
    '"': 12e-4,
    "S": 41e-4,
    "(": 1e-3,
    ")": 1e-3,
    "x": 25e-4,
    "W": 12e-4,
    "Q": 1e-4,
    "Y": 3e-4,
    "q": 8e-4,
    "V": 5e-4,
    "á": 1e-4,
    "K": 7e-4,
    "U": 16e-4,
    "=": 7e-4,
    "[": 21e-4,
    "O": 9e-4,
    "é": 1e-4,
    "$": 2e-4,
    ":": 8e-4,
    "|": 38e-4,
    "/": 1e-4,
    "%": 1e-4,
    "Z": 2e-4,
    ";": 1e-4,
    "X": 1e-4
  },
  "thai": {
    "ส": 0.0258,
    "ว": 0.0372,
    "น": 0.0711,
    "บ": 0.0258,
    "จ": 0.0169,
    "า": 0.1024,
    "ก": 0.0552,
    "เ": 0.0419,
    "ร": 0.0873,
    "ม": 0.0416,
    "ค": 0.0214,
    "ำ": 97e-4,
    "ข": 0.0127,
    "อ": 0.0459,
    "ป": 0.0204,
    "ด": 0.0271,
    "ใ": 0.0109,
    "ภ": 46e-4,
    "ท": 0.0311,
    "พ": 0.0175,
    "ฤ": 9e-4,
    "ษ": 42e-4,
    "ศ": 63e-4,
    "ะ": 0.0255,
    "ช": 0.0158,
    "แ": 0.0158,
    "ล": 0.0339,
    "ง": 0.0433,
    "ย": 0.0345,
    "ห": 0.0197,
    "ฝ": 6e-4,
    "ต": 0.0239,
    "โ": 77e-4,
    "ญ": 39e-4,
    "ณ": 71e-4,
    "ผ": 77e-4,
    "ไ": 0.0111,
    "ฯ": 7e-4,
    "ฟ": 44e-4,
    "ธ": 68e-4,
    "ถ": 61e-4,
    "ฐ": 33e-4,
    "ซ": 46e-4,
    "ฉ": 23e-4,
    "ฑ": 4e-4,
    "ฆ": 2e-4,
    "ฬ": 3e-4,
    "ฏ": 2e-4,
    "ฎ": 3e-4,
    "ฒ": 12e-4,
    "ๆ": 3e-4,
    "ฮ": 4e-4,
    "๒": 1e-4,
    "๕": 1e-4
  }
};
const supportedSubsets = Object.keys(weightings);
const weightingForCharacter = (character, subset) => {
  if (!Object.keys(weightings[subset]).includes(character)) {
    throw new Error(`No weighting specified for character: “${character}”`);
  }
  return weightings[subset][character];
};
const avgWidthForSubset = (font, subset) => {
  const sampleString = Object.keys(weightings[subset]).join("");
  const glyphs = font.glyphsForString(sampleString);
  const weightedWidth = glyphs.reduce((sum, glyph, index) => {
    const character = sampleString.charAt(index);
    let charWidth = font["OS/2"].xAvgCharWidth;
    try {
      charWidth = glyph.advanceWidth;
    } catch (e) {
      console.warn(
        `Couldn’t read 'advanceWidth' for character “${character === " " ? "<space>" : character}” from “${font.familyName}”. Falling back to “xAvgCharWidth”.`
      );
    }
    if (glyph.isMark) {
      return sum;
    }
    return sum + charWidth * weightingForCharacter(character, subset);
  }, 0);
  return Math.round(weightedWidth);
};
const unpackMetricsFromFont = (font) => {
  const {
    capHeight,
    ascent,
    descent,
    lineGap,
    unitsPerEm,
    familyName,
    fullName,
    postscriptName,
    xHeight
  } = font;
  const subsets = supportedSubsets.reduce(
    (acc, subset) => ({
      ...acc,
      [subset]: {
        xWidthAvg: avgWidthForSubset(font, subset)
      }
    }),
    {}
  );
  return {
    familyName,
    fullName,
    postscriptName,
    capHeight,
    ascent,
    descent,
    lineGap,
    unitsPerEm,
    xHeight,
    xWidthAvg: subsets.latin.xWidthAvg,
    subsets
  };
};
const handleCollectionErrors = ({
  font,
  postscriptName,
  apiName,
  apiParamName
}) => {
  if (postscriptName && font === null) {
    throw new Error(
      [
        `The provided \`postscriptName\` of “${postscriptName}” cannot be found in the provided font collection.
`,
        "Run the same command without specifying a `postscriptName` in the options to see the available names in the collection.",
        "For example:",
        "------------------------------------------",
        `const metrics = await ${apiName}('<${apiParamName}>');`,
        "------------------------------------------\n",
        ""
      ].join("\n")
    );
  }
  if (font !== null && "fonts" in font && Array.isArray(font.fonts)) {
    const availableNames = font.fonts.map((f) => f.postscriptName);
    throw new Error(
      [
        "Metrics cannot be unpacked from a font collection.\n",
        "Provide either a single font or specify a `postscriptName` to extract from the collection via the options.",
        "For example:",
        "------------------------------------------",
        `const metrics = await ${apiName}('<${apiParamName}>', {`,
        `  postscriptName: '${availableNames[0]}'`,
        "});",
        "------------------------------------------\n",
        "Available `postscriptNames` in this font collection are:",
        ...availableNames.map((fontName) => `  - ${fontName}`),
        ""
      ].join("\n")
    );
  }
};
const fromFile = (path, options) => {
  const { postscriptName } = options || {};
  return fontkit__namespace.open(path, postscriptName).then((font) => {
    handleCollectionErrors({
      font,
      postscriptName,
      apiName: "fromFile",
      apiParamName: "path"
    });
    return unpackMetricsFromFont(font);
  });
};
const _fromBuffer = async (buffer, apiName, apiParamName, options) => {
  const { postscriptName } = options || {};
  const fontkitFont = fontkit__namespace.create(buffer, postscriptName);
  handleCollectionErrors({
    font: fontkitFont,
    postscriptName,
    apiName,
    apiParamName
  });
  return unpackMetricsFromFont(fontkitFont);
};
const fromBuffer = async (buffer, options) => {
  return _fromBuffer(buffer, "fromBuffer", "buffer", options);
};
const fromBlob = async (blob, options) => {
  return new Promise((resolve, reject) => {
    blobToBuffer__default.default(blob, (err, buffer) => {
      if (err) {
        return reject(err);
      }
      try {
        resolve(_fromBuffer(buffer, "fromBlob", "blob", options));
      } catch (e) {
        reject(e);
      }
    });
  });
};
const fromUrl = async (url, options) => {
  const response = await fetch(url);
  if (typeof window === "undefined") {
    const data = await response.arrayBuffer();
    return _fromBuffer(Buffer.from(data), "fromUrl", "url", options);
  }
  const blob = await response.blob();
  return fromBlob(blob, options);
};
exports.fromBlob = fromBlob;
exports.fromBuffer = fromBuffer;
exports.fromFile = fromFile;
exports.fromUrl = fromUrl;
exports.supportedSubsets = supportedSubsets;
