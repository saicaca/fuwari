/**
 * Create a new parser.
 */
export class ParseLatin {
    /**
     * Create a new parser.
     *
     * This additionally supports `retext`-like call: where an instance is
     * created for each file, and the file is given on construction.
     *
     * @param {string | null | undefined} [doc]
     *   Value to parse (optional).
     * @param {VFile | null | undefined} [file]
     *   Corresponding file (optional).
     */
    constructor(doc?: string | null | undefined, file?: VFile | null | undefined);
    /** @type {string | undefined} */
    doc: string | undefined;
    /** @type {Array<Plugin<Root>>} */
    tokenizeRootPlugins: Array<Plugin<Root>>;
    /** @type {Array<Plugin<Paragraph>>} */
    tokenizeParagraphPlugins: Array<Plugin<Paragraph>>;
    /** @type {Array<Plugin<Sentence>>} */
    tokenizeSentencePlugins: Array<Plugin<Sentence>>;
    /**
     * Turn natural language into a syntax tree.
     *
     * @param {string | null | undefined} [value]
     *   Value to parse (optional).
     * @returns {Root}
     *   Tree.
     */
    parse(value?: string | null | undefined): Root;
    /**
     * Parse as a root.
     *
     * @param {string | null | undefined} [value]
     *   Value to parse (optional).
     * @returns {Root}
     *   Built tree.
     */
    tokenizeRoot(value?: string | null | undefined): Root;
    /**
     * Parse as a paragraph.
     *
     * @param {string | null | undefined} [value]
     *   Value to parse (optional).
     * @returns {Paragraph}
     *   Built tree.
     */
    tokenizeParagraph(value?: string | null | undefined): Paragraph;
    /**
     * Parse as a sentence.
     *
     * @param {string | null | undefined} [value]
     *   Value to parse (optional).
     * @returns {Sentence}
     *   Built tree.
     */
    tokenizeSentence(value?: string | null | undefined): Sentence;
    /**
     *  Transform a `value` into a list of nlcsts.
     *
     * @param {string | null | undefined} [value]
     *   Value to parse (optional).
     * @returns {Array<SentenceContent>}
     *   Built sentence content.
     */
    tokenize(value?: string | null | undefined): Array<SentenceContent>;
}
export type Nodes = import('nlcst').Nodes;
export type Parents = import('nlcst').Parents;
export type Paragraph = import('nlcst').Paragraph;
export type Root = import('nlcst').Root;
export type RootContent = import('nlcst').RootContent;
export type Sentence = import('nlcst').Sentence;
export type SentenceContent = import('nlcst').SentenceContent;
export type VFile = import('vfile').VFile;
/**
 * Transform a node.
 */
export type Plugin<Node extends import("nlcst").Nodes> = (node: Node) => undefined | void;
