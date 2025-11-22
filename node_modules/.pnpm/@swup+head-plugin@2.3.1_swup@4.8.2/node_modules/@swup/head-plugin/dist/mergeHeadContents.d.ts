export default function mergeHeadContents(currentHead: HTMLHeadElement, newHead: HTMLHeadElement, { shouldPersist }?: {
    shouldPersist?: (el: Element) => boolean;
}): {
    removed: Element[];
    added: Element[];
};
