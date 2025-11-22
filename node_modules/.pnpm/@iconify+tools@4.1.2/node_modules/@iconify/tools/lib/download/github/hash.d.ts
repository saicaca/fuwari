import { GitHubAPIOptions } from './types.js';

/**
 * Get latest hash from GitHub using API
 */
declare function getGitHubRepoHash(options: GitHubAPIOptions): Promise<string>;

export { getGitHubRepoHash };
