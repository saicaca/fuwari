/**
 * Common options for all functions that export to directory
 */
interface ExportTargetOptions {
    target: string;
    cleanup?: boolean;
}
/**
 * Normalize directory
 */
declare function normalizeDir(dir: string): string;
/**
 * Prepare directory for export
 *
 * Also normalizes directory and returns normalized value
 */
declare function prepareDirectoryForExport(options: ExportTargetOptions): Promise<string>;

export { type ExportTargetOptions, normalizeDir, prepareDirectoryForExport };
