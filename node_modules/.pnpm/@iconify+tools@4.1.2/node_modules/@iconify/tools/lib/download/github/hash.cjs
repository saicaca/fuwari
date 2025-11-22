'use strict';

const download_api_index = require('../api/index.cjs');
require('axios');
require('../api/cache.cjs');
require('fs');
require('crypto');
require('../../misc/scan.cjs');
require('../api/config.cjs');

async function getGitHubRepoHash(options) {
  const uri = `https://api.github.com/repos/${options.user}/${options.repo}/branches/${options.branch}`;
  const data = await download_api_index.sendAPIQuery({
    uri,
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: "token " + options.token
    }
  });
  if (typeof data !== "string") {
    throw new Error(`Error downloading data from GitHub API: ${data}`);
  }
  const content = JSON.parse(data);
  const hash = content?.commit?.sha;
  if (typeof hash !== "string") {
    throw new Error("Error parsing GitHub API response");
  }
  return hash;
}

exports.getGitHubRepoHash = getGitHubRepoHash;
