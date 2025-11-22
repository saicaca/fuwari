/** @import { Context, Visitor, Visitors } from './types.js' */

/**
 * @template {{ type: string }} T
 * @template {Record<string, any> | null} U
 * @param {T} node
 * @param {U} state
 * @param {Visitors<T, U>} visitors
 */
export function walk(node, state, visitors) {
	const universal = visitors._;

	let stopped = false;

	/** @type {Visitor<T, U, T>} _ */
	function default_visitor(_, { next, state }) {
		next(state);
	}

	/**
	 * @param {T} node
	 * @param {T[]} path
	 * @param {U} state
	 * @returns {T | undefined}
	 */
	function visit(node, path, state) {
		// Don't return the node here or it could lead to false-positive mutation detection
		if (stopped) return;
		if (!node.type) return;

		/** @type {T | void} */
		let result;

		/** @type {Record<string, any>} */
		const mutations = {};

		/** @type {Context<T, U>} */
		const context = {
			path,
			state,
			next: (next_state = state) => {
				path.push(node);
				for (const key in node) {
					if (key === 'type') continue;

					const child_node = node[key];
					if (child_node && typeof child_node === 'object') {
						if (Array.isArray(child_node)) {
							/** @type {Record<number, T>} */
							const array_mutations = {};
							const len = child_node.length;

							let mutated = false;

							for (let i = 0; i < len; i++) {
								const node = child_node[i];
								if (node && typeof node === 'object') {
									const result = visit(node, path, next_state);
									if (result) {
										array_mutations[i] = result;
										mutated = true;
									}
								}
							}

							if (mutated) {
								mutations[key] = child_node.map(
									(node, i) => array_mutations[i] ?? node
								);
							}
						} else {
							const result = visit(
								/** @type {T} */ (child_node),
								path,
								next_state
							);

							// @ts-ignore
							if (result) {
								mutations[key] = result;
							}
						}
					}
				}
				path.pop();

				if (Object.keys(mutations).length > 0) {
					return apply_mutations(node, mutations);
				}
			},
			stop: () => {
				stopped = true;
			},
			visit: (next_node, next_state = state) => {
				path.push(node);
				const result = visit(next_node, path, next_state) ?? next_node;
				path.pop();
				return result;
			}
		};

		let visitor = /** @type {Visitor<T, U, T>} */ (
			visitors[/** @type {T['type']} */ (node.type)] ?? default_visitor
		);

		if (universal) {
			/** @type {T | void} */
			let inner_result;

			result = universal(node, {
				...context,
				/** @param {U} next_state */
				next: (next_state = state) => {
					state = next_state; // make it the default for subsequent specialised visitors

					inner_result = visitor(node, {
						...context,
						state: next_state
					});

					return inner_result;
				}
			});

			// @ts-expect-error TypeScript doesn't understand that `context.next(...)` is called immediately
			if (!result && inner_result) {
				result = inner_result;
			}
		} else {
			result = visitor(node, context);
		}

		if (!result) {
			if (Object.keys(mutations).length > 0) {
				result = apply_mutations(node, mutations);
			}
		}

		if (result) {
			return result;
		}
	}

	return visit(node, [], state) ?? node;
}

/**
 * @template {Record<string, any>} T
 * @param {T} node
 * @param {Record<string, any>} mutations
 * @returns {T}
 */
function apply_mutations(node, mutations) {
	/** @type {Record<string, any>} */
	const obj = {};

	const descriptors = Object.getOwnPropertyDescriptors(node);

	for (const key in descriptors) {
		Object.defineProperty(obj, key, descriptors[key]);
	}

	for (const key in mutations) {
		obj[key] = mutations[key];
	}

	return /** @type {T} */ (obj);
}
