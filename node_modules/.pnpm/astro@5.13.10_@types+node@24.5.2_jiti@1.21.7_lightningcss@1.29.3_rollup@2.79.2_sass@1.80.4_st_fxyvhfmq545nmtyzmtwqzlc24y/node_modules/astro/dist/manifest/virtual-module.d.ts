import type { Plugin } from 'vite';
import type { SSRManifest } from '../types/public/index.js';
export default function virtualModulePlugin({ manifest }: {
    manifest: SSRManifest;
}): Plugin;
