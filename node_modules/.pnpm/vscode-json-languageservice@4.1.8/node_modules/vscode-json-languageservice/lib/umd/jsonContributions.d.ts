import { Thenable, MarkedString, CompletionItem } from './jsonLanguageService';
export interface JSONWorkerContribution {
    getInfoContribution(uri: string, location: JSONPath): Thenable<MarkedString[]>;
    collectPropertyCompletions(uri: string, location: JSONPath, currentWord: string, addValue: boolean, isLast: boolean, result: CompletionsCollector): Thenable<any>;
    collectValueCompletions(uri: string, location: JSONPath, propertyKey: string, result: CompletionsCollector): Thenable<any>;
    collectDefaultCompletions(uri: string, result: CompletionsCollector): Thenable<any>;
    resolveCompletion?(item: CompletionItem): Thenable<CompletionItem>;
}
export declare type Segment = string | number;
export declare type JSONPath = Segment[];
export interface CompletionsCollector {
    add(suggestion: CompletionItem): void;
    error(message: string): void;
    log(message: string): void;
    setAsIncomplete(): void;
    getNumberOfProposals(): number;
}
