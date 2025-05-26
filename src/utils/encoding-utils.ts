/**
 * Utility functions for ensuring consistent URL encoding
 */

// Define a map for problematic single characters from RFC 3986 reserved set
// to their desired URL-safe replacements.
// These replacements will be applied *before* general slugification and final encoding.
const CHAR_REPLACEMENT_MAP: Record<string, string> = {
  ":": "_colon",
  "/": "_slash",
  "?": "_question",
  "#": "_hash", // Changed from _sharp to _hash for consistency with RFC 3986 name
  "[": "_open_bracket",
  "]": "_close_bracket",
  "@": "_at",
  "!": "_exclamation",
  "$": "_dollar",
  "&": "_ampersand",
  "'": "_apostrophe",
  "(": "_open_paren",
  ")": "_close_paren",
  "*": "_asterisk",
  "+": "_plus",
  ",": "_comma",
  ";": "_semicolon",
  "=": "_equals",
  "%": "_percent",
  "\\": "_backslash",
  // Consider adding other common special characters if they might appear in your tags
  // that are not part of RFC 3986 reserved but you want to map explicitly.
  // Example: "%": "_percent", // % is "unreserved" but often encoded, might want custom map
};

/**
 * Pre-processes a string to apply custom character remapping and general slugification rules.
 * Handles CJK character preservation.
 *
 * @param value The original tag string (e.g., "C#", "你好世界", "Item/123", "Price $5").
 * @returns A string suitable for URL encoding, with special characters remapped/slugified.
 */
function preprocessForSlug(value: string): string {
  if (!value) return "";

  // 1. Normalize and remove diacritics (e.g., é -> e)
  let processed = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // 2. Apply CHAR_REPLACEMENT_MAP for individual problematic characters
  // This needs to be done carefully to avoid issues with regex special characters in keys.
  for (const char in CHAR_REPLACEMENT_MAP) {
    // Escape special regex characters in the 'char' key for use in RegExp constructor
    const escapedChar = char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedChar, "g");
    processed = processed.replace(regex, CHAR_REPLACEMENT_MAP[char]);
  }

  // 3. Convert Latin parts to lowercase, leave CJK as is
  // This regex ensures we only lowercase Latin letters, leaving CJK untouched.
  processed = processed.replace(/[a-zA-Z]/g, (char) => char.toLowerCase());

  // 4. Replace any remaining non-alphanumeric (that weren't mapped, or CJK/hyphen/underscore)
  //    characters with a single hyphen. This catches anything not explicitly mapped,
  //    and ensures only alphanumeric, hyphen, underscore, or CJK characters remain.
  processed = processed.replace(
    /[^a-z0-9\-_ \u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g,
    "-"
  );

  // 5. Replace spaces with hyphens, consolidate multiple hyphens/underscores,
  //    and trim leading/trailing ones.
  processed = processed
    .trim()
    .replace(/\s+/g, "-") // spaces to single hyphens
    .replace(/[-_]+/g, "-") // multiple hyphens/underscores to single hyphen
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens

  return processed;
}

/**
 * Ensure consistent URL encoding across all tags and categories
 *
 * @param value The string to encode
 * @returns The encoded string
 */
export function encodePathSegment(value: string): string {
	if (!value) return "";

	const processedValue = preprocessForSlug(value.trim());
	
	return processedValue;
}

/**
 * Decode from the URL path
 *
 * @param value String to decode
 * @returns Decoded string
 */
export function decodePathSegment(value: string): string {
	if (!value) return "";

	try {
		return decodeURIComponent(value);
	} catch (e) {
		console.error(`Failed to decode path segment: ${value}`, e);
		return value;
	}
}
