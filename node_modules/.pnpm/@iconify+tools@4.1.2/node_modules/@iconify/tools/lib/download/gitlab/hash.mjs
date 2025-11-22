import { sendAPIQuery } from '../api/index.mjs';
import { defaultGitLabBaseURI } from './types.mjs';
import 'axios';
import '../api/cache.mjs';
import 'fs';
import 'crypto';
import '../../misc/scan.mjs';
import '../api/config.mjs';

async function getGitLabRepoHash(options) {
  const uri = `${options.uri || defaultGitLabBaseURI}/${options.project}/repository/branches/${options.branch}/`;
  const data = await sendAPIQuery({
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

export { getGitLabRepoHash };
