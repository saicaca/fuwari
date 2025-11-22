import { YAMLMap } from '../nodes/YAMLMap.js';
import { YAMLSeq } from '../nodes/YAMLSeq.js';
import type { FlowCollection } from '../parse/cst.js';
import type { ComposeContext, ComposeNode } from './compose-node.js';
import type { ComposeErrorHandler } from './composer.js';
export declare function resolveFlowCollection({ composeNode, composeEmptyNode }: ComposeNode, ctx: ComposeContext, fc: FlowCollection, onError: ComposeErrorHandler): YAMLMap.Parsed<import("../nodes/Node.js").ParsedNode, import("../nodes/Node.js").ParsedNode | null> | YAMLSeq.Parsed<import("../nodes/Node.js").ParsedNode>;
