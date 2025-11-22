type WalineAbort = (reason?: any) => void;

interface WalineCommentCountOptions {
    /**
     * Waline 服务端地址
     *
     * Waline server url
     */
    serverURL: string;
    /**
     * 评论数 CSS 选择器
     *
     * Comment count CSS selector
     *
     * @default '.waline-comment-count'
     */
    selector?: string;
    /**
     * 需要获取的默认路径
     *
     * Path to be fetched by default
     *
     * @default window.location.pathname
     */
    path?: string;
    /**
     * 错误提示消息所使用的语言
     *
     * Language of error message
     *
     * @default navigator.language
     */
    lang?: string;
}
declare const commentCount: ({ serverURL, path, selector, lang, }: WalineCommentCountOptions) => WalineAbort;

declare const version: string;

export { commentCount, version };
export type { WalineAbort, WalineCommentCountOptions };
