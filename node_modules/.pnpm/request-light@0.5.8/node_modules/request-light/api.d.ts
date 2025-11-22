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

export type HttpProxyAgent = import('http-proxy-agent').HttpProxyAgent;

export type HttpsProxyAgent = import('https-proxy-agent').HttpsProxyAgent;

export type Headers = { [header: string]: string | string[] | undefined };

export declare const configure: XHRConfigure;
export declare const xhr: XHRRequest;

export declare function getErrorStatusDescription(status: number): string;