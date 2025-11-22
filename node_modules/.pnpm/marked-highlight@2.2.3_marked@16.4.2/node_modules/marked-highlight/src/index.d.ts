declare module 'marked-highlight' {
  /**
   * A synchronous function to highlight code
   *
   * @param code The raw code to be highlighted
   * @param language The language tag found immediately after the code block
   *   opening marker (e.g. ```typescript -> language='typescript')
   * @param info The full string after the code block opening marker
   *   (e.g. ```ts twoslash -> info='ts twoslash')
   * @return The highlighted code as a HTML string
   */
  type SyncHighlightFunction = (code: string, language: string, info: string) => string;

  /**
   * An asynchronous function to highlight code
   *
   * @param code The raw code to be highlighted
   * @param language The language tag found immediately after the code block
   *   opening marker (e.g. ```typescript -> language='typescript')
   * @param info The full string after the code block opening marker
   *   (e.g. ```ts twoslash -> info='ts twoslash')
   * @return A Promise for the highlighted code as a HTML string
   */
  type AsyncHighlightFunction = (code: string, language: string, info: string) => Promise<string>;

  /**
   * Options for configuring the marked-highlight extension using a synchronous
   * highlighting function.
   */
  interface SynchronousOptions {
    /** Function to highlight code with */
    highlight: SyncHighlightFunction;
    /**
     * Not necessary when using a synchronous highlighting function, but can be
     * set without harm (it will make `marked.parse()` return a promise if true;
     * pass the {async: true} option to marked.parse() to tell TypeScript this)
     */
    async?: boolean;
    /**
     * The language tag found immediately after the code block opening marker is
     * appended to this to form the class attribute added to the <code> element.
     */
    langPrefix?: string;
    /**
     * The class attribute added to the <code> element if the language tag is
     * empty.
     */
    emptyLangClass?: string;
  }

  /**
   * Options for configuring the marked-highlight extension using an
   * asynchronous highlighting function.
   *
   * Note that the {async: true} option should also be passed to marked.parse()
   * when using an asynchronous highlighting function to tell TypeScript that it
   * will return a Promise.
   */
  interface AsynchronousOptions {
    /** Function to highlight code with */
    highlight: AsyncHighlightFunction;
    /** Must be set to true when using an asynchronous highlight function */
    async: true;
    /**
     * The language tag found immediately after the code block opening marker is
     * appended to this to form the class attribute added to the <code> element.
     */
    langPrefix?: string;
    /**
     * The class attribute added to the <code> element if the language tag is
     * empty.
     */
    emptyLangClass?: string;
  }

  /**
   * Configures a marked extension to apply syntax highlighing to code elements.
   *
   * @param options Options for the extension
   * @return A MarkedExtension to be passed to `marked.use()`
   */
  export function markedHighlight(options: SynchronousOptions): import('marked').MarkedExtension;

  /**
   * Configures a marked extension to apply syntax highlighing to code elements.
   *
   * @param options Options for the extension
   * @return A MarkedExtension to be passed to `marked.use()`
   */
  export function markedHighlight(options: AsynchronousOptions): import('marked').MarkedExtension;

  /**
   * Configures a marked extension to apply syntax highlighing to code elements.
   *
   * @param highlightFunction A synchronous function to apply syntax highlighting
   * @return A MarkedExtension to be passed to `marked.use()`
   */
  export function markedHighlight(
    highlightFunction: SyncHighlightFunction
  ): import('marked').MarkedExtension;
}
