/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export interface XHROptions {
    type?: string;
    url: string;
    user?: string;
    password?: string;
    headers?: Headers;
    timeout?: number;
    data?: string;
    strictSSL?: boolean;
    followRedirects?: number;
    token?: CancellationToken;
    agent?: HttpProxyAgent | HttpsProxyAgent;
}

export interface XHRResponse {
    readonly responseText: string;
    readonly body: Uint8Array;
    readonly status: number;
    readonly headers: Headers;
}

export interface XHRRequest {
    (options: XHROptions): Promise<XHRResponse>
}

export interface XHRConfigure {
    (proxyUrl: string | undefined, strictSSL: boolean): void;
}

export interface Disposable {
    /**
     * Dispose this object.
     */
    dispose(): void;
}
/**
 * Represents a typed event.
 */
 export interface Event<T> {
    /**
     *
     * @param listener The listener function will be call when the event happens.
     * @param thisArgs The 'this' which will be used when calling the event listener.
     * @param disposables An array to which a {{IDisposable}} will be added. The
     * @return
    */
    (listener: (e: T) => any, thisArgs?: any, disposables?: Disposable[]): Disposable;
}
/**
 * Defines a CancellationToken. This interface is not
 * intended to be implemented. A CancellationToken must
 * be created via a CancellationTokenSource.
 */
 export interface CancellationToken {
    /**
     * Is `true` when the token has been cancelled, `false` otherwise.
     */
    readonly isCancellationRequested: boolean;
    /**
     * An [event](#Event) which fires upon cancellation.
     */
    readonly onCancellationRequested: Event<any>;
}

export type HttpProxyAgent = any;

export type HttpsProxyAgent = any;

export type Headers = { [header: string]: string | string[] | undefined };

export declare const configure: XHRConfigure;
export declare const xhr: XHRRequest;

export declare function getErrorStatusDescription(status: number): string;
