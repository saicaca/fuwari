export type LimitFunction = {
	/**
	The number of promises that are currently running.
	*/
	readonly activeCount: number;

	/**
	The number of promises that are waiting to run (i.e. their internal `fn` was not called yet).
	*/
	readonly pendingCount: number;

	/**
	Get or set the concurrency limit.
	*/
	concurrency: number;

	/**
	Discard pending promises that are waiting to run.

	This might be useful if you want to teardown the queue at the end of your program's lifecycle or discard any function calls referencing an intermediary state of your app.

	Note: This does not cancel promises that are already running.
	*/
	clearQueue: () => void;

	/**
	@param fn - Promise-returning/async function.
	@param arguments - Any arguments to pass through to `fn`. Support for passing arguments on to the `fn` is provided in order to be able to avoid creating unnecessary closures. You probably don't need this optimization unless you're pushing a lot of functions.
	@returns The promise returned by calling `fn(...arguments)`.
	*/
	<Arguments extends unknown[], ReturnType>(
		function_: (...arguments_: Arguments) => PromiseLike<ReturnType> | ReturnType,
		...arguments_: Arguments
	): Promise<ReturnType>;
};

/**
Run multiple promise-returning & async functions with limited concurrency.

@param concurrency - Concurrency limit. Minimum: `1`.
@returns A `limit` function.
*/
export default function pLimit(concurrency: number): LimitFunction;

export type Options = {
	/**
	Concurrency limit.

 	Minimum: `1`.
	*/
	readonly concurrency: number;
};

/**
Returns a function with limited concurrency.

The returned function manages its own concurrent executions, allowing you to call it multiple times without exceeding the specified concurrency limit.

Ideal for scenarios where you need to control the number of simultaneous executions of a single function, rather than managing concurrency across multiple functions.

@param function_ - Promise-returning/async function.
@return Function with limited concurrency.

@example
```
import {limitFunction} from 'p-limit';

const limitedFunction = limitFunction(async () => {
	return doSomething();
}, {concurrency: 1});

const input = Array.from({length: 10}, limitedFunction);

// Only one promise is run at once.
await Promise.all(input);
```
*/
export function limitFunction<Arguments extends unknown[], ReturnType>(
	function_: (...arguments_: Arguments) => PromiseLike<ReturnType> | ReturnType,
	option: Options
): (...arguments_: Arguments) => Promise<ReturnType>;
