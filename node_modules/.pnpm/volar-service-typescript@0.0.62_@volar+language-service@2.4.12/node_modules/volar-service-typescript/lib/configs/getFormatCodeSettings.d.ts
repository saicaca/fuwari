import type { FormattingOptions, LanguageServiceContext } from '@volar/language-service';
import type * as ts from 'typescript';
import type { TextDocument } from 'vscode-languageserver-textdocument';
export declare function getFormatCodeSettings(ctx: LanguageServiceContext, document: TextDocument, options: FormattingOptions | undefined): Promise<ts.FormatCodeSettings>;
//# sourceMappingURL=getFormatCodeSettings.d.ts.map