export declare function equals(one: any, other: any): boolean;
export declare function isNumber(val: unknown): val is number;
export declare function isDefined(val: unknown): val is object | string | number | boolean;
export declare function isBoolean(val: unknown): val is boolean;
export declare function isString(val: unknown): val is string;
/**
 * Check that provided value is Iterable
 * @param val the value to check
 * @returns true if val is iterable, false otherwise
 */
export declare function isIterable(val: unknown): boolean;
/**
 * Convert error to string witch should be sended to telemetry.
 * @param err any error
 */
export declare function convertErrorToTelemetryMsg(err: unknown): string;
