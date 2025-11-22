import { AnchorElement } from './index.js';
export type Observer = {
    start: () => void;
    stop: () => void;
    update: () => void;
};
export default function createObserver({ threshold, delay, containers, callback, filter }: {
    threshold: number;
    delay: number;
    containers: string[];
    callback: (el: AnchorElement) => void;
    filter: (el: AnchorElement) => boolean;
}): Observer;
