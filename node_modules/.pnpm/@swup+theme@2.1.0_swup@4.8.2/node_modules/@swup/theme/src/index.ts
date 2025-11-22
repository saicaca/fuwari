import Plugin from '@swup/plugin';

export default abstract class Theme extends Plugin {
	_originalAnimationSelectorOption: string = '';
	_addedStyleElements: Element[] = [];
	_addedHTMLContent: Element[] = [];
	_classNameAddedToElements: ({ selector: string, name: string })[] = [];

	_beforeMount() {
		// Store original animationSelector option, then replace it
		this._originalAnimationSelectorOption = String(this.swup.options.animationSelector);
		this.swup.options.animationSelector = '[class*="swup-transition-"]';

		// Add classes after each content replace
		this.swup.hooks.on('content:replace', this._addClassNameToElement);
	}

	_afterUnmount() {
		// Restore original animationSelector option
		this.swup.options.animationSelector = this._originalAnimationSelectorOption;

		// Remove added styles
		this._addedStyleElements.forEach((element) => {
			element.outerHTML = '';
		});
		this._addedStyleElements = [];

		// Remove added HTML
		this._addedHTMLContent.forEach((element) => {
			element.outerHTML = '';
		});
		this._addedHTMLContent = [];

		// Remove added classnames
		this._classNameAddedToElements.forEach((item) => {
			const elements = Array.from(document.querySelectorAll(item.selector));
			elements.forEach((element) => {
				element.className.split(' ').forEach((classItem) => {
					if (new RegExp('^swup-transition-').test(classItem)) {
						element.classList.remove(classItem);
					}
				});
			});
		});

		this.swup.hooks.off('content:replace', this._addClassNameToElement);
	}

	applyStyles(styles: string) {
		const style = document.createElement('style');
		style.setAttribute('data-swup-theme', '');
		style.appendChild(document.createTextNode(styles));
		document.head.prepend(style);

		this._addedStyleElements.push(style);
	}

	applyHTML(content: string) {
		const element = document.createElement('div');
		element.innerHTML = content;
		document.body.appendChild(element);

		this._addedHTMLContent.push(element);
	}

	addClassName(selector: string, name: string) {
		// save so it can be later removed
		this._classNameAddedToElements.push({ selector, name });

		// add class the first time
		this._addClassNameToElement();
	}

	_addClassNameToElement = () => {
		this._classNameAddedToElements.forEach((item) => {
			const elements = Array.from(document.querySelectorAll(item.selector));
			elements.forEach((element) => {
				element.classList.add(`swup-transition-${item.name}`);
			});
		});
	};
}
