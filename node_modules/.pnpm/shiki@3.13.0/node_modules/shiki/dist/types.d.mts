import { BundledTheme } from './themes.mjs';
export * from '@shikijs/core/types';
import { BundledLanguage } from './langs.mjs';
import '@shikijs/core';
import '@shikijs/types';

type BuiltinLanguage = BundledLanguage;
type BuiltinTheme = BundledTheme;

export { BundledLanguage, BundledTheme };
export type { BuiltinLanguage, BuiltinTheme };
