/** @import { TSESTree } from '@typescript-eslint/types' */
/** @import { BaseNode, Command, Visitors } from './types' */

export const margin = 0;
export const newline = 1;
export const indent = 2;
export const dedent = 3;
export const space = 4;

export class Context {
	#visitors;
	#commands;
	#has_newline = false;

	multiline = false;

	/**
	 *
	 * @param {Visitors} visitors
	 * @param {Command[]} commands
	 */
	constructor(visitors, commands = []) {
		this.#visitors = visitors;
		this.#commands = commands;
	}

	indent() {
		this.#commands.push(indent);
	}

	dedent() {
		this.#commands.push(dedent);
	}

	margin() {
		this.#commands.push(margin);
	}

	newline() {
		this.#has_newline = true;
		this.#commands.push(newline);
	}

	space() {
		this.#commands.push(space);
	}

	/**
	 * @param {Context} context
	 */
	append(context) {
		this.#commands.push(context.#commands);

		if (this.#has_newline) {
			this.multiline = true;
		}
	}

	/**
	 *
	 * @param {string} content
	 * @param {BaseNode} [node]
	 */
	write(content, node) {
		if (node?.loc) {
			this.location(node.loc.start.line, node.loc.start.column);
			this.#commands.push(content);
			this.location(node.loc.end.line, node.loc.end.column);
		} else {
			this.#commands.push(content);
		}

		if (this.#has_newline) {
			this.multiline = true;
		}
	}

	/**
	 *
	 * @param {number} line
	 * @param {number} column
	 */
	location(line, column) {
		this.#commands.push({ type: 'Location', line, column });
	}

	/**
	 * @param {{ type: string }} node
	 */
	visit(node) {
		const visitor = this.#visitors[node.type];

		if (!visitor) {
			let message = `Not implemented: ${node.type}`;

			if (node.type.includes('TS')) {
				message += ` (consider using 'esrap/languages/ts')`;
			}

			if (node.type.includes('JSX')) {
				message += ` (consider using 'esrap/languages/tsx')`;
			}

			throw new Error(message);
		}

		if (this.#visitors._) {
			// @ts-ignore
			this.#visitors._(node, this, (node) => visitor(node, this));
		} else {
			// @ts-ignore
			visitor(node, this);
		}
	}

	empty() {
		return !this.#commands.some(has_content);
	}

	measure() {
		return measure(this.#commands);
	}

	new() {
		return new Context(this.#visitors);
	}
}

/**
 *
 * @param {Command[]} commands
 * @param {number} [from]
 * @param {number} [to]
 */
function measure(commands, from = 0, to = commands.length) {
	let total = 0;

	for (let i = from; i < to; i += 1) {
		const command = commands[i];

		if (typeof command === 'string') {
			total += command.length;
		} else if (Array.isArray(command)) {
			total += measure(command);
		}
	}

	return total;
}

/**
 * @param {Command} command
 */
function has_content(command) {
	if (Array.isArray(command)) {
		return command.some(has_content);
	}

	if (typeof command === 'string') {
		return command.length > 0;
	}

	return false;
}
