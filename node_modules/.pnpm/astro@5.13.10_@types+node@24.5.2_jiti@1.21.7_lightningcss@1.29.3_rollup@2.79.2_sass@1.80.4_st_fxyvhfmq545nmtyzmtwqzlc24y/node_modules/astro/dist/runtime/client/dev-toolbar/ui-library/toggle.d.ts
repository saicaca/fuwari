declare const styles: readonly ["purple", "gray", "red", "green", "yellow", "blue"];
type ToggleStyle = (typeof styles)[number];
export declare class DevToolbarToggle extends HTMLElement {
    shadowRoot: ShadowRoot;
    input: HTMLInputElement;
    _toggleStyle: ToggleStyle;
    get toggleStyle(): "red" | "purple" | "gray" | "green" | "yellow" | "blue";
    set toggleStyle(value: "red" | "purple" | "gray" | "green" | "yellow" | "blue");
    static observedAttributes: string[];
    constructor();
    attributeChangedCallback(): void;
    updateStyle(): void;
    connectedCallback(): void;
    get value(): string;
    set value(val: string);
}
export {};
