/**
 * Download types
 */
type DownloadSourceType = 'git' | 'github' | 'gitlab' | 'npm';
/**
 * Type in other objects
 */
interface DownloadSourceMixin<T extends DownloadSourceType> {
    downloadType: T;
}

export type { DownloadSourceMixin, DownloadSourceType };
