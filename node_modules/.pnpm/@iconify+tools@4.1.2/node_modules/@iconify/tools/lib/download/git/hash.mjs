import { execAsync } from '../../misc/exec.mjs';
import 'pathe';
import 'child_process';

async function getGitRepoHash(options) {
  const result = await execAsync("git rev-parse HEAD", {
    cwd: options.target
  });
  return result.stdout.trim();
}

export { getGitRepoHash };
