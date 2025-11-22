import type Swup from '../Swup.js';
import type { Options } from '../Swup.js';
declare const TRANSITION = "transition";
declare const ANIMATION = "animation";
type AnimationType = typeof TRANSITION | typeof ANIMATION;
type AnimationProperty = 'Delay' | 'Duration';
type AnimationStyleKey = `${AnimationType}${AnimationProperty}` | 'transitionProperty';
export type AnimationDirection = 'in' | 'out';
/**
 * Return a Promise that resolves when all CSS animations and transitions
 * are done on the page. Filters by selector or takes elements directly.
 */
export declare function awaitAnimations(this: Swup, { selector, elements }: {
    selector: Options['animationSelector'];
    elements?: NodeListOf<HTMLElement> | HTMLElement[];
}): Promise<void>;
export declare function getStyleProperties(styles: CSSStyleDeclaration, key: AnimationStyleKey): string[];
export declare function calculateTimeout(delays: string[], durations: string[]): number;
export declare function toMs(time: string): number;
export {};
//# sourceMappingURL=awaitAnimations.d.ts.map