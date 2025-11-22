import { Tags } from 'yaml';
/**
 * Converts the tags from settings and adds known tags such as !include
 * and returns Tags that can be used by the parser.
 * @param customTags Tags for parser
 */
export declare function getCustomTags(customTags: string[]): Tags;
