import type { URI } from 'vscode-uri';
export type UriMap<T> = ReturnType<typeof createUriMap<T>>;
export declare function createUriMap<T>(caseSensitive?: boolean): Map<URI, T>;
