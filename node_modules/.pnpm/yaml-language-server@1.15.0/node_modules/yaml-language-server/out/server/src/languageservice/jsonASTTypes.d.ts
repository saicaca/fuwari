import { Node, Pair } from 'yaml';
export declare type YamlNode = Node | Pair;
export declare type ASTNode = ObjectASTNode | PropertyASTNode | ArrayASTNode | StringASTNode | NumberASTNode | BooleanASTNode | NullASTNode;
export interface BaseASTNode {
    readonly type: 'object' | 'array' | 'property' | 'string' | 'number' | 'boolean' | 'null';
    readonly parent?: ASTNode;
    readonly offset: number;
    readonly length: number;
    readonly children?: ASTNode[];
    readonly value?: string | boolean | number | null;
    readonly internalNode: YamlNode;
    location: string;
    getNodeFromOffsetEndInclusive(offset: number): ASTNode;
}
export interface ObjectASTNode extends BaseASTNode {
    readonly type: 'object';
    readonly properties: PropertyASTNode[];
    readonly children: ASTNode[];
}
export interface PropertyASTNode extends BaseASTNode {
    readonly type: 'property';
    readonly keyNode: StringASTNode;
    readonly valueNode?: ASTNode;
    readonly colonOffset?: number;
    readonly children: ASTNode[];
}
export interface ArrayASTNode extends BaseASTNode {
    readonly type: 'array';
    readonly items: ASTNode[];
    readonly children: ASTNode[];
}
export interface StringASTNode extends BaseASTNode {
    readonly type: 'string';
    readonly value: string;
}
export interface NumberASTNode extends BaseASTNode {
    readonly type: 'number';
    readonly value: number;
    readonly isInteger: boolean;
}
export interface BooleanASTNode extends BaseASTNode {
    readonly type: 'boolean';
    readonly value: boolean;
}
export interface NullASTNode extends BaseASTNode {
    readonly type: 'null';
    readonly value: null;
}
