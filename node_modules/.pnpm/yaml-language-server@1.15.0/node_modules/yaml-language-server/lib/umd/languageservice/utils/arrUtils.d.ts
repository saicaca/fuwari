import { YAMLDocument, SingleYAMLDocument } from '../parser/yamlParser07';
export declare function getLineOffsets(textDocString: string): number[];
export declare function removeDuplicatesObj<T>(objArray: T[]): T[];
export declare function matchOffsetToDocument(offset: number, jsonDocuments: YAMLDocument): SingleYAMLDocument | null;
export declare function filterInvalidCustomTags(customTags: string[]): string[];
export declare function isArrayEqual(fst: Array<unknown>, snd: Array<unknown>): boolean;
