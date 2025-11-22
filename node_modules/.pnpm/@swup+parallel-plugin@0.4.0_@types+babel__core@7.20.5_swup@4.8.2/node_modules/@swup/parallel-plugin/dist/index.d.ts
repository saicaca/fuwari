import type { Handler, Visit } from 'swup';
import Plugin from '@swup/plugin';
declare module 'swup' {
    interface HookDefinitions {
        'content:insert': {
            containers: ContainerSet[];
        };
        'content:remove': {
            containers: ContainerSet[];
        };
    }
    interface VisitAnimation {
        /** Parallel visit: run in and out animation at the same time */
        parallel?: boolean;
    }
}
type PluginOptions = {
    /** Containers to animate in parallel */
    containers: string[];
    /** Number of previous containers to keep around after the animation */
    keep: number | {
        [container: string]: number;
    };
};
type ContainerSet = {
    /** Selector to match this container */
    selector: string;
    /** Incoming container element */
    next: HTMLElement;
    /** Outgoing container element */
    previous: HTMLElement;
    /** Container elements to keep around after the animation */
    keep: HTMLElement[];
    /** Container elements to remove after the animation */
    remove: HTMLElement[];
    /** All container elements associated with this selector */
    all: HTMLElement[];
};
export default class SwupParallelPlugin extends Plugin {
    name: string;
    requires: {
        swup: string;
    };
    defaults: PluginOptions;
    options: PluginOptions;
    originalContainers: string[] | null;
    parallelContainers: ContainerSet[];
    constructor(options?: Partial<PluginOptions>);
    mount(): void;
    /** On visit start: mark visit as parallel if conditions match */
    protected startVisit: Handler<'visit:start'>;
    /** On animation out: skip animation if parallel visit */
    protected skipOutAnimation: Handler<'animation:out:await'>;
    /** Before content replacement: insert new containers */
    protected insertContainers: Handler<'content:replace'>;
    /** After content replacement: restore original container selectors */
    protected resetContainers: Handler<'content:replace'>;
    /** After each visit: remove previous containers */
    protected cleanupContainers: () => void;
    /** Get all container sets for this visit from the current page and the incoming html */
    protected getParallelContainersForVisit(visit: Visit): ContainerSet[];
    /** Check if a visit is marked as parallel animation */
    protected isParallelVisit(visit: Visit): boolean | undefined;
    /** Mark a visit as parallel animation */
    protected markVisitAsParallelAnimation(visit: Visit): void;
    /** Check if a visit is potentially parallel */
    protected visitHasPotentialParallelAnimation(visit: Visit): boolean;
    /** Check if any of a visit's containers are animated in parallel */
    protected visitHasParallelContainers(visit: Visit): boolean;
}
export {};
