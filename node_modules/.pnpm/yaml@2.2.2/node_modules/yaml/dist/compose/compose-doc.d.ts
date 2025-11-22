import type { Directives } from '../doc/directives.js';
import { Document } from '../doc/Document.js';
import type { DocumentOptions, ParseOptions, SchemaOptions } from '../options.js';
import type * as CST from '../parse/cst.js';
import type { ComposeErrorHandler } from './composer.js';
export declare function composeDoc(options: ParseOptions & DocumentOptions & SchemaOptions, directives: Directives, { offset, start, value, end }: CST.Document, onError: ComposeErrorHandler): Document.Parsed<import("../index.js").ParsedNode>;
