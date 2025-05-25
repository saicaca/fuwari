/**
 * Utility functions for ensuring consistent URL encoding
 */

/**
 * Ensure consistent URL encoding across all tags and categories
 *
 * @param value The string to encode
 * @returns The encoded string
 */
export function encodePathSegment(value: string): string {
	return encodeURIComponent(value.trim());
}

/**
 * Decode from the URL path
 *
 * @param value String to decode
 * @returns Decoded string
 */
export function decodePathSegment(value: string): string {
	return decodeURIComponent(value);
}
