import { ExportTargetOptions } from '../../export/helpers/prepare.cjs';
import { DocumentNotModified } from '../types/modified.cjs';
import { DownloadSourceMixin } from '../types/sources.cjs';

interface IfModifiedSinceOption {
    ifModifiedSince: string | true | DownloadNPMPackageResult;
}
/**
 * Options for downloadNPMPackage()
 */
interface DownloadNPMPackageOptions extends ExportTargetOptions, Partial<IfModifiedSinceOption> {
    package: string;
    tag?: string;
    log?: boolean;
}
/**
 * Result
 */
interface DownloadNPMPackageResult extends DownloadSourceMixin<'npm'> {
    rootDir: string;
    contentsDir: string;
    version: string;
}
/**
 * Download NPM package
 */
declare function downloadNPMPackage<T extends IfModifiedSinceOption & DownloadNPMPackageOptions>(options: T): Promise<DownloadNPMPackageResult | DocumentNotModified>;
declare function downloadNPMPackage(options: DownloadNPMPackageOptions): Promise<DownloadNPMPackageResult>;

export { type DownloadNPMPackageOptions, type DownloadNPMPackageResult, downloadNPMPackage };
