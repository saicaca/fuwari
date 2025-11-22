import type { ModuleLoader } from '../core/module-loader/index.js';
interface ImportedStyle {
    id: string;
    url: string;
    content: string;
}
/** Given a filePath URL, crawl Vite’s module graph to find all style imports. */
export declare function getStylesForURL(filePath: URL, loader: ModuleLoader): Promise<{
    urls: Set<string>;
    styles: ImportedStyle[];
    crawledFiles: Set<string>;
}>;
export {};
