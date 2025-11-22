import { promises, readFileSync } from 'fs';
import { blankIconSet } from '../icon-set/index.mjs';
import { cleanupIconKeyword } from '../misc/keyword.mjs';
import { scanDirectory, scanDirectorySync } from '../misc/scan.mjs';
import { SVG } from '../svg/index.mjs';
import { cleanupSVG } from '../svg/cleanup.mjs';
import '@iconify/utils/lib/icon/defaults';
import '@iconify/utils/lib/svg/build';
import '@iconify/utils/lib/icon-set/minify';
import '@iconify/utils/lib/icon-set/convert-info';
import '../icon-set/props.mjs';
import '@iconify/utils/lib/misc/objects';
import '@iconify/utils';
import 'cheerio';
import '../svg/cleanup/attribs.mjs';
import '../svg/data/attributes.mjs';
import '../svg/data/tags.mjs';
import '../svg/parse.mjs';
import '../svg/cleanup/bad-tags.mjs';
import '../svg/cleanup/inline-style.mjs';
import '../css/parse.mjs';
import '../css/parser/tokens.mjs';
import '../css/parser/error.mjs';
import '../css/parser/strings.mjs';
import '../css/parser/text.mjs';
import '../svg/cleanup/root-style.mjs';
import '../svg/parse-style.mjs';
import '../css/parser/export.mjs';
import '../css/parser/tree.mjs';
import '../svg/cleanup/root-svg.mjs';
import '../svg/cleanup/svgo-style.mjs';
import '../optimise/svgo.mjs';
import 'svgo';
import '@iconify/utils/lib/svg/id';

function importDir(iconSet, options, getKeyword, files, readFile, done) {
  let i = 0;
  const next = () => {
    if (i >= files.length) {
      return done(iconSet);
    }
    const file = files[i];
    i++;
    const defaultKeyword = cleanupIconKeyword(file.file);
    getKeyword([file, defaultKeyword, iconSet], (keyword) => {
      if (typeof keyword !== "string" || !keyword.length) {
        return next();
      }
      readFile(
        file.path + file.subdir + file.file + file.ext,
        (content) => {
          try {
            const svg = new SVG(content);
            cleanupSVG(svg, options);
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
    scanDirectory(
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
      const iconSet = blankIconSet(options.prefix || "");
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
            promises.readFile(filename, "utf8").then(done).catch(reject);
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
  const files = scanDirectorySync(
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
  const iconSet = blankIconSet(options.prefix || "");
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
      done(readFileSync(filename, "utf8"));
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

export { importDirectory, importDirectorySync };
