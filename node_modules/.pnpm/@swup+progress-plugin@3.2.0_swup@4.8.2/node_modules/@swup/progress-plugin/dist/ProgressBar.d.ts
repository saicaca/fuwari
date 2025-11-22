export default class ProgressBar {
    value: number;
    visible: boolean;
    hiding: boolean;
    className: string;
    styleAttr: string;
    animationDuration: number;
    minValue: number;
    initialValue: number;
    trickleValue: number;
    trickleInterval?: number;
    styleElement: HTMLStyleElement;
    progressElement: HTMLDivElement;
    constructor({ className, styleAttr, animationDuration, minValue, initialValue, trickleValue }?: {
        className?: string;
        styleAttr?: string;
        animationDuration?: number;
        minValue?: number;
        initialValue?: number;
        trickleValue?: number;
    });
    get defaultStyles(): string;
    show(): void;
    hide(): void;
    setValue(value: number): void;
    private installStyleElement;
    private installProgressElement;
    private fadeProgressElement;
    private uninstallProgressElement;
    private startTrickling;
    private stopTrickling;
    private trickle;
    private refresh;
    private createStyleElement;
    private createProgressElement;
}
