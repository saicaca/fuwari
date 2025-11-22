import type { Root, Properties, ElementContent } from "hast";
import type { Plugin, Processor } from "unified";
import type { VFile } from "vfile";
export type ComponentFunction = (props: Properties, children: ElementContent[], context: ComponentContext) => ElementContent | ElementContent[] | undefined | null;
/**
 * Context object passed to the component function to give it access to the
 * current root of the tree, the current vfile and the processor.
 */
export interface ComponentContext {
    tree: Root;
    vfile: VFile;
    processor: Processor;
}
interface Options {
    components: Record<string, ComponentFunction>;
}
declare const rehypeComponents: Plugin<[Options], Root, Root>;
export default rehypeComponents;
