function renderFontFace(properties, minify) {
  const lf = minify ? "" : `
`;
  const sp = minify ? "" : " ";
  return `@font-face${sp}{${lf}${Object.entries(properties).filter(([, value]) => Boolean(value)).map(([key, value]) => `${sp}${sp}${key}:${sp}${value};`).join(lf)}${lf}}${lf}`;
}
function renderCssVariable(key, values, minify) {
  const lf = minify ? "" : `
`;
  const sp = minify ? "" : " ";
  return `:root${sp}{${lf}${sp}${sp}${key}:${sp}${values.map((v) => handleValueWithSpaces(v)).join(`,${sp}`)};${lf}}${lf}`;
}
function withFamily(family, properties) {
  return {
    "font-family": handleValueWithSpaces(family),
    ...properties
  };
}
const SPACE_RE = /\s/;
function handleValueWithSpaces(value) {
  if (SPACE_RE.test(value)) {
    return JSON.stringify(value);
  }
  return value;
}
function createMinifiableCssRenderer({ minify }) {
  return {
    generateFontFace(family, properties) {
      return renderFontFace(withFamily(family, properties), minify);
    },
    generateCssVariable(key, values) {
      return renderCssVariable(key, values, minify);
    }
  };
}
export {
  createMinifiableCssRenderer,
  handleValueWithSpaces,
  renderCssVariable,
  renderFontFace,
  withFamily
};
