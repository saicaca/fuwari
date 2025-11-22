import { GitLabAPIOptions } from './types.cjs';

/**
 * Get latest hash from GitHub using API
 */
declare function getGitLabRepoHash(options: GitLabAPIOptions): Promise<string>;

export { getGitLabRepoHash };
