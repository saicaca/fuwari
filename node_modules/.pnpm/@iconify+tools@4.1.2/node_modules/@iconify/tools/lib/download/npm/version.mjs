import { promises } from 'fs';
import { execAsync } from '../../misc/exec.mjs';
import 'pathe';
import 'child_process';

async function getNPMVersion(options) {
  const tag = options.tag || "latest";
  const result = await execAsync(`npm view ${options.package}@${tag} --json`);
  const data = JSON.parse(result.stdout);
  return {
    version: data.version,
    file: data.dist?.tarball
  };
}
async function getPackageVersion(target) {
  return JSON.parse(
    await promises.readFile(target + "/package.json", "utf8")
  ).version;
}

export { getNPMVersion, getPackageVersion };
