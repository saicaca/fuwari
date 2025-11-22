import { sendAPIQuery } from '../api/index.mjs';
import 'axios';
import '../api/cache.mjs';
import 'fs';
import 'crypto';
import '../../misc/scan.mjs';
import '../api/config.mjs';

async function getGitHubRepoHash(options) {
  const uri = `https://api.github.com/repos/${options.user}/${options.repo}/branches/${options.branch}`;
  const data = await sendAPIQuery({
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

export { getGitHubRepoHash };
