'use strict';

const download_api_index = require('../api/index.cjs');
const download_gitlab_types = require('./types.cjs');
require('axios');
require('../api/cache.cjs');
require('fs');
require('crypto');
require('../../misc/scan.cjs');
require('../api/config.cjs');

async function getGitLabRepoHash(options) {
  const uri = `${options.uri || download_gitlab_types.defaultGitLabBaseURI}/${options.project}/repository/branches/${options.branch}/`;
  const data = await download_api_index.sendAPIQuery({
    uri,
    headers: {
      Authorization: "token " + options.token
    }
  });
  if (typeof data !== "string") {
    throw new Error(`Error downloading data from GitLab API: ${data}`);
  }
  const content = JSON.parse(data);
  const item = (content instanceof Array ? content : [content]).find(
    (item2) => item2.name === options.branch && typeof item2.commit.id === "string"
  );
  if (!item) {
    throw new Error("Error parsing GitLab API response");
  }
  return item.commit.id;
}

exports.getGitLabRepoHash = getGitLabRepoHash;
