import Plugin from '@swup/plugin';
export default abstract class Theme extends Plugin {
    _originalAnimationSelectorOption: string;
    _addedStyleElements: Element[];
    _addedHTMLContent: Element[];
    _classNameAddedToElements: ({
        selector: string;
        name: string;
    })[];
    _beforeMount(): void;
    _afterUnmount(): void;
    applyStyles(styles: string): void;
    applyHTML(content: string): void;
    addClassName(selector: string, name: string): void;
    _addClassNameToElement: () => void;
}
//# sourceMappingURL=index.d.ts.map