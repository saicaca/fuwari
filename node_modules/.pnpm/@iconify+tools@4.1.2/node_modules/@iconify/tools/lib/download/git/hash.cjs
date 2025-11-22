'use strict';

const misc_exec = require('../../misc/exec.cjs');
require('pathe');
require('child_process');

async function getGitRepoHash(options) {
  const result = await misc_exec.execAsync("git rev-parse HEAD", {
    cwd: options.target
  });
  return result.stdout.trim();
}

exports.getGitRepoHash = getGitRepoHash;
