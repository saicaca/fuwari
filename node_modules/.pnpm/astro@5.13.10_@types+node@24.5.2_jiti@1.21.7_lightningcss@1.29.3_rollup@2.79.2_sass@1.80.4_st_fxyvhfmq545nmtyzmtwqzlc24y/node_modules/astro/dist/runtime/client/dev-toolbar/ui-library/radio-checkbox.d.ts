export declare class DevToolbarRadioCheckbox extends HTMLElement {
    private _radioStyle;
    input: HTMLInputElement;
    shadowRoot: ShadowRoot;
    get radioStyle(): "red" | "purple" | "gray" | "green" | "yellow" | "blue";
    set radioStyle(value: "red" | "purple" | "gray" | "green" | "yellow" | "blue");
    static observedAttributes: string[];
    constructor();
    connectedCallback(): void;
    updateStyle(): void;
    updateInputState(): void;
    attributeChangedCallback(): void;
}
