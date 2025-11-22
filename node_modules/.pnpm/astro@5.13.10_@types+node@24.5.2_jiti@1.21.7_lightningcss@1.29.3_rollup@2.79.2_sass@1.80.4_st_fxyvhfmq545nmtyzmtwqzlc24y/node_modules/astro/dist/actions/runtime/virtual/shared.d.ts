import type { z } from 'zod';
import { AstroError } from '../../../core/errors/errors.js';
import { appendForwardSlash as _appendForwardSlash } from '../../../core/path.js';
import type { ActionAPIContext as _ActionAPIContext, ErrorInferenceObject, MaybePromise } from '../utils.js';
export type ActionAPIContext = _ActionAPIContext;
export declare const ACTION_QUERY_PARAMS: {
    actionName: string;
    actionPayload: string;
};
export declare const appendForwardSlash: typeof _appendForwardSlash;
export declare const ACTION_ERROR_CODES: readonly ["BAD_REQUEST", "UNAUTHORIZED", "PAYMENT_REQUIRED", "FORBIDDEN", "NOT_FOUND", "METHOD_NOT_ALLOWED", "NOT_ACCEPTABLE", "PROXY_AUTHENTICATION_REQUIRED", "REQUEST_TIMEOUT", "CONFLICT", "GONE", "LENGTH_REQUIRED", "PRECONDITION_FAILED", "CONTENT_TOO_LARGE", "URI_TOO_LONG", "UNSUPPORTED_MEDIA_TYPE", "RANGE_NOT_SATISFIABLE", "EXPECTATION_FAILED", "MISDIRECTED_REQUEST", "UNPROCESSABLE_CONTENT", "LOCKED", "FAILED_DEPENDENCY", "TOO_EARLY", "UPGRADE_REQUIRED", "PRECONDITION_REQUIRED", "TOO_MANY_REQUESTS", "REQUEST_HEADER_FIELDS_TOO_LARGE", "UNAVAILABLE_FOR_LEGAL_REASONS", "INTERNAL_SERVER_ERROR", "NOT_IMPLEMENTED", "BAD_GATEWAY", "SERVICE_UNAVAILABLE", "GATEWAY_TIMEOUT", "HTTP_VERSION_NOT_SUPPORTED", "VARIANT_ALSO_NEGOTIATES", "INSUFFICIENT_STORAGE", "LOOP_DETECTED", "NETWORK_AUTHENTICATION_REQUIRED"];
export type ActionErrorCode = (typeof ACTION_ERROR_CODES)[number];
export declare class ActionError<_T extends ErrorInferenceObject = ErrorInferenceObject> extends Error {
    type: string;
    code: ActionErrorCode;
    status: number;
    constructor(params: {
        message?: string;
        code: ActionErrorCode;
        stack?: string;
    });
    static codeToStatus(code: ActionErrorCode): number;
    static statusToCode(status: number): ActionErrorCode;
    static fromJson(body: any): ActionError<ErrorInferenceObject>;
}
export declare function isActionError(error?: unknown): error is ActionError;
export declare function isInputError<T extends ErrorInferenceObject>(error?: ActionError<T>): error is ActionInputError<T>;
export declare function isInputError(error?: unknown): error is ActionInputError<ErrorInferenceObject>;
export type SafeResult<TInput extends ErrorInferenceObject, TOutput> = {
    data: TOutput;
    error: undefined;
} | {
    data: undefined;
    error: ActionError<TInput>;
};
export declare class ActionInputError<T extends ErrorInferenceObject> extends ActionError {
    type: string;
    issues: z.ZodIssue[];
    fields: z.ZodError<T>['formErrors']['fieldErrors'];
    constructor(issues: z.ZodIssue[]);
}
export declare function callSafely<TOutput>(handler: () => MaybePromise<TOutput>): Promise<SafeResult<z.ZodType, TOutput>>;
export declare function getActionQueryString(name: string): string;
export type SerializedActionResult = {
    type: 'data';
    contentType: 'application/json+devalue';
    status: 200;
    body: string;
} | {
    type: 'error';
    contentType: 'application/json';
    status: number;
    body: string;
} | {
    type: 'empty';
    status: 204;
};
export declare function serializeActionResult(res: SafeResult<any, any>): SerializedActionResult;
export declare function deserializeActionResult(res: SerializedActionResult): SafeResult<any, any>;
export declare function astroCalledServerError(): AstroError;
