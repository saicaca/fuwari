import { blankIconSet } from '../../icon-set/index.mjs';
import { SVG } from '../../svg/index.mjs';
import { cleanupSVG } from '../../svg/cleanup.mjs';
import { getFigmaIconNodes } from './nodes.mjs';
import { figmaFilesQuery, figmaImagesQuery, figmaDownloadImages } from './query.mjs';
import '@iconify/utils/lib/icon/defaults';
import '@iconify/utils/lib/svg/build';
import '@iconify/utils/lib/icon-set/minify';
import '@iconify/utils/lib/icon-set/convert-info';
import '../../icon-set/props.mjs';
import '@iconify/utils/lib/misc/objects';
import '@iconify/utils';
import 'cheerio';
import '../../svg/cleanup/attribs.mjs';
import '../../svg/data/attributes.mjs';
import '../../svg/data/tags.mjs';
import '../../svg/parse.mjs';
import '../../svg/cleanup/bad-tags.mjs';
import '../../svg/cleanup/inline-style.mjs';
import '../../css/parse.mjs';
import '../../css/parser/tokens.mjs';
import '../../css/parser/error.mjs';
import '../../css/parser/strings.mjs';
import '../../css/parser/text.mjs';
import '../../svg/cleanup/root-style.mjs';
import '../../svg/parse-style.mjs';
import '../../css/parser/export.mjs';
import '../../css/parser/tree.mjs';
import '../../svg/cleanup/root-svg.mjs';
import '../../svg/cleanup/svgo-style.mjs';
import '../../optimise/svgo.mjs';
import 'svgo';
import '@iconify/utils/lib/svg/id';
import '../../download/api/index.mjs';
import 'axios';
import '../../download/api/cache.mjs';
import 'fs';
import 'crypto';
import '../../misc/scan.mjs';
import '../../download/api/config.mjs';
import '../../download/api/queue.mjs';

async function importFromFigma(options) {
  const cacheOptions = options.cacheDir ? {
    // 24 hours
    ttl: options.cacheAPITTL || 60 * 60 * 24,
    dir: options.cacheDir
  } : void 0;
  const cacheSVGOptions = options.cacheDir ? {
    // 30 days
    ttl: options.cacheSVGTTL || 60 * 60 * 24 * 30,
    dir: options.cacheDir
  } : void 0;
  const document = await figmaFilesQuery(
    options,
    cacheOptions
  );
  if (document === "not_modified") {
    return document;
  }
  options.version = document.version;
  const nodes = getFigmaIconNodes(document, options);
  await figmaImagesQuery(options, nodes, cacheOptions);
  await figmaDownloadImages(nodes, cacheSVGOptions);
  const iconSet = blankIconSet(options.prefix);
  const icons = nodes.icons;
  const missing = [];
  const iconIDs = Object.keys(icons);
  for (let i = 0; i < iconIDs.length; i++) {
    const id = iconIDs[i];
    const item = icons[id];
    if (typeof item.content !== "string") {
      missing.push(item);
      continue;
    }
    if (options.beforeImportingIcon) {
      const callbackResult = options.beforeImportingIcon(item, iconSet);
      if (callbackResult instanceof Promise) {
        await callbackResult;
      }
    }
    try {
      const svg = new SVG(item.content);
      cleanupSVG(svg);
      iconSet.fromSVG(item.keyword, svg);
    } catch (err) {
      missing.push(item);
      continue;
    }
    if (options.afterImportingIcon) {
      const callbackResult = options.afterImportingIcon(item, iconSet);
      if (callbackResult instanceof Promise) {
        await callbackResult;
      }
    }
  }
  const result = {
    // Document
    name: document.name,
    version: document.version,
    lastModified: document.lastModified,
    // Counters
    nodesCount: nodes.nodesCount,
    generatedIconsCount: nodes.generatedIconsCount,
    downloadedIconsCount: nodes.downloadedIconsCount,
    // Icon set
    iconSet,
    missing
  };
  return result;
}

export { importFromFigma };
