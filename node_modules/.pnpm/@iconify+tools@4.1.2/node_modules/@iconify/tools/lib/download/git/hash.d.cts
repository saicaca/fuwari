import { ExportTargetOptions } from '../../export/helpers/prepare.cjs';

/**
 * Get latest hash from cloned git repo
 */
declare function getGitRepoHash(options: ExportTargetOptions): Promise<string>;

export { getGitRepoHash };
