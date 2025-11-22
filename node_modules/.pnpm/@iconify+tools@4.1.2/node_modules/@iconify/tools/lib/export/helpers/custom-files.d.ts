/**
 * Options
 */
interface ExportOptionsWithCustomFiles {
    customFiles?: Record<string, string | Record<string, unknown> | null>;
}
/**
 * Write custom files
 */
declare function exportCustomFiles(dir: string, options: ExportOptionsWithCustomFiles, result?: Set<string>): Promise<void>;

export { type ExportOptionsWithCustomFiles, exportCustomFiles };
