import { execAsync } from '../../misc/exec.mjs';
import 'pathe';
import 'child_process';

async function getGitRepoBranch(options, checkout) {
  const result = await execAsync("git branch --show-current", {
    cwd: options.target
  });
  const branch = result.stdout.trim();
  if (typeof checkout === "string" && branch !== checkout) {
    await execAsync(`git checkout ${checkout} "${options.target}"`);
    return await getGitRepoBranch(options);
  }
  return branch;
}

export { getGitRepoBranch };
