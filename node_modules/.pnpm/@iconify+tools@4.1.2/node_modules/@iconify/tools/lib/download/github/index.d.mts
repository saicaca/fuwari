import { ExportTargetOptions } from '../../export/helpers/prepare.mjs';
import { DocumentNotModified } from '../types/modified.mjs';
import { GitHubAPIOptions } from './types.mjs';
import { DownloadSourceMixin } from '../types/sources.mjs';

interface IfModifiedSinceOption {
    ifModifiedSince: string | DownloadGitHubRepoResult;
}
/**
 * Options for downloadGitHubRepo()
 */
interface DownloadGitHubRepoOptions extends ExportTargetOptions, GitHubAPIOptions, Partial<IfModifiedSinceOption> {
    cleanupOldFiles?: boolean;
    cleanupOldDirectories?: boolean;
    log?: boolean;
}
/**
 * Result
 */
interface DownloadGitHubRepoResult extends DownloadSourceMixin<'github'> {
    rootDir: string;
    contentsDir: string;
    hash: string;
}
/**
 * Download GitHub repo using API
 */
declare function downloadGitHubRepo<T extends IfModifiedSinceOption & DownloadGitHubRepoOptions>(options: T): Promise<DownloadGitHubRepoResult | DocumentNotModified>;
declare function downloadGitHubRepo(options: DownloadGitHubRepoOptions): Promise<DownloadGitHubRepoResult>;

export { type DownloadGitHubRepoOptions, type DownloadGitHubRepoResult, downloadGitHubRepo };
