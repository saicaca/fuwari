import type { ParsedNode } from '../nodes/Node.js';
import { YAMLMap } from '../nodes/YAMLMap.js';
import type { BlockMap } from '../parse/cst.js';
import type { ComposeContext, ComposeNode } from './compose-node.js';
import type { ComposeErrorHandler } from './composer.js';
export declare function resolveBlockMap({ composeNode, composeEmptyNode }: ComposeNode, ctx: ComposeContext, bm: BlockMap, onError: ComposeErrorHandler): YAMLMap.Parsed<ParsedNode, ParsedNode | null>;
