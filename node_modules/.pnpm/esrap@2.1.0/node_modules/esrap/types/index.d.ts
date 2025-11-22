declare module 'esrap' {
	type BaseNode = {
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

	type Visitor<T> = (node: T, context: Context) => void;

	export type Visitors<T extends BaseNode = BaseNode> = T['type'] extends '_'
		? never
		: SpecialisedVisitors<T> & { _?: (node: T, context: Context, visit: (node: T) => void) => void };

	interface Location {
		type: 'Location';
		line: number;
		column: number;
	}

	type Command = string | number | Location | Command[];

	export interface PrintOptions {
		sourceMapSource?: string;
		sourceMapContent?: string;
		sourceMapEncodeMappings?: boolean; // default true
		indent?: string; // default tab
	}
	/**
	 * @returns // TODO
	 */
	export function print<T extends BaseNode = BaseNode>(node: T, visitors: Visitors<T>, opts?: PrintOptions): {
		code: string;
		map: any;
	};
	export class Context {
		
		constructor(visitors: Visitors, commands?: Command[]);
		multiline: boolean;
		indent(): void;
		dedent(): void;
		margin(): void;
		newline(): void;
		space(): void;
		
		append(context: Context): void;
		
		write(content: string, node?: BaseNode): void;
		
		location(line: number, column: number): void;
		
		visit(node: {
			type: string;
		}): void;
		empty(): boolean;
		measure(): number;
		"new"(): Context;
		#private;
	}

	export {};
}

declare module 'esrap/languages/ts' {
	import type { TSESTree } from '@typescript-eslint/types';
	import type { Context } from 'esrap';
	export const EXPRESSIONS_PRECEDENCE: Record<TSESTree.Expression["type"] | "Super" | "RestElement", number>;
	export default function _default(options?: TSOptions): Visitors<TSESTree.Node>;
	export type Node = TSESTree.Node;
	type TSOptions = {
		quotes?: 'double' | 'single';
		comments?: Comment[];
	};

	interface Position {
		line: number;
		column: number;
	}

	// this exists in TSESTree but because of the inanity around enums
	// it's easier to do this ourselves
	export interface Comment {
		type: 'Line' | 'Block';
		value: string;
		start?: number;
		end?: number;
		loc: {
			start: Position;
			end: Position;
		};
	}
	type BaseNode = {
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

	type Visitor<T> = (node: T, context: Context) => void;

	type Visitors<T extends BaseNode = BaseNode> = T['type'] extends '_'
		? never
		: SpecialisedVisitors<T> & { _?: (node: T, context: Context, visit: (node: T) => void) => void };

	export {};
}

declare module 'esrap/languages/tsx' {
	import type { TSESTree } from '@typescript-eslint/types';
	import type { Context } from 'esrap';
	export default function _default(options?: TSOptions): Visitors<TSESTree.Node>;
	export type Node = TSESTree.Node;
	type TSOptions = {
		quotes?: 'double' | 'single';
		comments?: Comment[];
	};

	interface Position {
		line: number;
		column: number;
	}

	// this exists in TSESTree but because of the inanity around enums
	// it's easier to do this ourselves
	export interface Comment {
		type: 'Line' | 'Block';
		value: string;
		start?: number;
		end?: number;
		loc: {
			start: Position;
			end: Position;
		};
	}
	type BaseNode = {
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

	type Visitor<T> = (node: T, context: Context) => void;

	type Visitors<T extends BaseNode = BaseNode> = T['type'] extends '_'
		? never
		: SpecialisedVisitors<T> & { _?: (node: T, context: Context, visit: (node: T) => void) => void };

	export {};
}

//# sourceMappingURL=index.d.ts.map