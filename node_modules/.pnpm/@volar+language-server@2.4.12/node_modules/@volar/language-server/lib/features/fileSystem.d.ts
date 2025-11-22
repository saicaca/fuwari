import { FileSystem } from '@volar/language-service';
import { URI } from 'vscode-uri';
export declare function register(documents: ReturnType<typeof import('./textDocuments').register>, fileWatcher: ReturnType<typeof import('./fileWatcher').register>): {
    readFile(uri: URI): string | Thenable<string | undefined>;
    stat(uri: URI): import("@volar/language-service").FileStat | Thenable<import("@volar/language-service").FileStat | undefined>;
    readDirectory(uri: URI): import("@volar/language-service").ProviderResult<[string, import("@volar/language-service").FileType][]>;
    install(scheme: string, provider: FileSystem): void;
};
