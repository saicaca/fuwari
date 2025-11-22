'use strict';

const fs = require('fs');
const misc_exec = require('../../misc/exec.cjs');
require('pathe');
require('child_process');

async function getNPMVersion(options) {
  const tag = options.tag || "latest";
  const result = await misc_exec.execAsync(`npm view ${options.package}@${tag} --json`);
  const data = JSON.parse(result.stdout);
  return {
    version: data.version,
    file: data.dist?.tarball
  };
}
async function getPackageVersion(target) {
  return JSON.parse(
    await fs.promises.readFile(target + "/package.json", "utf8")
  ).version;
}

exports.getNPMVersion = getNPMVersion;
exports.getPackageVersion = getPackageVersion;
