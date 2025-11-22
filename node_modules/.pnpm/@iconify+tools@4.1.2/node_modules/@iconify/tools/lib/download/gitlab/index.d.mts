import { ExportTargetOptions } from '../../export/helpers/prepare.mjs';
import { DocumentNotModified } from '../types/modified.mjs';
import { GitLabAPIOptions } from './types.mjs';
import { DownloadSourceMixin } from '../types/sources.mjs';

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
