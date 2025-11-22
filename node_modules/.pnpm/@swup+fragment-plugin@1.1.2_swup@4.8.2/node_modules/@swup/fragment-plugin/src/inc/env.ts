declare global {
	const __DEV__: boolean;
	const MICROBUNDLE_TARGET: string;
	interface Window {
		process?: any;
	}
}

/**
 * Make sure process.env is defined in the browser
 */
if (!window.process) window.process = {};
if (!window.process.env) window.process.env = {};

/**
 * Export the __DEV__ variable. This will become false in production builds from consumers
 */
export const __TEST__ = ['test'].includes(String(process.env.NODE_ENV));
export const __DEV__ = ['development', 'test'].includes(String(process.env.NODE_ENV));
