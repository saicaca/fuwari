'use strict';

const iconSet_index = require('../../icon-set/index.cjs');
const svg_index = require('../../svg/index.cjs');
const svg_cleanup = require('../../svg/cleanup.cjs');
const import_figma_nodes = require('./nodes.cjs');
const import_figma_query = require('./query.cjs');
require('@iconify/utils/lib/icon/defaults');
require('@iconify/utils/lib/svg/build');
require('@iconify/utils/lib/icon-set/minify');
require('@iconify/utils/lib/icon-set/convert-info');
require('../../icon-set/props.cjs');
require('@iconify/utils/lib/misc/objects');
require('@iconify/utils');
require('cheerio');
require('../../svg/cleanup/attribs.cjs');
require('../../svg/data/attributes.cjs');
require('../../svg/data/tags.cjs');
require('../../svg/parse.cjs');
require('../../svg/cleanup/bad-tags.cjs');
require('../../svg/cleanup/inline-style.cjs');
require('../../css/parse.cjs');
require('../../css/parser/tokens.cjs');
require('../../css/parser/error.cjs');
require('../../css/parser/strings.cjs');
require('../../css/parser/text.cjs');
require('../../svg/cleanup/root-style.cjs');
require('../../svg/parse-style.cjs');
require('../../css/parser/export.cjs');
require('../../css/parser/tree.cjs');
require('../../svg/cleanup/root-svg.cjs');
require('../../svg/cleanup/svgo-style.cjs');
require('../../optimise/svgo.cjs');
require('svgo');
require('@iconify/utils/lib/svg/id');
require('../../download/api/index.cjs');
require('axios');
require('../../download/api/cache.cjs');
require('fs');
require('crypto');
require('../../misc/scan.cjs');
require('../../download/api/config.cjs');
require('../../download/api/queue.cjs');

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
  const document = await import_figma_query.figmaFilesQuery(
    options,
    cacheOptions
  );
  if (document === "not_modified") {
    return document;
  }
  options.version = document.version;
  const nodes = import_figma_nodes.getFigmaIconNodes(document, options);
  await import_figma_query.figmaImagesQuery(options, nodes, cacheOptions);
  await import_figma_query.figmaDownloadImages(nodes, cacheSVGOptions);
  const iconSet = iconSet_index.blankIconSet(options.prefix);
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
      const svg = new svg_index.SVG(item.content);
      svg_cleanup.cleanupSVG(svg);
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

exports.importFromFigma = importFromFigma;
