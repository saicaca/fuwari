import { ExportTargetOptions } from '../../export/helpers/prepare.cjs';

/**
 * Get current branch from cloned git repo
 */
declare function getGitRepoBranch(options: ExportTargetOptions, checkout?: string): Promise<string>;

export { getGitRepoBranch };
