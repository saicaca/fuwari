import type { ViteDevServer } from 'vite';
import type { RemoteFontProviderModResolver } from '../definitions.js';
export declare function createBuildRemoteFontProviderModResolver(): RemoteFontProviderModResolver;
export declare function createDevServerRemoteFontProviderModResolver({ server, }: {
    server: ViteDevServer;
}): RemoteFontProviderModResolver;
