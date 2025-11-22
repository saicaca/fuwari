declare const styles: readonly ["purple", "gray", "red", "green", "yellow", "blue"];
type CardStyle = (typeof styles)[number];
export declare class DevToolbarCard extends HTMLElement {
    link?: string | undefined | null;
    clickAction?: () => void | (() => Promise<void>);
    shadowRoot: ShadowRoot;
    _cardStyle: CardStyle;
    get cardStyle(): "red" | "purple" | "gray" | "green" | "yellow" | "blue";
    set cardStyle(value: "red" | "purple" | "gray" | "green" | "yellow" | "blue");
    static observedAttributes: string[];
    constructor();
    attributeChangedCallback(): void;
    updateStyle(): void;
    connectedCallback(): void;
}
export {};
