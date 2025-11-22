#!/usr/bin/env node
var fs = require('fs');
var path = require('path');
var camelCase = require('camelcase');
var escapeStringRegexp = require('escape-string-regexp');
var kleur = require('kleur');
var asyncro = require('asyncro');
var glob = require('tiny-glob/sync');
var autoprefixer = require('autoprefixer');
var rollup = require('rollup');
var builtinModules = require('builtin-modules');
var Module = require('module');
var commonjs = require('@rollup/plugin-commonjs');
var babel = require('@rollup/plugin-babel');
var merge = require('lodash.merge');
var nodeResolve = require('@rollup/plugin-node-resolve');
var rollupPluginTerser = require('rollup-plugin-terser');
var rollupPluginVisualizer = require('rollup-plugin-visualizer');
var alias = require('@rollup/plugin-alias');
var postcss = require('rollup-plugin-postcss');
var typescript = require('rollup-plugin-typescript2');
var json = require('@rollup/plugin-json');
var OMT = require('@surma/rollup-plugin-off-main-thread');
var gzipSize = require('gzip-size');
var brotliSize = require('brotli-size');
var prettyBytes = require('pretty-bytes');
var os = require('os');
var sade = require('sade');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var camelCase__default = /*#__PURE__*/_interopDefaultLegacy(camelCase);
var escapeStringRegexp__default = /*#__PURE__*/_interopDefaultLegacy(escapeStringRegexp);
var glob__default = /*#__PURE__*/_interopDefaultLegacy(glob);
var autoprefixer__default = /*#__PURE__*/_interopDefaultLegacy(autoprefixer);
var builtinModules__default = /*#__PURE__*/_interopDefaultLegacy(builtinModules);
var Module__default = /*#__PURE__*/_interopDefaultLegacy(Module);
var commonjs__default = /*#__PURE__*/_interopDefaultLegacy(commonjs);
var babel__default = /*#__PURE__*/_interopDefaultLegacy(babel);
var merge__default = /*#__PURE__*/_interopDefaultLegacy(merge);
var nodeResolve__default = /*#__PURE__*/_interopDefaultLegacy(nodeResolve);
var alias__default = /*#__PURE__*/_interopDefaultLegacy(alias);
var postcss__default = /*#__PURE__*/_interopDefaultLegacy(postcss);
var typescript__default = /*#__PURE__*/_interopDefaultLegacy(typescript);
var json__default = /*#__PURE__*/_interopDefaultLegacy(json);
var OMT__default = /*#__PURE__*/_interopDefaultLegacy(OMT);
var gzipSize__default = /*#__PURE__*/_interopDefaultLegacy(gzipSize);
var brotliSize__default = /*#__PURE__*/_interopDefaultLegacy(brotliSize);
var prettyBytes__default = /*#__PURE__*/_interopDefaultLegacy(prettyBytes);
var sade__default = /*#__PURE__*/_interopDefaultLegacy(sade);

const resolveFrom = (fromDir, moduleId, silent) => {
	if (typeof fromDir !== 'string') {
		throw new TypeError(`Expected \`fromDir\` to be of type \`string\`, got \`${typeof fromDir}\``);
	}

	if (typeof moduleId !== 'string') {
		throw new TypeError(`Expected \`moduleId\` to be of type \`string\`, got \`${typeof moduleId}\``);
	}

	try {
		fromDir = fs__default['default'].realpathSync(fromDir);
	} catch (err) {
		if (err.code === 'ENOENT') {
			fromDir = path__default['default'].resolve(fromDir);
		} else if (silent) {
			return null;
		} else {
			throw err;
		}
	}

	const fromFile = path__default['default'].join(fromDir, 'noop.js');

	const resolveFileName = () => Module__default['default']._resolveFilename(moduleId, {
		id: fromFile,
		filename: fromFile,
		paths: Module__default['default']._nodeModulePaths(fromDir)
	});

	if (silent) {
		try {
			return resolveFileName();
		} catch (err) {
			return null;
		}
	}

	return resolveFileName();
};

var resolveFrom_1 = (fromDir, moduleId) => resolveFrom(fromDir, moduleId);
var silent = (fromDir, moduleId) => resolveFrom(fromDir, moduleId, true);
resolveFrom_1.silent = silent;

/**
 * @type {import('@babel/core')}
 */

/**
 * Transform ...rest parameters to [].slice.call(arguments,offset).
 * Demo: https://astexplorer.net/#/gist/70aaa0306db9a642171ef3e2f35df2e0/576c150f647e4936fa6960e0453a11cdc5d81f21
 * Benchmark: https://jsperf.com/rest-arguments-babel-pr-9152/4
 * @param {object} opts
 * @param {babel.template} opts.template
 * @param {babel.types} opts.types
 * @returns {babel.PluginObj}
 */
