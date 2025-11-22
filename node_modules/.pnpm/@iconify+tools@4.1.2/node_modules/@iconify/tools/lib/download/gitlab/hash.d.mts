import { GitLabAPIOptions } from './types.mjs';

/**
 * Get latest hash from GitHub using API
 */
declare function getGitLabRepoHash(options: GitLabAPIOptions): Promise<string>;

export { getGitLabRepoHash };
