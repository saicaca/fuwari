import { ValueToken } from './tokenizer/tokens.js';
import { ConvertState } from './types.js';
/**
 * Converts given value token to string
 */
export default function stringify(token: ValueToken, state: ConvertState): string;
