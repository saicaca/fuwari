interface CompareDirectoriesOptions {
    ignoreNewLine?: boolean;
    ignoreVersions?: boolean;
    textExtensions?: string[];
}
/**
 * Compare directories. Returns true if files are identical, false if different
 */
declare function compareDirectories(dir1: string, dir2: string, options?: CompareDirectoriesOptions): Promise<boolean>;

export { type CompareDirectoriesOptions, compareDirectories };
