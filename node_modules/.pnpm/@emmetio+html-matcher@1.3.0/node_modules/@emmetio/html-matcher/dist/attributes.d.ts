import Scanner from '@emmetio/scanner';
export interface AttributeToken {
    name: string;
    value?: string;
    nameStart: number;
    nameEnd: number;
    valueStart?: number;
    valueEnd?: number;
}
/**
 * Parses given string as list of HTML attributes.
 * @param src A fragment to parse. If `name` argument is provided, it must be an
 * opening tag (`<a foo="bar">`), otherwise it should be a fragment between element
 * name and tag closing angle (`foo="bar"`)
 * @param name Tag name
 */
export default function attributes(src: string, name?: string): AttributeToken[];
/**
 * Consumes attribute name from given scanner context
 */
export declare function attributeName(scanner: Scanner): boolean;
/**
 * Consumes attribute value
 */
export declare function attributeValue(scanner: Scanner): true | undefined;
/**
 * Returns clean (unquoted) value of `name` attribute
 */
export declare function getAttributeValue(attrs: AttributeToken[], name: string): string | undefined;
