import type {Root} from 'nlcst'
import type {Plugin} from 'unified'

/**
 * Add support for serializing natural language.
 *
 * @this
 *   Unified processor.
 * @returns
 *   Nothing.
 */
declare const retextStringify: Plugin<[], Root, string>

export default retextStringify
