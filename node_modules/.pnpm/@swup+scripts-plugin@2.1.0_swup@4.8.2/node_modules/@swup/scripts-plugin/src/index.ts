import Plugin from '@swup/plugin';

export type Options = {
	head: boolean;
	body: boolean;
	optin: boolean;
};

export default class SwupScriptsPlugin extends Plugin {
	name = 'SwupScriptsPlugin';

	requires = {
		swup: '>=4'
	};

	defaults: Options = {
		head: true,
		body: true,
		optin: false
	};

	options: Options;

	constructor(options: Partial<Options> = {}) {
		super();
		this.options = { ...this.defaults, ...options };
	}

	mount() {
		this.on('content:replace', this.runScripts);
	}

	runScripts() {
		const { head, body, optin } = this.options;
		const scope = this.getScope({ head, body });
		if (!scope) {
			return;
		}

		const selector = optin
			? 'script[data-swup-reload-script]'
			: 'script:not([data-swup-ignore-script])';

		const scripts = Array.from(scope.querySelectorAll<HTMLScriptElement>(selector));
		scripts.forEach((script) => this.runScript(script));

		this.swup.log(`Executed ${scripts.length} scripts.`);
	}

	runScript(script: HTMLScriptElement) {
		const element = document.createElement('script');
		for (const { name, value } of script.attributes) {
			element.setAttribute(name, value);
		}
		element.textContent = script.textContent;
		script.replaceWith(element);

		return element;
	}

	getScope({ head, body }: Pick<Options, 'head' | 'body'>) {
		if (head && body) return document;

		if (head) return document.head;

		if (body) return document.body;

		return null;
	}
}
