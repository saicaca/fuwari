import { queryAll, type Handler } from 'swup';
import Plugin from '@swup/plugin';

import morph, { type UpdateCallback } from './morph.js';

type Options = {
	containers: string[];
	updateCallbacks: UpdateCallback[];
};

export default class SwupMorphPlugin extends Plugin {
	name = 'SwupMorphPlugin';

	requires = { swup: '>=4.6' };

	defaults: Options = {
		containers: [],
		updateCallbacks: []
	};
	options: Options;

	constructor(options: Partial<Options> = {}) {
		super();
		this.options = { ...this.defaults, ...options };
	}

	mount() {
		this.before('content:replace', this.validateContainers, { priority: 1 });
		this.on('content:replace', this.morphContainers);
	}

	protected validateContainers: Handler<'content:replace'> = (visit) => {
		// Filter out containers that are already managed by the morph plugin
		visit.containers = visit.containers.filter(
			(selector) => !this.options.containers.includes(selector)
		);
	};

	protected morphContainers: Handler<'content:replace'> = (visit) => {
		const containers = this.getContainers(document, visit.to.document!);
		const callbacks = this.options.updateCallbacks || [];

		for (const { selector, outgoing, incoming } of containers) {
			if (outgoing && incoming) {
				morph(outgoing, incoming, callbacks);
			} else if (this.options.containers.includes(selector)) {
				console.warn(`SwupMorphPlugin: No container found for selector: ${selector}`);
			}
		}
	};

	protected getContainers(oldDoc: Document, newDoc: Document) {
		const selectors = this.getContainerSelectors();
		return selectors.map((selector) => {
			const outgoing = oldDoc.querySelector(selector);
			const incoming = newDoc.querySelector(selector);
			return { selector, outgoing, incoming };
		});
	}

	protected getContainerSelectors() {
		const explit = this.options.containers;
		const implicit = queryAll('[data-swup-morph]:not([data-swup-morph=""])').map(
			(el) => `[data-swup-morph='${el.dataset.swupMorph}']`
		);
		return this.uniq([...explit, ...implicit ]);
	}

	protected uniq<T>(array: T[]): T[] {
		return [...new Set(array)];
	}
}