function fastRestTransform({
  template,
  types: t
}) {
  const slice = template`var IDENT = Array.prototype.slice;`;
  const VISITOR = {
    RestElement(path, state) {
      if (path.parentKey !== 'params') return; // Create a global _slice alias

      let slice = state.get('slice');

      if (!slice) {
        slice = path.scope.generateUidIdentifier('slice');
        state.set('slice', slice);
      } // _slice.call(arguments) or _slice.call(arguments, 1)


      const args = [t.identifier('arguments')];
      if (path.key) args.push(t.numericLiteral(path.key));
      const sliced = t.callExpression(t.memberExpression(t.clone(slice), t.identifier('call')), args);
      const ident = path.node.argument;
      const binding = path.scope.getBinding(ident.name);

      if (binding.referencePaths.length !== 0) {
        // arguments access requires a non-Arrow function:
        const func = path.parentPath;

        if (t.isArrowFunctionExpression(func)) {
          func.arrowFunctionToExpression();
        }

        if (binding.constant && binding.referencePaths.length === 1 && sameArgumentsObject(binding.referencePaths[0], func, t)) {
          // one usage, never assigned - replace usage inline
          binding.referencePaths[0].replaceWith(sliced);
        } else {
          // unknown usage, create a binding
          const decl = t.variableDeclaration('var', [t.variableDeclarator(t.clone(ident), sliced)]);
          func.get('body').unshiftContainer('body', decl);
        }
      }

      path.remove();
    }

  };
  return {
    name: 'transform-fast-rest',
    visitor: {
      Program(path, state) {
        const childState = new Map();
        const useHelper = state.opts.helper === true; // defaults to false

        if (!useHelper) {
          let inlineHelper;

          if (state.opts.literal === false) {
            inlineHelper = template.expression.ast`Array.prototype.slice`;
          } else {
            inlineHelper = template.expression.ast`[].slice`;
          }

          childState.set('slice', inlineHelper);
        }

        path.traverse(VISITOR, childState);
        const name = childState.get('slice');

        if (name && useHelper) {
          const helper = slice({
            IDENT: name
          });
          t.addComment(helper.declarations[0].init, 'leading', '#__PURE__');
          path.unshiftContainer('body', helper);
        }
      }

    }
  };
}

function sameArgumentsObject(node, func, t) {
  while (node = node.parentPath) {
    if (node === func) {
      return true;
    }

    if (t.isFunction(node) && !t.isArrowFunctionExpression(node)) {
      return false;
    }
  }

  return false;
}

const readFile = fs.promises.readFile;
const stat = fs.promises.stat;
function isDir(name) {
  return stat(name).then(stats => stats.isDirectory()).catch(() => false);
}
function isFile(name) {
  return stat(name).then(stats => stats.isFile()).catch(() => false);
} // eslint-disable-next-line no-console

const stdout = console.log.bind(console);
const stderr = console.error.bind(console);
const isTruthy = obj => {
  if (!obj) {
    return false;
  }

  return obj.constructor !== Object || Object.keys(obj).length > 0;
};
/** Remove a @scope/ prefix from a package name string */

