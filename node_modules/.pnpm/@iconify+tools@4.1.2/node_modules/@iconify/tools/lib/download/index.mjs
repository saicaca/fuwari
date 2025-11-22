import { downloadGitHubRepo } from './github/index.mjs';
import { downloadGitRepo } from './git/index.mjs';
import { downloadNPMPackage } from './npm/index.mjs';
import { downloadGitLabRepo } from './gitlab/index.mjs';
import 'fs';
import '../export/helpers/prepare.mjs';
import 'pathe';
import './github/hash.mjs';
import './api/index.mjs';
import 'axios';
import './api/cache.mjs';
import 'crypto';
import '../misc/scan.mjs';
import './api/config.mjs';
import './api/download.mjs';
import 'fs/promises';
import './helpers/unzip.mjs';
import 'extract-zip';
import '../misc/exec.mjs';
import 'child_process';
import './git/branch.mjs';
import './git/hash.mjs';
import './git/reset.mjs';
import 'cheerio';
import '@iconify/utils';
import '../svg/data/attributes.mjs';
import '../svg/data/tags.mjs';
import '../svg/cleanup/bad-tags.mjs';
import '../svg/parse.mjs';
import 'svgo';
import '@iconify/utils/lib/svg/id';
import '@iconify/utils/lib/icon/defaults';
import '@iconify/utils/lib/svg/build';
import '@iconify/utils/lib/icon-set/minify';
import '@iconify/utils/lib/icon-set/convert-info';
import '../icon-set/props.mjs';
import '@iconify/utils/lib/misc/objects';
import '@iconify/utils/lib/colors';
import 'tar';
import './helpers/untar.mjs';
import './npm/version.mjs';
import './gitlab/hash.mjs';
import './gitlab/types.mjs';

function downloadPackage(options) {
  switch (options.downloadType) {
    case "git":
      return downloadGitRepo(options);
    case "github":
      return downloadGitHubRepo(options);
    case "gitlab":
      return downloadGitLabRepo(options);
    case "npm":
      return downloadNPMPackage(options);
    default:
      throw new Error(
        `Invalid download type: ${options.downloadType}`
      );
  }
}

export { downloadPackage };
