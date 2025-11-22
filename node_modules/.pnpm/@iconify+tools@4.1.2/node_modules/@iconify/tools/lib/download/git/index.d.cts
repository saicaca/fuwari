import { ExportTargetOptions } from '../../export/helpers/prepare.cjs';
import { DocumentNotModified } from '../types/modified.cjs';
import { DownloadSourceMixin } from '../types/sources.cjs';

interface IfModifiedSinceOption {
    ifModifiedSince: string | true | DownloadGitRepoResult;
}
/**
 * Options for downloadGitRepo()
 */
interface DownloadGitRepoOptions extends ExportTargetOptions, Partial<IfModifiedSinceOption> {
    remote: string;
    branch: string;
    log?: boolean;
}
/**
 * Result
 */
interface DownloadGitRepoResult extends DownloadSourceMixin<'git'> {
    contentsDir: string;
    hash: string;
}
/**
 * Download Git repo
 */
declare function downloadGitRepo<T extends IfModifiedSinceOption & DownloadGitRepoOptions>(options: T): Promise<DownloadGitRepoResult | DocumentNotModified>;
declare function downloadGitRepo(options: DownloadGitRepoOptions): Promise<DownloadGitRepoResult>;

export { type DownloadGitRepoOptions, type DownloadGitRepoResult, downloadGitRepo };
