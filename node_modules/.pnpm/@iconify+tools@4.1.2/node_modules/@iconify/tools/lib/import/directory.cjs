'use strict';

const fs = require('fs');
const iconSet_index = require('../icon-set/index.cjs');
const misc_keyword = require('../misc/keyword.cjs');
const misc_scan = require('../misc/scan.cjs');
const svg_index = require('../svg/index.cjs');
const svg_cleanup = require('../svg/cleanup.cjs');
require('@iconify/utils/lib/icon/defaults');
require('@iconify/utils/lib/svg/build');
require('@iconify/utils/lib/icon-set/minify');
require('@iconify/utils/lib/icon-set/convert-info');
require('../icon-set/props.cjs');
require('@iconify/utils/lib/misc/objects');
require('@iconify/utils');
require('cheerio');
require('../svg/cleanup/attribs.cjs');
require('../svg/data/attributes.cjs');
require('../svg/data/tags.cjs');
require('../svg/parse.cjs');
require('../svg/cleanup/bad-tags.cjs');
require('../svg/cleanup/inline-style.cjs');
require('../css/parse.cjs');
require('../css/parser/tokens.cjs');
require('../css/parser/error.cjs');
require('../css/parser/strings.cjs');
require('../css/parser/text.cjs');
require('../svg/cleanup/root-style.cjs');
require('../svg/parse-style.cjs');
require('../css/parser/export.cjs');
require('../css/parser/tree.cjs');
require('../svg/cleanup/root-svg.cjs');
require('../svg/cleanup/svgo-style.cjs');
require('../optimise/svgo.cjs');
require('svgo');
require('@iconify/utils/lib/svg/id');

function importDir(iconSet, options, getKeyword, files, readFile, done) {
  let i = 0;
  const next = () => {
    if (i >= files.length) {
      return done(iconSet);
    }
    const file = files[i];
    i++;
    const defaultKeyword = misc_keyword.cleanupIconKeyword(file.file);
    getKeyword([file, defaultKeyword, iconSet], (keyword) => {
      if (typeof keyword !== "string" || !keyword.length) {
        return next();
      }
      readFile(
        file.path + file.subdir + file.file + file.ext,
        (content) => {
          try {
            const svg = new svg_index.SVG(content);
            svg_cleanup.cleanupSVG(svg, options);
            iconSet.fromSVG(keyword, svg);
          } catch (err) {
            const ignore = options.ignoreImportErrors ?? false;
            if (ignore === false || ignore === "warn") {
              let msg = `Failed to import "${keyword}"`;
              if (err instanceof Error) {
                msg += `: ${err.message}`;
              }
              if (ignore === false) {
                throw new Error(msg);
              } else {
                console.warn(msg);
              }
            }
          }
          next();
        }
      );
    });
  };
  next();
}
function isValidFile(item) {
  return item.ext.toLowerCase() === ".svg";
}
function importDirectory(path, options = {}) {
  return new Promise((fulfill, reject) => {
    misc_scan.scanDirectory(
      path,
      (ext, file, subdir, path2) => {
        const result = {
          file,
          ext,
          subdir,
          path: path2
        };
        return isValidFile(result) ? result : false;
      },
      options.includeSubDirs !== false
    ).then((files) => {
      const iconSet = iconSet_index.blankIconSet(options.prefix || "");
      try {
        importDir(
          iconSet,
          options,
          (params, done) => {
            if (options.keyword) {
              const result = options.keyword(...params);
              if (result instanceof Promise) {
                result.then(done).catch(reject);
              } else {
                done(result);
              }
            } else {
              done(params[1]);
            }
          },
          files,
          (filename, done) => {
            fs.promises.readFile(filename, "utf8").then(done).catch(reject);
          },
          fulfill
        );
      } catch (err) {
        reject(err);
      }
    }).catch(reject);
  });
}
function importDirectorySync(path, options = {}) {
  const files = misc_scan.scanDirectorySync(
    path,
    (ext, file, subdir, path2) => {
      const result = {
        file,
        ext,
        subdir,
        path: path2
      };
      return isValidFile(result) ? result : false;
    },
    options.includeSubDirs !== false
  );
  const iconSet = iconSet_index.blankIconSet(options.prefix || "");
  let isSync = true;
  importDir(
    iconSet,
    options,
    (params, done) => {
      if (options.keyword) {
        done(options.keyword(...params));
      } else {
        done(params[1]);
      }
    },
    files,
    (filename, done) => {
      done(fs.readFileSync(filename, "utf8"));
    },
    () => {
      if (!isSync) {
        throw new Error(
          "importDirectorySync supposed to be synchronous"
        );
      }
    }
  );
  isSync = false;
  return iconSet;
}

exports.importDirectory = importDirectory;
exports.importDirectorySync = importDirectorySync;
