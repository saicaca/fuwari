import type { TextEdit } from 'vscode-html-languageservice';
import type { AstroVirtualCode } from '../../core/index.js';
export declare function mapEdit(edit: TextEdit, code: AstroVirtualCode, languageId: string): TextEdit;
