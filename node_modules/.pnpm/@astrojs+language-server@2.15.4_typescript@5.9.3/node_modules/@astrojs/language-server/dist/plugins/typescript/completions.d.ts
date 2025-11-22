import type { CompletionItem, CompletionList, LanguageServiceContext } from '@volar/language-server';
export declare function enhancedProvideCompletionItems(completions: CompletionList): CompletionList;
export declare function enhancedResolveCompletionItem(resolvedCompletion: CompletionItem, context: LanguageServiceContext): CompletionItem;
