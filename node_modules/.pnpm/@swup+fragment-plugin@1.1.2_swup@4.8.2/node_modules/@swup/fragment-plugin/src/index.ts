import FragmentPlugin from './SwupFragmentPlugin.js';
export default FragmentPlugin;
import type { FragmentVisit } from './inc/defs.js';
export type { Options, Rule, FragmentElement, FragmentVisit } from './inc/defs.js';

declare module 'swup' {
	export interface Swup {
		getFragmentVisit?: FragmentPlugin['getFragmentVisit'];
		getFragmentRules?: FragmentPlugin['getRules'];
		setFragmentRules?: FragmentPlugin['setRules'];
		prependFragmentRule?: FragmentPlugin['prependRule'];
		appendFragmentRule?: FragmentPlugin['appendRule'];
	}
	export interface Visit {
		fragmentVisit?: FragmentVisit;
	}
	export interface CacheData {
		fragmentHtml?: string;
	}
}
