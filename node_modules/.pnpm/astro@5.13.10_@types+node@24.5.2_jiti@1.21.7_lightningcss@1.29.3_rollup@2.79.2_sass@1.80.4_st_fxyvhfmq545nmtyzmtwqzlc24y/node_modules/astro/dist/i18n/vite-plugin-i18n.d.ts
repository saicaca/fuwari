import type * as vite from 'vite';
import type { AstroSettings } from '../types/astro.js';
import type { AstroConfig } from '../types/public/config.js';
type AstroInternationalization = {
    settings: AstroSettings;
};
export interface I18nInternalConfig extends Pick<AstroConfig, 'base' | 'site' | 'trailingSlash'>, Pick<AstroConfig['build'], 'format'> {
    i18n: AstroConfig['i18n'];
    isBuild: boolean;
}
export default function astroInternationalization({ settings, }: AstroInternationalization): vite.Plugin;
export {};
