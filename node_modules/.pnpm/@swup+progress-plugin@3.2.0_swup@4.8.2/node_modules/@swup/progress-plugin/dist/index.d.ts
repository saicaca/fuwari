import Plugin from '@swup/plugin';
import ProgressBar from './ProgressBar.js';
type Options = {
    className: string;
    delay: number;
    transition: number;
    minValue: number;
    initialValue: number;
    finishAnimation: boolean;
};
export default class SwupProgressPlugin extends Plugin {
    name: string;
    defaults: Options;
    options: Options;
    progressBar: ProgressBar;
    showProgressBarTimeout?: number;
    hideProgressBarTimeout?: number;
    constructor(options?: Partial<Options>);
    mount(): void;
    startShowingProgress(): void;
    stopShowingProgress(): void;
    showProgressBar(): void;
    showProgressBarAfterDelay(): void;
    hideProgressBar(): void;
    finishAnimationAndHideProgressBar(): void;
    cancelShowProgressBarTimeout(): void;
    cancelHideProgressBarTimeout(): void;
}
export {};
