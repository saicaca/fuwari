import type * as ts from 'typescript';
import type { LanguageServer } from '../types';
export declare function getInferredCompilerOptions(server: LanguageServer): Promise<ts.CompilerOptions>;
