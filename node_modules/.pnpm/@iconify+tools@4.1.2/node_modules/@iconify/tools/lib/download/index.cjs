'use strict';

const download_github_index = require('./github/index.cjs');
const download_git_index = require('./git/index.cjs');
const download_npm_index = require('./npm/index.cjs');
const download_gitlab_index = require('./gitlab/index.cjs');
require('fs');
require('../export/helpers/prepare.cjs');
require('pathe');
require('./github/hash.cjs');
require('./api/index.cjs');
require('axios');
require('./api/cache.cjs');
require('crypto');
require('../misc/scan.cjs');
require('./api/config.cjs');
require('./api/download.cjs');
require('fs/promises');
require('./helpers/unzip.cjs');
require('extract-zip');
require('../misc/exec.cjs');
require('child_process');
require('./git/branch.cjs');
require('./git/hash.cjs');
require('./git/reset.cjs');
require('cheerio');
require('@iconify/utils');
require('../svg/data/attributes.cjs');
require('../svg/data/tags.cjs');
require('../svg/cleanup/bad-tags.cjs');
require('../svg/parse.cjs');
require('svgo');
require('@iconify/utils/lib/svg/id');
require('@iconify/utils/lib/icon/defaults');
require('@iconify/utils/lib/svg/build');
require('@iconify/utils/lib/icon-set/minify');
require('@iconify/utils/lib/icon-set/convert-info');
require('../icon-set/props.cjs');
require('@iconify/utils/lib/misc/objects');
require('@iconify/utils/lib/colors');
require('tar');
require('./helpers/untar.cjs');
require('./npm/version.cjs');
require('./gitlab/hash.cjs');
require('./gitlab/types.cjs');

function downloadPackage(options) {
  switch (options.downloadType) {
    case "git":
      return download_git_index.downloadGitRepo(options);
    case "github":
      return download_github_index.downloadGitHubRepo(options);
    case "gitlab":
      return download_gitlab_index.downloadGitLabRepo(options);
    case "npm":
      return download_npm_index.downloadNPMPackage(options);
    default:
      throw new Error(
        `Invalid download type: ${options.downloadType}`
      );
  }
}

exports.downloadPackage = downloadPackage;
