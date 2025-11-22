import { DownloadGitHubRepoOptions, DownloadGitHubRepoResult } from './github/index.cjs';
import { DownloadGitRepoOptions, DownloadGitRepoResult } from './git/index.cjs';
import { DownloadNPMPackageOptions, DownloadNPMPackageResult } from './npm/index.cjs';
import { DocumentNotModified } from './types/modified.cjs';
import { DownloadSourceType, DownloadSourceMixin } from './types/sources.cjs';
import { DownloadGitLabRepoOptions, DownloadGitLabRepoResult } from './gitlab/index.cjs';
import '../export/helpers/prepare.cjs';
import './github/types.cjs';
import './gitlab/types.cjs';

/**
 * Options and result combinations
 */
interface DownloadGitRepo {
    options: DownloadGitRepoOptions & DownloadSourceMixin<'git'>;
    result: DownloadGitRepoResult;
}
interface DownloadGitHubRepo {
    options: DownloadGitHubRepoOptions & DownloadSourceMixin<'github'>;
    result: DownloadGitHubRepoResult;
}
interface DownloadGitLabRepo {
    options: DownloadGitLabRepoOptions & DownloadSourceMixin<'gitlab'>;
    result: DownloadGitLabRepoResult;
}
interface DownloadNPMPackage {
    options: DownloadNPMPackageOptions & DownloadSourceMixin<'npm'>;
    result: DownloadNPMPackageResult;
}
/**
 * Combinations based on type
 */
type DownloadParamsMixin<T extends DownloadSourceType> = T extends 'git' ? DownloadGitRepo : T extends 'github' ? DownloadGitHubRepo : T extends 'gitlab' ? DownloadGitLabRepo : T extends 'npm' ? DownloadNPMPackage : never;
/**
 * Combinations
 */
type DownloadParams = DownloadGitRepo | DownloadGitHubRepo | DownloadGitLabRepo | DownloadNPMPackage;
/**
 * Pick options or result from combinations
 */
type DownloadOptions<T extends DownloadSourceType> = DownloadParamsMixin<T>['options'];
type DownloadResult<T extends DownloadSourceType> = Promise<DocumentNotModified | DownloadParamsMixin<T>['result']>;
declare function downloadPackage<T extends 'git'>(options: DownloadOptions<T>): DownloadResult<T>;
declare function downloadPackage<T extends 'github'>(options: DownloadOptions<T>): DownloadResult<T>;
declare function downloadPackage<T extends 'gitlab'>(options: DownloadOptions<T>): DownloadResult<T>;
declare function downloadPackage<T extends 'npm'>(options: DownloadOptions<T>): DownloadResult<T>;

export { type DownloadParams, type DownloadParamsMixin, downloadPackage };
