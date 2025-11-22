import type Swup from '../Swup.js';
export declare class Classes {
    protected swup: Swup;
    protected swupClasses: string[];
    constructor(swup: Swup);
    protected get selectors(): string[];
    protected get selector(): string;
    protected get targets(): HTMLElement[];
    add(...classes: string[]): void;
    remove(...classes: string[]): void;
    clear(): void;
    protected isSwupClass(className: string): boolean;
}
//# sourceMappingURL=Classes.d.ts.map