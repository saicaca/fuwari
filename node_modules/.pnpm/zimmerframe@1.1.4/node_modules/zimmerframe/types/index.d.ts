declare module 'zimmerframe' {
	export function walk<T extends {
		type: string;
	}, U extends Record<string, any> | null>(node: T, state: U, visitors: Visitors<T, U>): T;
	type BaseNode = { type: string };

	type NodeOf<T extends string, X> = X extends { type: T } ? X : never;

	type SpecialisedVisitors<T extends BaseNode, U> = {
		[K in T['type']]?: Visitor<NodeOf<K, T>, U, T>;
	};

	export type Visitor<T, U, V> = (node: T, context: Context<V, U>) => V | void;

	export type Visitors<T extends BaseNode, U> = T['type'] extends '_'
		? never
		: SpecialisedVisitors<T, U> & { _?: Visitor<T, U, T> };

	export interface Context<T, U> {
		next: (state?: U) => T | void;
		path: T[];
		state: U;
		stop: () => void;
		visit: (node: T, state?: U) => T;
	}

	export {};
}

//# sourceMappingURL=index.d.ts.map