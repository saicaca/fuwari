import { NPMPackageOptions } from './types.mjs';

interface GetNPMVersionResult {
    version: string;
    file?: string;
}
/**
 * Get version of package from NPM registry
 */
declare function getNPMVersion(options: NPMPackageOptions): Promise<GetNPMVersionResult>;
/**
 * Get version of package from filename
 */
declare function getPackageVersion(target: string): Promise<string>;

export { type GetNPMVersionResult, getNPMVersion, getPackageVersion };
