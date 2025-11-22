import { TSESTree } from '@typescript-eslint/types';
import { Context } from 'esrap';

export type BaseNode = {
	type: string;
	loc?: null | {
		start: { line: number; column: number };
		end: { line: number; column: number };
	};
};

type NodeOf<T extends string, X> = X extends { type: T } ? X : never;

type SpecialisedVisitors<T extends BaseNode> = {
	[K in T['type']]?: Visitor<NodeOf<K, T>>;
};

export type Visitor<T> = (node: T, context: Context) => void;

export type Visitors<T extends BaseNode = BaseNode> = T['type'] extends '_'
	? never
	: SpecialisedVisitors<T> & { _?: (node: T, context: Context, visit: (node: T) => void) => void };

export { Context };

export type TypeAnnotationNodes =
	| TSESTree.TypeNode
	| TSESTree.TypeElement
	| TSESTree.TSTypeAnnotation
	| TSESTree.TSPropertySignature
	| TSESTree.TSTypeParameter
	| TSESTree.TSTypeParameterDeclaration
	| TSESTree.TSTypeParameterInstantiation
	| TSESTree.TSEnumMember
	| TSESTree.TSInterfaceHeritage
	| TSESTree.TSClassImplements
	| TSExpressionWithTypeArguments;

type TSExpressionWithTypeArguments = {
	type: 'TSExpressionWithTypeArguments';
	expression: any;
};

export interface Location {
	type: 'Location';
	line: number;
	column: number;
}

export interface IndentChange {
	type: 'IndentChange';
	offset: number;
}

export type Command = string | number | Location | Command[];

export interface PrintOptions {
	sourceMapSource?: string;
	sourceMapContent?: string;
	sourceMapEncodeMappings?: boolean; // default true
	indent?: string; // default tab
}
