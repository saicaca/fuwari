import { Document, LineCounter } from 'yaml';
import { ASTNode, YamlNode } from '../jsonASTTypes';
declare type NodeRange = [number, number, number];
export declare function convertAST(parent: ASTNode, node: YamlNode, doc: Document, lineCounter: LineCounter): ASTNode | undefined;
export declare function toOffsetLength(range: NodeRange): [number, number];
export {};
