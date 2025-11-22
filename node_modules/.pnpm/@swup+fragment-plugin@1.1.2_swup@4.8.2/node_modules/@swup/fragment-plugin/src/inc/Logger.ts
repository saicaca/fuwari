import { __TEST__ } from './env.js';
/**
 * Wrap a string in an escape sequence
 * @see https://stackoverflow.com/a/68373080/586823
 */
const wrapInEscapeSequence = (s: string, open: number, close: number): string => {
	if (s == null) return s;
	return `\x1b[${open}m${String(s)}\x1b[${close}m`;
};

/**
 * Color Codes:
 * @see https://github.com/lzwme/console-log-colors/blob/56a41b352bf9ed327cc864f588b831d92ee6390e/src/index.js
 */
const bold = (s: string): string => wrapInEscapeSequence(s, 1, 22);
const purple = (s: string): string => wrapInEscapeSequence(s, 94, 39);

const prepare = (s: string): string => {
	if (__TEST__) return s;
	return `🧩 ${bold(s)}`;
};

export const highlight = (s: string): string => {
	if (__TEST__) return s;
	return purple(s);
};

/**
 * A slim wrapper around console statements
 */
export default class Logger {
	log(...args: any) {
		const msg = args.shift();
		console.log(prepare(msg), ...args);
	}
	warn(...args: any) {
		const msg = args.shift();
		console.warn(prepare(msg), ...args);
	}
	error(...args: any) {
		const msg = args.shift();
		console.error(prepare(msg), ...args);
	}
	logIf(condition: boolean, ...args: any) {
		if (condition) this.log(...args);
	}
	warnIf(condition: boolean, ...args: any) {
		if (condition) this.warn(...args);
	}
	errorIf(condition: boolean, ...args: any) {
		if (condition) this.error(...args);
	}
}
