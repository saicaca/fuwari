import { Document, YAMLMap, YAMLSeq } from 'yaml';
import { CollectionItem, Token } from 'yaml/dist/parse/cst';
import { YamlNode } from '../jsonASTTypes';
export declare function getParent(doc: Document, nodeToFind: YamlNode): YamlNode | undefined;
export declare function isMapContainsEmptyPair(map: YAMLMap): boolean;
export declare function indexOf(seq: YAMLSeq, item: YamlNode): number | undefined;
/**
 * Check that given offset is in YAML comment
 * @param doc the yaml document
 * @param offset the offset to check
 */
export declare function isInComment(tokens: Token[], offset: number): boolean;
export declare function isCollectionItem(token: unknown): token is CollectionItem;