const removeScope = name => name.replace(/^@.*\//, '');
const INVALID_ES3_IDENT = /((^[^a-zA-Z]+)|[^\w.-])|([^a-zA-Z0-9]+$)/g;
/**
 * Turn a package name into a valid reasonably-unique variable name
 * @param {string} name
 */

function safeVariableName(name) {
  const normalized = removeScope(name).toLowerCase();
  const identifier = normalized.replace(INVALID_ES3_IDENT, '');
  return camelCase__default['default'](identifier);
}
const EXTENSION = /(\.(umd|cjs|es|m))?\.([cm]?[tj]sx?)$/;

const ESMODULES_TARGET = {
  esmodules: true
};

const mergeConfigItems = (babel, type, ...configItemsToMerge) => {
  const mergedItems = [];
  configItemsToMerge.forEach(configItemToMerge => {
    configItemToMerge.forEach(item => {
      const itemToMergeWithIndex = mergedItems.findIndex(mergedItem => (mergedItem.name || mergedItem.file.resolved) === (item.name || item.file.resolved));

      if (itemToMergeWithIndex === -1) {
        mergedItems.push(item);
        return;
      }

      mergedItems[itemToMergeWithIndex] = babel.createConfigItem([mergedItems[itemToMergeWithIndex].file.resolved, merge__default['default'](mergedItems[itemToMergeWithIndex].options, item.options)], {
        type
      });
    });
  });
  return mergedItems;
};

const createConfigItems = (babel, type, items) => {
  return items.map(item => {
    let {
      name,
      value,
      ...options
    } = item;
    value = value || [require.resolve(name), options];
    return babel.createConfigItem(value, {
      type
    });
  });
};

const environmentPreset = '@babel/preset-env'; // capture both @babel/env & @babel/preset-env (https://babeljs.io/docs/en/presets#preset-shorthand)

const presetEnvRegex = new RegExp(/@babel\/(preset-)?env/);
var customBabel = (() => {
  return babel.createBabelInputPluginFactory(babelCore => {
    return {
      // Passed the plugin options.
      options({
        custom: customOptions,
        ...pluginOptions
      }) {
        return {
          // Pull out any custom options that the plugin might have.
          customOptions,
          // Pass the options back with the two custom options removed.
          pluginOptions
        };
      },

      config(config, {
        customOptions
      }) {
        const targets = customOptions.targets;
        const isNodeTarget = targets && targets.node != null;
        const defaultPlugins = createConfigItems(babelCore, 'plugin', [{
          name: '@babel/plugin-syntax-import-meta'
        }, !customOptions.jsxImportSource && {
          name: '@babel/plugin-transform-react-jsx',
          pragma: customOptions.pragma || 'h',
          pragmaFrag: customOptions.pragmaFrag || 'Fragment'
        }, !customOptions.typescript && {
          name: '@babel/plugin-transform-flow-strip-types'
        }, isTruthy(customOptions.defines) && {
          name: 'babel-plugin-transform-replace-expressions',
          replace: customOptions.defines
        }, !customOptions.modern && !isNodeTarget && {
          name: 'babel-plugin-transform-async-to-promises',
          inlineHelpers: true,
          externalHelpers: false,
          minify: true
        }, !customOptions.modern && !isNodeTarget && {
          value: [fastRestTransform, {
            // Use inline [].slice.call(arguments)
            helper: false,
            literal: true
          }, 'transform-fast-rest']
        }, {
          name: '@babel/plugin-proposal-class-properties',
          loose: true
        }, !customOptions.modern && !isNodeTarget && {
          name: '@babel/plugin-transform-regenerator',
          async: false
        }, {
          name: 'babel-plugin-macros'
        }].filter(Boolean));
        const babelOptions = config.options || {};
        const envIdx = (babelOptions.presets || []).findIndex(preset => presetEnvRegex.test(preset.file.request));

        if (envIdx !== -1) {
          const preset = babelOptions.presets[envIdx];
          babelOptions.presets[envIdx] = babelCore.createConfigItem([require.resolve(environmentPreset), Object.assign(merge__default['default']({
            loose: true,
            useBuiltIns: false,
            targets: customOptions.targets
          }, preset.options, {
            bugfixes: customOptions.modern,
            modules: false,
            exclude: merge__default['default'](['transform-async-to-generator', 'transform-regenerator'], preset.options && preset.options.exclude || [])
          }), customOptions.modern ? {
            targets: ESMODULES_TARGET
          } : {})], {
            type: `preset`
          });
        } else {
          babelOptions.presets = createConfigItems(babelCore, 'preset', [{
            name: environmentPreset,
            targets: customOptions.modern ? ESMODULES_TARGET : customOptions.targets,
            modules: false,
            loose: true,
            useBuiltIns: false,
            bugfixes: customOptions.modern,
            exclude: ['transform-async-to-generator', 'transform-regenerator']
          }, customOptions.jsxImportSource && {
            name: '@babel/preset-react',
            runtime: 'automatic',
            importSource: customOptions.jsxImportSource
          }].filter(Boolean));
        } // Merge babelrc & our plugins together


        babelOptions.plugins = mergeConfigItems(babelCore, 'plugin', defaultPlugins, babelOptions.plugins || []);

        if (customOptions.compress) {
          babelOptions.generatorOpts = {
            minified: true,
            compact: true,
            shouldPrintComment: comment => /[@#]__[A-Z]+__/.test(comment)
          };
        }

        return babelOptions;
      }

    };
  });
});

function logError(err) {
  const error = err.error || err;
  const description = `${error.name ? error.name + ': ' : ''}${error.message || error}`;
  const message = error.plugin ? `(${error.plugin} plugin) ${description}` : description;
  stderr(kleur.red().bold(message));

  if (error.loc) {
    stderr();
    stderr(`at ${error.loc.file}:${error.loc.line}:${error.loc.column}`);
  }

  if (error.frame) {
    stderr();
    stderr(kleur.dim(error.frame));
  } else if (err.stack) {
    const headlessStack = error.stack.replace(message, '');
    stderr(kleur.dim(headlessStack));
  }

  stderr();
}

function getPadLeft(str, width, char = ' ') {
  return char.repeat(width - str.length);
}

function formatSize(size, filename, type, raw) {
  const pretty = raw ? `${size} B` : prettyBytes__default['default'](size);
  const color = size < 5000 ? kleur.green : size > 40000 ? kleur.red : kleur.yellow;
  const indent = getPadLeft(pretty, 13);
  return `${indent}${color(pretty)}: ${kleur.white(path.basename(filename))}.${type}`;
}

async function getSizeInfo(code, filename, raw) {
  raw = raw || code.length < 5000;
  const [gzip, brotli] = await Promise.all([gzipSize__default['default'](code).catch(() => null), brotliSize__default['default'](code).catch(() => null)]);
  let out = formatSize(gzip, filename, 'gz', raw);

  if (brotli) {
    out += '\n' + formatSize(brotli, filename, 'br', raw);
  }

  return out;
}

// Normalize Terser options from microbundle's relaxed JSON format (mutates argument in-place)
function normalizeMinifyOptions(minifyOptions) {
  // ignore normalization if "mangle" is a boolean:
  if (typeof minifyOptions.mangle === 'boolean') return;
  const mangle = minifyOptions.mangle || (minifyOptions.mangle = {});
  let properties = mangle.properties; // allow top-level "properties" key to override mangle.properties (including {properties:false}):

  if (minifyOptions.properties != null) {
    properties = mangle.properties = minifyOptions.properties && Object.assign(properties, minifyOptions.properties);
  } // allow previous format ({ mangle:{regex:'^_',reserved:[]} }):


  if (minifyOptions.regex || minifyOptions.reserved) {
    if (!properties) properties = mangle.properties = {};
    properties.regex = properties.regex || minifyOptions.regex;
    properties.reserved = properties.reserved || minifyOptions.reserved;
  }

  if (properties) {
    if (properties.regex) properties.regex = new RegExp(properties.regex);
    properties.reserved = [].concat(properties.reserved || []);
  }
}

/**
 * Convert booleans and int define= values to literals.
 * This is more intuitive than `microbundle --define A=1` producing A="1".
 */
function toReplacementExpression(value, name) {
  // --define A="1",B='true' produces string:
  const matches = value.match(/^(['"])(.+)\1$/);

  if (matches) {
    return [JSON.stringify(matches[2]), name];
  } // --define @assign=Object.assign replaces expressions with expressions:


  if (name[0] === '@') {
    return [value, name.substring(1)];
  } // --define A=1,B=true produces int/boolean literal:


  if (/^(true|false|\d+)$/i.test(value)) {
    return [value, name];
  } // default: string literal


  return [JSON.stringify(value), name];
}
/**
 * Parses values of the form "$=jQuery,React=react" into key-value object pairs.
 */

function parseMappingArgument(globalStrings, processValue) {
  const globals = {};
  globalStrings.split(',').forEach(globalString => {
    let [key, value] = globalString.split('=');

    if (processValue) {
      const r = processValue(value, key);

      if (r !== undefined) {
        if (Array.isArray(r)) {
          [value, key] = r;
        } else {
          value = r;
        }
      }
    }

    globals[key] = value;
  });
  return globals;
}
/**
 * Parses values of the form "$=jQuery,React=react" into key-value object pairs.
 */

function parseAliasArgument(aliasStrings) {
  return aliasStrings.split(',').map(str => {
    let [key, value] = str.split('=');
    return {
      find: key,
      replacement: value
    };
  });
}

/** */

async function getConfigFromPkgJson(cwd) {
  let hasPackageJson = false;
  let pkg;

  try {
    const packageJson = await readFile(path.resolve(cwd, 'package.json'), 'utf8');
    pkg = JSON.parse(packageJson);
    hasPackageJson = true;
  } catch (err) {
    const pkgName = path.basename(cwd);
    stderr(kleur.yellow().inverse('WARN'), kleur.yellow(` no package.json, assuming package name is "${pkgName}".`));
    let msg = String(err.message || err);
    if (!msg.match(/ENOENT/)) stderr(`  ${kleur.red().dim(msg)}`);
    pkg = {
      name: pkgName
    };
  }

  return {
    hasPackageJson,
    pkg
  };
}
function getName({
  name,
  pkgName,
  amdName,
  cwd,
  hasPackageJson
}) {
  if (!pkgName) {
    pkgName = path.basename(cwd);

    if (hasPackageJson) {
      stderr(kleur.yellow().inverse('WARN'), kleur.yellow(` missing package.json "name" field. Assuming "${pkgName}".`));
    }
  }

  const finalName = name || amdName || safeVariableName(pkgName);
  return {
    finalName,
    pkgName
  };
}

function shouldCssModules(options) {
  const passedInOption = processCssmodulesArgument(options); // We should module when my-file.module.css or my-file.css

  const moduleAllCss = passedInOption === true; // We should module when my-file.module.css

  const allowOnlySuffixModule = passedInOption === null;
  return moduleAllCss || allowOnlySuffixModule;
}
function cssModulesConfig(options) {
  const passedInOption = processCssmodulesArgument(options);
  const isWatchMode = options.watch;
  const hasPassedInScopeName = !(typeof passedInOption === 'boolean' || passedInOption === null);

  if (shouldCssModules(options) || hasPassedInScopeName) {
    let generateScopedName = isWatchMode ? '_[name]__[local]__[hash:base64:5]' : '_[hash:base64:5]';

    if (hasPassedInScopeName) {
      generateScopedName = passedInOption; // would be the string from --css-modules "_[hash]".
    }

    return {
      generateScopedName
    };
  }

  return false;
}
/**
 * This is done because if you use the cli default property, you get a primiatve "null" or "false",
 * but when using the cli arguments, you always get back strings. This method aims at correcting those
 * for both realms. So that both realms _convert_ into primatives.
 */

function processCssmodulesArgument(options) {
  if (options['css-modules'] === 'true' || options['css-modules'] === true) return true;
  if (options['css-modules'] === 'false' || options['css-modules'] === false) return false;
  if (options['css-modules'] === 'null' || options['css-modules'] === null) return null;
  return options['css-modules'];
}

const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.es6', '.es', '.mjs'];
const WATCH_OPTS = {
  exclude: 'node_modules/**'
};
async function microbundle(inputOptions) {
  let options = { ...inputOptions
  };
  options.cwd = path.resolve(process.cwd(), inputOptions.cwd);
  const cwd = options.cwd;
  const {
    hasPackageJson,
    pkg
  } = await getConfigFromPkgJson(cwd);
  options.pkg = { ...pkg,
    ...pkg.publishConfig
  };
  const {
    finalName,
    pkgName
  } = getName({
    name: options.name,
    pkgName: options.pkg.name,
    amdName: options.pkg.amdName,
    hasPackageJson,
    cwd
  });
  options.name = finalName;
  options.pkg.name = pkgName;

  if (options.sourcemap === 'inline') {
    console.log('Warning: inline sourcemaps should only be used for debugging purposes.');
  } else if (options.sourcemap === 'false') {
    options.sourcemap = false;
  } else if (options.sourcemap !== false) {
    options.sourcemap = true;
  }

  options.input = await getInput({
    entries: options.entries,
    cwd,
    source: options.pkg.source,
    module: options.pkg.module
  });
  options.output = await getOutput({
    cwd,
    output: options.output,
    pkgMain: options.pkg.main,
    pkgName: options.pkg.name
  });
  options.entries = await getEntries({
    cwd,
    input: options.input
  });
  options.multipleEntries = options.entries.length > 1;
  let formats = (options.format || options.formats).split(','); // de-dupe formats and convert "esm" to "es":

  formats = Array.from(new Set(formats.map(f => f === 'esm' ? 'es' : f))); // always compile cjs first if it's there:

  formats.sort((a, b) => a === 'cjs' ? -1 : a > b ? 1 : 0);
  let steps = [];

  for (let i = 0; i < options.entries.length; i++) {
    for (let j = 0; j < formats.length; j++) {
      steps.push(createConfig(options, options.entries[i], formats[j], j === 0));
    }
  }

  if (options.watch) {
    return doWatch(options, cwd, steps);
  }

  let cache;
  let out = await asyncro.series(steps.map(config => async () => {
    const {
      inputOptions,
      outputOptions
    } = config;

    if (inputOptions.cache !== false) {
      inputOptions.cache = cache;
    }

    let bundle = await rollup.rollup(inputOptions);
    cache = bundle;
    await bundle.write(outputOptions);
    return await config._sizeInfo;
  }));
  const targetDir = path.relative(cwd, path.dirname(options.output)) || '.';
  const sourceExist = options.input.length > 0;
  const banner = sourceExist ? kleur.blue(`Build "${options.pkg.name}" to ${targetDir}:`) : kleur.red(`Error: No entry module found for "${options.pkg.name}"`);
  return {
    output: `${banner}\n${out.join('\n')}`
  };
}

function doWatch(options, cwd, steps) {
  const {
    onStart,
    onBuild,
    onError
  } = options;
  return new Promise((resolve, reject) => {
    const targetDir = path.relative(cwd, path.dirname(options.output));
    stdout(kleur.blue(`Watching source, compiling to ${targetDir}:`));
    const watchers = steps.reduce((acc, options) => {
      acc[options.inputOptions.input] = rollup.watch(Object.assign({
        output: options.outputOptions,
        watch: WATCH_OPTS
      }, options.inputOptions)).on('event', e => {
        if (e.code === 'START') {
          if (typeof onStart === 'function') {
            onStart(e);
          }
        }

        if (e.code === 'ERROR') {
          logError(e.error);

          if (typeof onError === 'function') {
            onError(e);
          }
        }

        if (e.code === 'END') {
          if (options._sizeInfo) {
            options._sizeInfo.then(text => {
              stdout(`Wrote ${text.trim()}`);
            });
          }

          if (typeof onBuild === 'function') {
            onBuild(e);
          }
        }
      });
      return acc;
    }, {});
    resolve({
      watchers
    });
  });
}

async function jsOrTs(cwd, filename) {
  const extension = (await isFile(path.resolve(cwd, filename + '.ts'))) ? '.ts' : (await isFile(path.resolve(cwd, filename + '.tsx'))) ? '.tsx' : '.js';
  return path.resolve(cwd, `${filename}${extension}`);
}

async function getInput({
  entries,
  cwd,
  source,
  module
}) {
  const input = [];
  [].concat(entries && entries.length ? entries : source && (Array.isArray(source) ? source : [source]).map(file => path.resolve(cwd, file)) || (await isDir(path.resolve(cwd, 'src'))) && (await jsOrTs(cwd, 'src/index')) || (await jsOrTs(cwd, 'index')) || module).map(file => glob__default['default'](file)).forEach(file => input.push(...file));
  return input;
}

async function getOutput({
  cwd,
  output,
  pkgMain,
  pkgName
}) {
  let main = path.resolve(cwd, output || pkgMain || 'dist');

  if (!main.match(/\.[a-z]+$/) || (await isDir(main))) {
    main = path.resolve(main, `${removeScope(pkgName)}.js`);
  }

  return main;
}

function getDeclarationDir({
  options,
  pkg
}) {
  const {
    cwd,
    output
  } = options;
  let result = output;

  if (pkg.types || pkg.typings) {
    result = pkg.types || pkg.typings;
    result = path.resolve(cwd, result);
  }

  result = path.dirname(result);
  return result;
}

async function getEntries({
  input,
  cwd
}) {
  let entries = (await asyncro.map([].concat(input), async file => {
    file = path.resolve(cwd, file);

    if (await isDir(file)) {
      file = path.resolve(file, 'index.js');
    }

    return file;
  })).filter((item, i, arr) => arr.indexOf(item) === i);
  return entries;
}

function replaceName(filename, name) {
  return path.resolve(path.dirname(filename), name + path.basename(filename).replace(/^[^.]+/, ''));
}

function walk(exports, includeDefault) {
  if (!exports) return null;
  if (typeof exports === 'string') return exports;
  let p = exports['.'] || exports.import || exports.module;
  if (!p && includeDefault) p = exports.default;
  return walk(p, includeDefault);
}

function getMain({
  options,
  entry,
  format
}) {
  const {
    pkg
  } = options;
  const pkgMain = options['pkg-main'];
  const pkgTypeModule = pkg.type === 'module';

  if (!pkgMain) {
    return options.output;
  }

  let mainNoExtension = options.output;

  if (options.multipleEntries) {
    let name = entry.match(new RegExp(/([\\/])index/.source + EXTENSION.source)) ? mainNoExtension : entry;
    mainNoExtension = path.resolve(path.dirname(mainNoExtension), path.basename(name));
  }

  mainNoExtension = mainNoExtension.replace(EXTENSION, '');
  const mainsByFormat = {};
  mainsByFormat.es = replaceName(pkg.module && !pkg.module.match(/src\//) ? pkg.module : pkg['jsnext:main'] || (pkgTypeModule ? 'x.esm.js' : 'x.esm.mjs'), mainNoExtension);
  mainsByFormat.modern = replaceName(pkg.exports && walk(pkg.exports, pkgTypeModule) || pkg.syntax && pkg.syntax.esmodules || pkg.esmodule || (pkgTypeModule ? 'x.modern.js' : 'x.modern.mjs'), mainNoExtension);
  mainsByFormat.cjs = replaceName(pkg['cjs:main'] || (pkgTypeModule ? 'x.cjs' : 'x.js'), mainNoExtension);
  mainsByFormat.umd = replaceName(pkg['umd:main'] || pkg.unpkg || 'x.umd.js', mainNoExtension);
  return mainsByFormat[format] || mainsByFormat.cjs;
} // shebang cache map because the transform only gets run once


const shebang = {};

function createConfig(options, entry, format, writeMeta) {
  let {
    pkg
  } = options;
  /** @type {(string|RegExp)[]} */

  let external = ['dns', 'fs', 'path', 'url'];
  /** @type {Record<string, string>} */

  let outputAliases = {};
  const moduleAliases = options.alias ? parseAliasArgument(options.alias) : [];
  const aliasIds = moduleAliases.map(alias => alias.find); // We want to silence rollup warnings for node builtins as we rollup-node-resolve threats them as externals anyway
  // @see https://github.com/rollup/plugins/tree/master/packages/node-resolve/#resolving-built-ins-like-fs

  if (options.target === 'node') {
    external = [/node:.*/].concat(builtinModules__default['default']);
  }

  const peerDeps = Object.keys(pkg.peerDependencies || {});

  if (options.external === 'none') ; else if (options.external) {
    external = external.concat(peerDeps).concat( // CLI --external supports regular expressions:
    options.external.split(',').map(str => new RegExp(str)));
  } else {
    external = external.concat(peerDeps).concat(Object.keys(pkg.dependencies || {}));
  }

  let globals = external.reduce((globals, name) => {
    // Use raw value for CLI-provided RegExp externals:
    if (name instanceof RegExp) name = name.source; // valid JS identifiers are usually library globals:

    if (name.match(/^[a-z_$][a-z0-9_\-$]*$/)) {
      globals[name] = camelCase__default['default'](name);
    }

    return globals;
  }, {});

  if (options.globals && options.globals !== 'none') {
    globals = Object.assign(globals, parseMappingArgument(options.globals));
  }

  let defines = {};

  if (options.define) {
    defines = Object.assign(defines, parseMappingArgument(options.define, toReplacementExpression));
  }

  const modern = format === 'modern'; // let rollupName = safeVariableName(basename(entry).replace(/\.js$/, ''));

  let nameCache = {};
  const bareNameCache = nameCache; // Support "minify" field and legacy "mangle" field via package.json:

  const rawMinifyValue = options.pkg.minify || options.pkg.mangle || {};
  let minifyOptions = typeof rawMinifyValue === 'string' ? {} : rawMinifyValue;
  const getNameCachePath = typeof rawMinifyValue === 'string' ? () => path.resolve(options.cwd, rawMinifyValue) : () => path.resolve(options.cwd, 'mangle.json');
  const useTypescript = path.extname(entry) === '.ts' || path.extname(entry) === '.tsx';
  const emitDeclaration = options.generateTypes == null ? !!(pkg.types || pkg.typings) : options.generateTypes;
  const useWorkerLoader = options.workers !== false;

  const escapeStringExternals = ext => ext instanceof RegExp ? ext.source : escapeStringRegexp__default['default'](ext);

  const externalPredicate = new RegExp(`^(${external.map(escapeStringExternals).join('|')})($|/)`);
  const externalTest = external.length === 0 ? id => false : id => externalPredicate.test(id);
  let endsWithNewLine = false;

  function loadNameCache() {
    try {
      const data = fs__default['default'].readFileSync(getNameCachePath(), 'utf8');
      endsWithNewLine = data.endsWith(os.EOL);
      nameCache = JSON.parse(data); // mangle.json can contain a "minify" field, same format as the pkg.mangle:

      if (nameCache.minify) {
        minifyOptions = Object.assign({}, minifyOptions || {}, nameCache.minify);
      }
    } catch (e) {}
  }

  loadNameCache();
  normalizeMinifyOptions(minifyOptions);
  if (nameCache === bareNameCache) nameCache = null;
  /** @type {false | import('rollup').RollupCache} */

  let cache;
  if (modern) cache = false;
  const absMain = path.resolve(options.cwd, getMain({
    options,
    entry,
    format
  }));
  const outputDir = path.dirname(absMain);
  const outputEntryFileName = path.basename(absMain); // Warn about the (somewhat) breaking change in #950

  if (format === 'es' && !pkg.module && outputEntryFileName.endsWith('.mjs')) {
    stdout(kleur.yellow('Warning: your package.json does not specify {"type":"module"}. Microbundle assumes this is a CommonJS package and is generating ES Modules with the ".mjs" file extension.'));
  }

  let config = {
    /** @type {import('rollup').InputOptions} */
    inputOptions: {
      // disable Rollup's cache for modern builds to prevent re-use of legacy transpiled modules:
      cache,
      input: entry,
      external: id => {
        if (id === 'babel-plugin-transform-async-to-promises/helpers') {
          return false;
        }

        if (aliasIds.indexOf(id) >= 0) {
          return false;
        }

        return externalTest(id);
      },

      onwarn(warning, warn) {
        // https://github.com/rollup/rollup/blob/0fa9758cb7b1976537ae0875d085669e3a21e918/src/utils/error.ts#L324
        if (warning.code === 'UNRESOLVED_IMPORT') {
          stdout(`Failed to resolve the module ${warning.source} imported by ${warning.importer}` + `\nIs the module installed? Note:` + `\n ↳ to inline a module into your bundle, install it to "devDependencies".` + `\n ↳ to depend on a module via import/require, install it to "dependencies".`);
          return;
        }

        warn(warning);
      },

      treeshake: {
        propertyReadSideEffects: false
      },
      plugins: [].concat(postcss__default['default']({
        plugins: [autoprefixer__default['default']()],
        autoModules: shouldCssModules(options),
        modules: cssModulesConfig(options),
        // only write out CSS for the first bundle (avoids pointless extra files):
        inject: false,
        extract: !!writeMeta && options.css !== 'inline' && absMain.replace(EXTENSION, '.css'),
        minimize: options.compress,
        sourceMap: options.sourcemap && options.css !== 'inline'
      }), moduleAliases.length > 0 && alias__default['default']({
        // @TODO: this is no longer supported, but didn't appear to be required?
        // resolve: EXTENSIONS,
        entries: moduleAliases
      }), nodeResolve__default['default']({
        mainFields: ['module', 'jsnext', 'main'],
        browser: options.target !== 'node',
        exportConditions: [options.target === 'node' ? 'node' : 'browser'],
        // defaults + .jsx
        extensions: ['.mjs', '.js', '.jsx', '.json', '.node'],
        preferBuiltins: options.target === 'node'
      }), commonjs__default['default']({
        // use a regex to make sure to include eventual hoisted packages
        include: /\/node_modules\//,
        esmExternals: false,
        requireReturnsDefault: 'namespace'
      }), json__default['default'](), {
        // We have to remove shebang so it doesn't end up in the middle of the code somewhere
        transform: code => ({
          code: code.replace(/^#![^\n]*/, bang => {
            shebang[options.name] = bang;
          }),
          map: null
        })
      }, (useTypescript || emitDeclaration) && typescript__default['default']({
        cwd: options.cwd,
        typescript: require(resolveFrom_1.silent(options.cwd, 'typescript') || 'typescript'),
        cacheRoot: `./node_modules/.cache/.rts2_cache_${format}`,
        useTsconfigDeclarationDir: true,
        tsconfigDefaults: {
          compilerOptions: {
            sourceMap: options.sourcemap,
            declaration: options.generateTypes !== false,
            allowJs: true,
            emitDeclarationOnly: options.generateTypes && !useTypescript,
            ...(options.generateTypes !== false && {
              declarationDir: getDeclarationDir({
                options,
                pkg
              })
            }),
            jsx: 'preserve',
            jsxFactory: options.jsx,
            jsxFragmentFactory: options.jsxFragment
          },
          files: options.entries
        },
        tsconfig: options.tsconfig,
        tsconfigOverride: {
          compilerOptions: {
            module: 'ESNext',
            target: 'esnext'
          }
        }
      }), // if defines is not set, we shouldn't run babel through node_modules
      isTruthy(defines) && babel__default['default']({
        babelHelpers: 'bundled',
        babelrc: false,
        compact: false,
        configFile: false,
        include: 'node_modules/**',
        plugins: [[require.resolve('babel-plugin-transform-replace-expressions'), {
          replace: defines
        }]]
      }), customBabel()({
        babelHelpers: 'bundled',
        extensions: EXTENSIONS,
        // use a regex to make sure to exclude eventual hoisted packages
        exclude: /\/node_modules\//,
        passPerPreset: true,
        // @see https://babeljs.io/docs/en/options#passperpreset
        custom: {
          defines,
          modern,
          compress: options.compress !== false,
          targets: options.target === 'node' ? {
            node: '12'
          } : undefined,
          pragma: options.jsx,
          pragmaFrag: options.jsxFragment,
          typescript: !!useTypescript,
          jsxImportSource: options.jsxImportSource || false
        }
      }), options.compress !== false && [rollupPluginTerser.terser({
        compress: Object.assign({
          keep_infinity: true,
          pure_getters: true,
          // Ideally we'd just get Terser to respect existing Arrow functions...
          // unsafe_arrows: true,
          passes: 10
        }, typeof minifyOptions.compress === 'boolean' ? minifyOptions.compress : minifyOptions.compress || {}),
        format: {
          // By default, Terser wraps function arguments in extra parens to trigger eager parsing.
          // Whether this is a good idea is way too specific to guess, so we optimize for size by default:
          wrap_func_args: false,
          comments: /^\s*([@#]__[A-Z]+__\s*$|@cc_on)/,
          preserve_annotations: true
        },
        module: modern,
        ecma: modern ? 2017 : 5,
        toplevel: modern || format === 'cjs' || format === 'es',
        mangle: typeof minifyOptions.mangle === 'boolean' ? minifyOptions.mangle : Object.assign({}, minifyOptions.mangle || {}),
        nameCache
      }), nameCache && {
        // before hook
        options: loadNameCache,

        // after hook
        writeBundle() {
          if (writeMeta && nameCache) {
            let filename = getNameCachePath();
            let json = JSON.stringify(nameCache, null, 2);
            if (endsWithNewLine) json += os.EOL;
            fs__default['default'].writeFile(filename, json, () => {});
          }
        }

      }], options.visualize && rollupPluginVisualizer.visualizer(), // NOTE: OMT only works with amd and esm
      // Source: https://github.com/surma/rollup-plugin-off-main-thread#config
      useWorkerLoader && (format === 'es' || modern) && OMT__default['default'](),
      /** @type {import('rollup').Plugin} */
      {
        name: 'postprocessing',

        // Rollup 2 injects globalThis, which is nice, but doesn't really make sense for Microbundle.
        // Only ESM environments necessitate globalThis, and UMD bundles can't be properly loaded as ESM.
        // So we remove the globalThis check, replacing it with `this||self` to match Rollup 1's output:
        renderChunk(code, chunk, opts) {
          if (opts.format === 'umd') {
            // minified:
            code = code.replace(/([a-zA-Z$_]+)="undefined"!=typeof globalThis\?globalThis:(\1\|\|self)/, '$2'); // unminified:

            code = code.replace(/(global *= *)typeof +globalThis *!== *['"]undefined['"] *\? *globalThis *: *(global *\|\| *self)/, '$1$2');
            return {
              code,
              map: null
            };
          }
        },

        // Grab size info before writing files to disk:
        writeBundle(_, bundle) {
          config._sizeInfo = Promise.all(Object.values(bundle).map(({
            code,
            fileName
          }) => {
            if (code) {
              return getSizeInfo(code, fileName, options.raw);
            }
          })).then(results => results.filter(Boolean).join('\n'));
        }

      }).filter(Boolean)
    },

    /** @type {import('rollup').OutputOptions} */
    outputOptions: {
      paths: outputAliases,
      globals,
      strict: options.strict === true,
      freeze: false,
      esModule: false,
      sourcemap: options.sourcemap,

      get banner() {
        return shebang[options.name];
      },

      format: modern ? 'es' : format,
      name: options.name && options.name.replace(/^global\./, ''),
      extend: /^global\./.test(options.name),
      dir: outputDir,
      entryFileNames: outputEntryFileName,
      exports: 'auto'
    }
  };
  return config;
}

let {
  version
} = require('../package.json');

const toArray = val => Array.isArray(val) ? val : val == null ? [] : [val];

var prog = (handler => {
  const ENABLE_MODERN = process.env.MICROBUNDLE_MODERN !== 'false';
  const DEFAULT_FORMATS = ENABLE_MODERN ? 'modern,esm,cjs,umd' : 'esm,cjs,umd';

  const cmd = type => (str, opts) => {
    opts.watch = opts.watch || type === 'watch';
    opts.entries = toArray(str || opts.entry).concat(opts._);

    if (typeof opts.compress !== 'undefined') {
      // Convert `--compress true/false/1/0` to booleans:
      if (typeof opts.compress !== 'boolean') {
        opts.compress = opts.compress !== 'false' && opts.compress !== '0';
      }
    } else {
      // the default compress value is `true` for web, `false` for Node:
      opts.compress = opts.target !== 'node';
    }

    handler(opts);
  };

  let prog = sade__default['default']('microbundle');
  prog.version(version).option('--entry, -i', 'Entry module(s)').option('--output, -o', 'Directory to place build files into').option('--format, -f', `Only build specified formats (any of ${DEFAULT_FORMATS} or iife)`, DEFAULT_FORMATS).option('--watch, -w', 'Rebuilds on any change', false).option('--pkg-main', 'Outputs files analog to package.json main entries', true).option('--target', 'Specify your target environment (node or web)', 'web').option('--external', `Specify external dependencies, or 'none'`).option('--globals', `Specify globals dependencies, or 'none'`).example('--globals react=React,jquery=$').option('--define', 'Replace constants with hard-coded values').example('--define API_KEY=1234').option('--alias', `Map imports to different modules`).example('--alias react=preact').option('--compress', 'Compress output using Terser (default true when --target is web, false when --target is node)').example('build --target web --no-compress').option('--strict', 'Enforce undefined global context and add "use strict"').option('--name', 'Specify name exposed in UMD builds').option('--cwd', 'Use an alternative working directory', '.').option('--sourcemap', 'Generate source map').example("watch --no-sourcemap # don't generate sourcemaps").option('--raw', 'Show raw byte size', false).option('--jsx', 'A custom JSX pragma like React.createElement', 'h').option('--jsxFragment', 'A custom JSX fragment pragma like React.Fragment', 'Fragment').option('--jsxImportSource', 'Declares the module specifier to be used for importing jsx factory functions').option('--tsconfig', 'Specify the path to a custom tsconfig.json').example('build --tsconfig tsconfig.build.json').option('--generateTypes', 'Whether or not to generate types , if `types` or `typings` is set in `package.json` then it will default to be `true`').option('--css', 'Where to output CSS: "inline" or "external"', 'external').option('--css-modules', 'Turns on css-modules for all .css imports. Passing a string will override the scopeName. eg --css-modules="_[hash]"', null).option('--workers', 'Bundle module workers - see https://github.com/surma/rollup-plugin-off-main-thread#auto-bundling', false).option('--visualize', 'Generate bundle makeup visualization (stats.html)', false);
  prog.command('build [...entries]', '', {
    default: true
  }).describe('Build once and exit').action(cmd('build'));
  prog.command('watch [...entries]').describe('Rebuilds on any change').action(cmd('watch')); // Parse argv; add extra aliases

  return argv => prog.parse(argv, {
    alias: {
      o: ['output', 'd'],
      i: ['entry', 'entries', 'e'],
      w: ['watch']
    },
    boolean: ['generateTypes']
  });
});

const run = opts => {
  microbundle(opts).then(({
    output
  }) => {
    if (output != null) stdout(output);
    if (!opts.watch) process.exit(0);
  }).catch(err => {
    process.exitCode = typeof err.code === 'number' && err.code || 1;
    logError(err);
    process.exit();
  });
};

prog(run)(process.argv);
//# sourceMappingURL=cli.js.map
