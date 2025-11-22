export type UpdateCallback = (fromEl: HTMLElement, toEl: HTMLElement) => boolean;
declare function morph(from: Node, to: Node | string, updateCallbacks?: UpdateCallback[]): void;
export default morph;
