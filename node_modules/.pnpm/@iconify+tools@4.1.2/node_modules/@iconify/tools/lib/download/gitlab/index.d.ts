import { ExportTargetOptions } from '../../export/helpers/prepare.js';
import { DocumentNotModified } from '../types/modified.js';
import { GitLabAPIOptions } from './types.js';
import { DownloadSourceMixin } from '../types/sources.js';

interface IfModifiedSinceOption {
    ifModifiedSince: string | DownloadGitLabRepoResult;
}
/**
 * Options for downloadGitLabRepo()
 */
interface DownloadGitLabRepoOptions extends ExportTargetOptions, GitLabAPIOptions, Partial<IfModifiedSinceOption> {
    cleanupOldFiles?: boolean;
    cleanupOldDirectories?: boolean;
    log?: boolean;
}
/**
 * Result
 */
interface DownloadGitLabRepoResult extends DownloadSourceMixin<'gitlab'> {
    rootDir: string;
    contentsDir: string;
    hash: string;
}
/**
 * Download GitLab repo using API
 */
declare function downloadGitLabRepo<T extends IfModifiedSinceOption & DownloadGitLabRepoOptions>(options: T): Promise<DownloadGitLabRepoResult | DocumentNotModified>;
declare function downloadGitLabRepo(options: DownloadGitLabRepoOptions): Promise<DownloadGitLabRepoResult>;

export { type DownloadGitLabRepoOptions, type DownloadGitLabRepoResult, downloadGitLabRepo };
