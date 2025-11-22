'use strict';

require('cheerio');
require('@iconify/utils');
require('../../svg/data/attributes.cjs');
require('../../svg/data/tags.cjs');
require('../../svg/cleanup/bad-tags.cjs');
require('svgo');
require('@iconify/utils/lib/svg/id');
require('@iconify/utils/lib/icon/defaults');
require('@iconify/utils/lib/svg/build');
require('@iconify/utils/lib/icon-set/minify');
require('@iconify/utils/lib/icon-set/convert-info');
require('../../icon-set/props.cjs');
require('@iconify/utils/lib/colors');
require('axios');
require('fs');
require('crypto');
require('pathe');
const misc_exec = require('../../misc/exec.cjs');
require('fs/promises');
require('extract-zip');
require('tar');
require('../../svg/parse.cjs');
require('@iconify/utils/lib/misc/objects');
require('child_process');

async function resetGitRepoContents(target) {
  await misc_exec.execAsync("git add -A", {
    cwd: target
  });
  await misc_exec.execAsync("git reset --hard --quiet", {
    cwd: target
  });
}

exports.resetGitRepoContents = resetGitRepoContents;
