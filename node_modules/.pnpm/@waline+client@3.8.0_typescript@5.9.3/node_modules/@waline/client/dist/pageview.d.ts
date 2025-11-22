declare const version: string;

type WalineAbort = (reason?: any) => void;

interface WalinePageviewCountOptions {
    /**
     * Waline 服务端地址
     *
     * Waline server url
     */
    serverURL: string;
    /**
     * 浏览量 CSS 选择器
     *
     * Pageview CSS selector
     *
     * @default '.waline-pageview-count'
     */
    selector?: string;
    /**
     * 需要更新和获取的路径
     *
     * Path to be fetched and updated
     *
     * @default window.location.pathname
     */
    path?: string;
    /**
     * 是否在查询时更新 path 的浏览量
     *
     * Whether update pageviews when fetching path result
     *
     * @default true
     */
    update?: boolean;
    /**
     * 错误提示消息所使用的语言
     *
     * Language of error message
     *
     * @default navigator.language
     */
    lang?: string;
}
declare const pageviewCount: ({ serverURL, path, selector, update, lang, }: WalinePageviewCountOptions) => WalineAbort;

export { pageviewCount, version };
export type { WalineAbort, WalinePageviewCountOptions };
