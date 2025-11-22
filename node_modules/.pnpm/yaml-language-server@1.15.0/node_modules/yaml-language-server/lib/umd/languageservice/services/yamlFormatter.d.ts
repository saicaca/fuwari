import { TextEdit, FormattingOptions } from 'vscode-languageserver-types';
import { CustomFormatterOptions, LanguageSettings } from '../yamlLanguageService';
import { TextDocument } from 'vscode-languageserver-textdocument';
export declare class YAMLFormatter {
    private formatterEnabled;
    configure(shouldFormat: LanguageSettings): void;
    format(document: TextDocument, options?: Partial<FormattingOptions> & CustomFormatterOptions): TextEdit[];
}
