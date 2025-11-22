declare const sizes: readonly ["small", "large"];
declare const styles: readonly ["purple", "gray", "red", "green", "yellow", "blue"];
type BadgeSize = (typeof sizes)[number];
type BadgeStyle = (typeof styles)[number];
export declare class DevToolbarBadge extends HTMLElement {
    _size: BadgeSize;
    _badgeStyle: BadgeStyle;
    get size(): "small" | "large";
    set size(value: "small" | "large");
    get badgeStyle(): "red" | "purple" | "gray" | "green" | "yellow" | "blue";
    set badgeStyle(value: "red" | "purple" | "gray" | "green" | "yellow" | "blue");
    shadowRoot: ShadowRoot;
    static observedAttributes: string[];
    constructor();
    connectedCallback(): void;
    attributeChangedCallback(): void;
    updateStyle(): void;
}
export {};
