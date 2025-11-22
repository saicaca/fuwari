import FragmentPlugin from './SwupFragmentPlugin.js';
export default FragmentPlugin;
import type { FragmentVisit } from './inc/defs.js';
export type { Options, Rule, FragmentElement, FragmentVisit } from './inc/defs.js';
declare module 'swup' {
    interface Swup {
        getFragmentVisit?: FragmentPlugin['getFragmentVisit'];
        getFragmentRules?: FragmentPlugin['getRules'];
        setFragmentRules?: FragmentPlugin['setRules'];
        prependFragmentRule?: FragmentPlugin['prependRule'];
        appendFragmentRule?: FragmentPlugin['appendRule'];
    }
    interface Visit {
        fragmentVisit?: FragmentVisit;
    }
    interface CacheData {
        fragmentHtml?: string;
    }
}
//# sourceMappingURL=index.d.ts.map