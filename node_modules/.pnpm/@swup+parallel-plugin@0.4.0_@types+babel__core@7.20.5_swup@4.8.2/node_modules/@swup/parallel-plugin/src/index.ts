import type { Handler, PageData, Visit } from 'swup';
import { forceReflow } from 'swup';
import Plugin from '@swup/plugin';

declare module 'swup' {
	export interface HookDefinitions {
		'content:insert': { containers: ContainerSet[] };
		'content:remove': { containers: ContainerSet[] };
	}
	export interface VisitAnimation {
		/** Parallel visit: run in and out animation at the same time */
		parallel?: boolean;
	}
}

type PluginOptions = {
	/** Containers to animate in parallel */
	containers: string[];
	/** Number of previous containers to keep around after the animation */
	keep: number | { [container: string]: number };
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
	name = 'SwupParallelPlugin';

	requires = { swup: '>=4.6' };

	defaults: PluginOptions = {
		containers: [],
		keep: 0
	};

	options: PluginOptions;

	originalContainers: string[] | null = null;
	parallelContainers: ContainerSet[] = [];

	constructor(options: Partial<PluginOptions> = {}) {
		super();
		this.options = { ...this.defaults, ...options };
	}

	mount() {
		// No containers passed? Use all content containers
		if (!this.options.containers.length) {
			this.options.containers = this.swup.options.containers;
		}

		// Create new hooks
		this.swup.hooks.create('content:insert');
		this.swup.hooks.create('content:remove');

		// On visit: check for containers and mark as parallel visit
		// Run after user hooks to allow disabling parallel animations beforehand
		this.on('visit:start', this.startVisit, { priority: 1 });

		// Before awaiting out animation: skip
		this.before('animation:out:await', this.skipOutAnimation, { priority: 1 });

		// Before content replace: insert new containers
		this.before('content:replace', this.insertContainers, { priority: 1 });

		// After content replace: reset containers
		this.on('content:replace', this.resetContainers);

		// After visit: remove old containers
		this.on('visit:end', this.cleanupContainers);
	}

	/** On visit start: mark visit as parallel if conditions match */
	protected startVisit: Handler<'visit:start'> = (visit) => {
		this.originalContainers = null;

		// Only mark as parallel visit if containers found and animation matches
		if (this.visitHasPotentialParallelAnimation(visit)) {
			visit.animation.wait = true;
			visit.animation.parallel = true;
		}
	};

	/** On animation out: skip animation if parallel visit */
	protected skipOutAnimation: Handler<'animation:out:await'> = (visit, args) => {
		if (this.isParallelVisit(visit)) {
			args.skip = true;
		}
	};

	/** Before content replacement: insert new containers */
	protected insertContainers: Handler<'content:replace'> = (visit) => {
		if (!this.isParallelVisit(visit)) {
			return;
		}

		// Get info about parallel containers and save for later cleanup
		const containers = this.getParallelContainersForVisit(visit);
		this.parallelContainers = containers;

		// Replace parallel containers ourselves
		this.swup.hooks.call('content:insert', { containers }, () => {
			for (const { all, next, previous, keep, remove } of containers) {
				all.forEach((el, i) => el.style.setProperty('--swup-parallel-container', `${i}`));
				previous.setAttribute('aria-hidden', 'true');
				previous.before(next);

				if (visit.animation.animate) {
					next.classList.add('is-next-container');
					forceReflow(next);
					next.classList.remove('is-next-container');
				}

				previous.classList.add('is-previous-container');
				keep.forEach((el) => el.classList.add('is-kept-container'));
				remove.forEach((el) => el.classList.add('is-removing-container'));
			}
		});

		// Modify visit containers so swup will only replace non-parallel containers
		this.originalContainers = visit.containers;
		const parallelSelectors = this.parallelContainers.map(({ selector }) => selector);
		visit.containers = visit.containers.filter((s) => !parallelSelectors.includes(s));
	};

	/** After content replacement: restore original container selectors */
	protected resetContainers: Handler<'content:replace'> = (visit) => {
		if (this.originalContainers) {
			visit.containers = this.originalContainers;
		}
	};

	/** After each visit: remove previous containers */
	protected cleanupContainers = () => {
		const containers = this.parallelContainers;
		this.swup.hooks.call('content:remove', { containers }, () => {
			for (const { remove, next } of containers) {
				remove.forEach((el) => el.remove());
				next.classList.remove('is-next-container');
			}
		});
		this.parallelContainers = [];
	};

	/** Get all container sets for this visit from the current page and the incoming html */
	protected getParallelContainersForVisit(visit: Visit): ContainerSet[] {
		const { containers: parallelContainers } = this.options;

		const containersInVisit = parallelContainers.filter((s) => visit.containers.includes(s));
		if (!containersInVisit.length) {
			console.warn('No parallel containers found in list of replaced containers');
			return [];
		}

		return containersInVisit.reduce((containers, selector: string) => {
			let { keep: keepCount } = this.options;
			keepCount = typeof keepCount === 'object' ? keepCount[selector] : keepCount;
			keepCount = Math.max(0, Number(keepCount));

			const next = visit.to.document!.querySelector<HTMLElement>(selector);
			const previousAll = Array.from(document.querySelectorAll<HTMLElement>(selector));

			const previous = previousAll[0];
			const keep = previousAll.slice(0, keepCount);
			const remove = previousAll.slice(keepCount);
			const all = [...new Set([next!, previous, ...keep, ...remove])];
			if (next && previous) {
				return [...containers, { selector, next, previous, keep, remove, all }];
			} else {
				console.warn(`Parallel container ${selector} not found`);
				return containers;
			}
		}, [] as ContainerSet[]);
	}

	/** Check if a visit is marked as parallel animation */
	protected isParallelVisit(visit: Visit) {
		return visit.animation.parallel;
	}

	/** Mark a visit as parallel animation */
	protected markVisitAsParallelAnimation(visit: Visit) {
		visit.animation.wait = true;
		visit.animation.parallel = true;
	}

	/** Check if a visit is potentially parallel */
	protected visitHasPotentialParallelAnimation(visit: Visit) {
		// Checking for visit.animation.parallel !== false here allows explicitly
		// disabling parallel animations in user hooks before this plugin executes
		return visit.animation.parallel !== false && this.visitHasParallelContainers(visit);
	}

	/** Check if any of a visit's containers are animated in parallel */
	protected visitHasParallelContainers(visit: Visit) {
		return this.options.containers.some((selector) => {
			const container = document.querySelector(selector);
			return container?.matches(visit.containers.join(','));
		});
	}
}
