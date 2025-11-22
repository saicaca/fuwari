import { z } from 'zod';
import type { APIContext } from '../../../types/public/index.js';
import { type ActionAPIContext, type ErrorInferenceObject, type MaybePromise } from '../utils.js';
import { deserializeActionResult, type SafeResult, type SerializedActionResult, serializeActionResult } from './shared.js';
export * from './shared.js';
export type ActionAccept = 'form' | 'json';
export type ActionHandler<TInputSchema, TOutput> = TInputSchema extends z.ZodType ? (input: z.infer<TInputSchema>, context: ActionAPIContext) => MaybePromise<TOutput> : (input: any, context: ActionAPIContext) => MaybePromise<TOutput>;
export type ActionReturnType<T extends ActionHandler<any, any>> = Awaited<ReturnType<T>>;
export type ActionClient<TOutput, TAccept extends ActionAccept | undefined, TInputSchema extends z.ZodType | undefined> = TInputSchema extends z.ZodType ? ((input: TAccept extends 'form' ? FormData : z.input<TInputSchema>) => Promise<SafeResult<z.input<TInputSchema> extends ErrorInferenceObject ? z.input<TInputSchema> : ErrorInferenceObject, Awaited<TOutput>>>) & {
    queryString: string;
    orThrow: (input: TAccept extends 'form' ? FormData : z.input<TInputSchema>) => Promise<Awaited<TOutput>>;
} : ((input?: any) => Promise<SafeResult<never, Awaited<TOutput>>>) & {
    orThrow: (input?: any) => Promise<Awaited<TOutput>>;
};
export declare function defineAction<TOutput, TAccept extends ActionAccept | undefined = undefined, TInputSchema extends z.ZodType | undefined = TAccept extends 'form' ? z.ZodType<FormData> : undefined>({ accept, input: inputSchema, handler, }: {
    input?: TInputSchema;
    accept?: TAccept;
    handler: ActionHandler<TInputSchema, TOutput>;
}): ActionClient<TOutput, TAccept, TInputSchema> & string;
/** Transform form data to an object based on a Zod schema. */
export declare function formDataToObject<T extends z.AnyZodObject>(formData: FormData, schema: T): Record<string, unknown>;
export type AstroActionContext = {
    /** Information about an incoming action request. */
    action?: {
        /** Whether an action was called using an RPC function or by using an HTML form action. */
        calledFrom: 'rpc' | 'form';
        /** The name of the action. Useful to track the source of an action result during a redirect. */
        name: string;
        /** Programmatically call the action to get the result. */
        handler: () => Promise<SafeResult<any, any>>;
    };
    /**
     * Manually set the action result accessed via `getActionResult()`.
     * Calling this function from middleware will disable Astro's own action result handling.
     */
    setActionResult(actionName: string, actionResult: SerializedActionResult): void;
    /**
     * Serialize an action result to stored in a cookie or session.
     * Also used to pass a result to Astro templates via `setActionResult()`.
     */
    serializeActionResult: typeof serializeActionResult;
    /**
     * Deserialize an action result to access data and error objects.
     */
    deserializeActionResult: typeof deserializeActionResult;
};
/**
 * Access information about Action requests from middleware.
 */
export declare function getActionContext(context: APIContext): AstroActionContext;
