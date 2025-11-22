import { AxiosRequestConfig } from 'axios';
import { APIQueryParams } from './types.cjs';

/**
 * Axios config, customisable
 */
declare const axiosConfig: Omit<AxiosRequestConfig, 'headers' | 'responseType' | 'url' | 'method' | 'data'>;
interface AxiosCallbacks {
    onStart?: (url: string, params: APIQueryParams) => void;
    onSuccess?: (url: string, params: APIQueryParams) => void;
    onError?: (url: string, params: APIQueryParams, errorCode?: number) => void;
}
/**
 * Customisable callbacks, used for logging
 */
declare const fetchCallbacks: AxiosCallbacks;

export { axiosConfig, fetchCallbacks };
