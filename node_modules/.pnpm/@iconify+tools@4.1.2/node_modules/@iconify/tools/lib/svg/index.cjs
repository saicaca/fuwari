'use strict';

const cheerio = require('cheerio');
const utils = require('@iconify/utils');

function _interopNamespaceCompat(e) {
	if (e && typeof e === 'object' && 'default' in e) return e;
	const n = Object.create(null);
	if (e) {
		for (const k in e) {
			n[k] = e[k];
		}
	}
	n.default = e;
	return n;
}

const cheerio__namespace = /*#__PURE__*/_interopNamespaceCompat(cheerio);

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class SVG {
  /**
   * Constructor
   */
  constructor(content) {
    // Cheerio tree, initialized in load()
    __publicField(this, "$svg");
    // Dimensions, initialized in load()
    __publicField(this, "viewBox");
    this.load(content);
  }
  /**
   * Get SVG as string
   */
  toString(customisations) {
    if (customisations) {
      const data = utils.iconToSVG(this.getIcon(), customisations);
      let svgAttributes = ' xmlns="http://www.w3.org/2000/svg"';
      if (data.body.includes("xlink:")) {
        svgAttributes += ' xmlns:xlink="http://www.w3.org/1999/xlink"';
      }
      for (const key in data.attributes) {
        const value = data.attributes[key];
        svgAttributes += " " + key + '="' + value + '"';
      }
      return "<svg" + svgAttributes + ">" + data.body + "</svg>";
    }
    const $root = this.$svg(":root");
    const box = this.viewBox;
    if ($root.attr("viewBox") === void 0) {
      $root.attr(
        "viewBox",
        `${box.left} ${box.top} ${box.width} ${box.height}`
      );
    }
    if ($root.attr("width") === void 0) {
      $root.attr("width", box.width.toString());
    }
    if ($root.attr("height") === void 0) {
      $root.attr("height", box.height.toString());
    }
    return this.$svg.html();
  }
  /**
   * Get SVG as string without whitespaces
   */
  toMinifiedString(customisations) {
    return utils.trimSVG(this.toString(customisations));
  }
  /**
   * Get SVG as string with whitespaces
   */
  toPrettyString(customisations) {
    const str = this.toMinifiedString(customisations);
    return utils.prettifySVG(str) ?? str;
  }
  /**
   * Get body
   */
  getBody() {
    const $root = this.$svg(":root");
    const attribs = $root.get(0).attribs;
    for (const key in attribs) {
      switch (key.split("-").shift()) {
        case "fill":
        case "stroke":
        case "opacity":
          throw new Error(
            `Cannot use getBody() on icon that was not cleaned up with cleanupSVGRoot(). Icon has attribute ${key}="${attribs[key]}"`
          );
      }
    }
    return utils.trimSVG(this.$svg("svg").html());
  }
  /**
   * Get icon as IconifyIcon
   */
  getIcon() {
    const props = this.viewBox;
    const body = this.getBody();
    return {
      ...props,
      body
    };
  }
  /**
   * Load SVG
   *
   * @param {string} content
   */
  load(content) {
    function remove(str1, str2, append) {
      let start = 0;
      while ((start = content.indexOf(str1, start)) !== -1) {
        const end = content.indexOf(str2, start + str1.length);
        if (end === -1) {
          return;
        }
        content = content.slice(0, start) + append + content.slice(end + str2.length);
        start = start + append.length;
      }
    }
    remove("<!--", "-->", "");
    remove("<?xml", "?>", "");
    remove("<!DOCTYPE svg", "<svg", "<svg");
    remove(
      'xmlns:x="&ns_extend;" xmlns:i="&ns_ai;" xmlns:graph="&ns_graphs;"',
      "",
      ""
    );
    remove('xml:space="preserve"', "", "");
    content = content.replace(/<g>\s*<\/g>/g, "");
    this.$svg = cheerio__namespace.load(content.trim(), {
      // @ts-expect-error Legacy attribute, kept because Cheerio types are a unstable
      lowerCaseAttributeNames: false,
      xmlMode: true
    });
    const $root = this.$svg(":root");
    if ($root.length > 1 || $root.get(0).tagName !== "svg") {
      throw new Error("Invalid SVG file: bad root tag");
    }
    const viewBox = $root.attr("viewBox");
    if (viewBox !== void 0) {
      const list = viewBox.split(" ");
      this.viewBox = {
        left: parseFloat(list[0]),
        top: parseFloat(list[1]),
        width: parseFloat(list[2]),
        height: parseFloat(list[3])
      };
    } else {
      const width = $root.attr("width");
      const height = $root.attr("height");
      if (!width || !height) {
        throw new Error("Invalid SVG file: missing dimensions");
      }
      this.viewBox = {
        left: 0,
        top: 0,
        width: parseFloat(width),
        height: parseFloat(height)
      };
    }
    Object.keys(this.viewBox).forEach((key) => {
      const attr = key;
      if (isNaN(this.viewBox[attr])) {
        throw new Error(`Invalid SVG file: invalid ${attr}`);
      }
    });
  }
}

exports.SVG = SVG;
