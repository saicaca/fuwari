'use strict';

const misc_exec = require('../../misc/exec.cjs');
require('pathe');
require('child_process');

async function getGitRepoBranch(options, checkout) {
  const result = await misc_exec.execAsync("git branch --show-current", {
    cwd: options.target
  });
  const branch = result.stdout.trim();
  if (typeof checkout === "string" && branch !== checkout) {
    await misc_exec.execAsync(`git checkout ${checkout} "${options.target}"`);
    return await getGitRepoBranch(options);
  }
  return branch;
}

exports.getGitRepoBranch = getGitRepoBranch;
