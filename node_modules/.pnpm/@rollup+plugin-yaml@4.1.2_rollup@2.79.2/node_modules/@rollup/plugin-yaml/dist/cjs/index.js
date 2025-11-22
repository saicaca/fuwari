'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var YAML = require('js-yaml');
var toSource = require('tosource');
var pluginutils = require('@rollup/pluginutils');

const defaults = {
  documentMode: 'single',
  transform: null,
  extensions: ['.yaml', '.yml']
};

function yaml(opts = {}) {
  const options = Object.assign({}, defaults, opts);
  const { documentMode, extensions } = options;
  const filter = pluginutils.createFilter(options.include, options.exclude);
  let loadMethod = null;

  if (documentMode === 'single') {
    loadMethod = YAML.load;
  } else if (documentMode === 'multi') {
    loadMethod = YAML.loadAll;
  } else {
    this.error(
      `plugin-yaml → documentMode: '${documentMode}' is not a valid value. Please choose 'single' or 'multi'`
    );
  }

  return {
    name: 'yaml',

    transform(content, id) {
      if (!extensions.some((ext) => id.toLowerCase().endsWith(ext))) return null;
      if (!filter(id)) return null;

      let data = loadMethod(content);

      if (typeof options.transform === 'function') {
        const result = options.transform(data, id);
        // eslint-disable-next-line no-undefined
        if (result !== undefined) {
          data = result;
        }
      }

      const keys = Object.keys(data).filter((key) => key === pluginutils.makeLegalIdentifier(key));
      const code = `var data = ${toSource(data)};\n\n`;
      const exports = ['export default data;']
        .concat(keys.map((key) => `export var ${key} = data.${key};`))
        .join('\n');

      return {
        code: code + exports,
        map: { mappings: '' }
      };
    }
  };
}

exports.default = yaml;
module.exports = Object.assign(exports.default, exports);
//# sourceMappingURL=index.js.map
