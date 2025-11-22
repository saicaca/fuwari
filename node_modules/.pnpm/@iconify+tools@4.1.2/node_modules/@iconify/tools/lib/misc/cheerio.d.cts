import { Element } from 'domhandler';
import { Cheerio } from 'cheerio';

/**
 * Shortcuts for Cheerio elements
 */
type CheerioElement = Element;
type WrappedCheerioElement = Cheerio<CheerioElement>;

export type { CheerioElement, WrappedCheerioElement };
