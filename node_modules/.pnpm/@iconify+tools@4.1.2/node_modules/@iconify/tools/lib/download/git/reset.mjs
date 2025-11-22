import 'cheerio';
import '@iconify/utils';
import '../../svg/data/attributes.mjs';
import '../../svg/data/tags.mjs';
import '../../svg/cleanup/bad-tags.mjs';
import 'svgo';
import '@iconify/utils/lib/svg/id';
import '@iconify/utils/lib/icon/defaults';
import '@iconify/utils/lib/svg/build';
import '@iconify/utils/lib/icon-set/minify';
import '@iconify/utils/lib/icon-set/convert-info';
import '../../icon-set/props.mjs';
import '@iconify/utils/lib/colors';
import 'axios';
import 'fs';
import 'crypto';
import 'pathe';
import { execAsync } from '../../misc/exec.mjs';
import 'fs/promises';
import 'extract-zip';
import 'tar';
import '../../svg/parse.mjs';
import '@iconify/utils/lib/misc/objects';
import 'child_process';

async function resetGitRepoContents(target) {
  await execAsync("git add -A", {
    cwd: target
  });
  await execAsync("git reset --hard --quiet", {
    cwd: target
  });
}

export { resetGitRepoContents };
