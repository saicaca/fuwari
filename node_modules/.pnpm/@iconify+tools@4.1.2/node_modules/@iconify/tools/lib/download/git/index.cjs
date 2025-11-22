'use strict';

const export_helpers_prepare = require('../../export/helpers/prepare.cjs');
const misc_exec = require('../../misc/exec.cjs');
const download_git_branch = require('./branch.cjs');
const download_git_hash = require('./hash.cjs');
const download_git_reset = require('./reset.cjs');
require('fs');
require('pathe');
require('child_process');
require('cheerio');
require('@iconify/utils');
require('../../svg/data/attributes.cjs');
require('../../svg/data/tags.cjs');
require('../../svg/cleanup/bad-tags.cjs');
require('../../svg/parse.cjs');
require('svgo');
require('@iconify/utils/lib/svg/id');
require('@iconify/utils/lib/icon/defaults');
require('@iconify/utils/lib/svg/build');
require('@iconify/utils/lib/icon-set/minify');
require('@iconify/utils/lib/icon-set/convert-info');
require('../../icon-set/props.cjs');
require('@iconify/utils/lib/misc/objects');
require('@iconify/utils/lib/colors');
require('axios');
require('crypto');
require('fs/promises');
require('extract-zip');
require('tar');

async function downloadGitRepo(options) {
  const { remote, branch } = options;
  const hasHashInTarget = options.target.includes("{hash}");
  const ifModifiedSince = options.ifModifiedSince;
  if (ifModifiedSince || hasHashInTarget) {
    const result = await misc_exec.execAsync(
      `git ls-remote ${remote} --branch ${branch}`
    );
    const parts = result.stdout.split(/\s/);
    const latestHash = parts.shift();
    if (hasHashInTarget) {
      options.target = options.target.replace("{hash}", latestHash);
    }
    try {
      await download_git_branch.getGitRepoBranch(options, branch);
      if (ifModifiedSince) {
        const expectedHash = ifModifiedSince === true ? await download_git_hash.getGitRepoHash(options) : typeof ifModifiedSince === "string" ? ifModifiedSince : ifModifiedSince.downloadType === "git" ? ifModifiedSince.hash : null;
        if (latestHash === expectedHash) {
          await download_git_reset.resetGitRepoContents(options.target);
          return "not_modified";
        }
      }
    } catch {
    }
  }
  const target = options.target = await export_helpers_prepare.prepareDirectoryForExport({
    ...options,
    // Always cleanup
    cleanup: true
  });
  if (options.log) {
    console.log(`Cloning ${remote}#${branch} to ${target}`);
  }
  await misc_exec.execAsync(
    `git clone --branch ${branch} --no-tags --depth 1 ${remote} "${target}"`
  );
  const hash = await download_git_hash.getGitRepoHash(options);
  await download_git_branch.getGitRepoBranch(options, branch);
  return {
    downloadType: "git",
    contentsDir: target,
    hash
  };
}

exports.downloadGitRepo = downloadGitRepo;
