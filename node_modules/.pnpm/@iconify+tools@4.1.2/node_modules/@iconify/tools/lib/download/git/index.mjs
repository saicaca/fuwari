import { prepareDirectoryForExport } from '../../export/helpers/prepare.mjs';
import { execAsync } from '../../misc/exec.mjs';
import { getGitRepoBranch } from './branch.mjs';
import { getGitRepoHash } from './hash.mjs';
import { resetGitRepoContents } from './reset.mjs';
import 'fs';
import 'pathe';
import 'child_process';
import 'cheerio';
import '@iconify/utils';
import '../../svg/data/attributes.mjs';
import '../../svg/data/tags.mjs';
import '../../svg/cleanup/bad-tags.mjs';
import '../../svg/parse.mjs';
import 'svgo';
import '@iconify/utils/lib/svg/id';
import '@iconify/utils/lib/icon/defaults';
import '@iconify/utils/lib/svg/build';
import '@iconify/utils/lib/icon-set/minify';
import '@iconify/utils/lib/icon-set/convert-info';
import '../../icon-set/props.mjs';
import '@iconify/utils/lib/misc/objects';
import '@iconify/utils/lib/colors';
import 'axios';
import 'crypto';
import 'fs/promises';
import 'extract-zip';
import 'tar';

async function downloadGitRepo(options) {
  const { remote, branch } = options;
  const hasHashInTarget = options.target.includes("{hash}");
  const ifModifiedSince = options.ifModifiedSince;
  if (ifModifiedSince || hasHashInTarget) {
    const result = await execAsync(
      `git ls-remote ${remote} --branch ${branch}`
    );
    const parts = result.stdout.split(/\s/);
    const latestHash = parts.shift();
    if (hasHashInTarget) {
      options.target = options.target.replace("{hash}", latestHash);
    }
    try {
      await getGitRepoBranch(options, branch);
      if (ifModifiedSince) {
        const expectedHash = ifModifiedSince === true ? await getGitRepoHash(options) : typeof ifModifiedSince === "string" ? ifModifiedSince : ifModifiedSince.downloadType === "git" ? ifModifiedSince.hash : null;
        if (latestHash === expectedHash) {
          await resetGitRepoContents(options.target);
          return "not_modified";
        }
      }
    } catch {
    }
  }
  const target = options.target = await prepareDirectoryForExport({
    ...options,
    // Always cleanup
    cleanup: true
  });
  if (options.log) {
    console.log(`Cloning ${remote}#${branch} to ${target}`);
  }
  await execAsync(
    `git clone --branch ${branch} --no-tags --depth 1 ${remote} "${target}"`
  );
  const hash = await getGitRepoHash(options);
  await getGitRepoBranch(options, branch);
  return {
    downloadType: "git",
    contentsDir: target,
    hash
  };
}

export { downloadGitRepo };
