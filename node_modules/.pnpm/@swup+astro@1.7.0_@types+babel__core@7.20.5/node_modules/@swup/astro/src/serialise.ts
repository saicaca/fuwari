export function serialiseOptions(strings: TemplateStringsArray, ...substitutions: unknown[]): string {
	return strings.reduce((acc, curr, i) => {
		const substitution = substitutions[i];
		if (typeof substitution === 'object') {
			acc += `${curr}${serialise(substitution)}`;
		} else if (substitution) {
			acc += `${curr}${substitution}`;
		} else {
			acc += curr;
		}
		return acc;
	}, '');
}

export function serialise(value: unknown) {
	return `deserialise(${JSON.stringify(JSON.stringify(value, replacer))})`;
}

export function deserialise(serialised: string) {
	return JSON.parse(serialised, reviver);
}

function replacer(key: string, value: unknown) {
	if (value instanceof RegExp) {
		return [':regex:', value.toString()];
	}
	if (typeof value === 'function') {
		let output = value.toString();
		if (value.name && (new RegExp(`^\\s*${value.name}\\s*[(]`)).test(output)) {
			output = 'function ' + output;
		}
		return [':function:', output];
	}
	return value;
}

function reviver(key: string, value: unknown) {
	if (Array.isArray(value) && value.length === 2 && typeof value[1] === 'string') {
		const type = value[0];
		value = value[1];
		if (type === ':regex:') {
			const fragments = (value as string).match(/\/(.*?)\/([a-z]*)?$/i) || [];
			return new RegExp(fragments[1], fragments[2] || '');
		}
		if (type === ':function:') {
			return new Function(`return (${value}).apply(this, arguments);`);
		}
	}
	return value;
}
