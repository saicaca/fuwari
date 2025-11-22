import type { SSRResult } from '../../types/public/internal.js';
import type { TransitionAnimationPair, TransitionAnimationValue } from '../../types/public/view-transitions.js';
export declare function createTransitionScope(result: SSRResult, hash: string): string;
export declare function renderTransition(result: SSRResult, hash: string, animationName: TransitionAnimationValue | undefined, transitionName: string): string;
export declare function createAnimationScope(transitionName: string, animations: Record<string, TransitionAnimationPair>): {
    scope: string;
    styles: string;
};
