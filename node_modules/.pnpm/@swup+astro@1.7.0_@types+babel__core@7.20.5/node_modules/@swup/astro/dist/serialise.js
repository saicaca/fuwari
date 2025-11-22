export function serialiseOptions(strings, ...substitutions) {
    return strings.reduce((acc, curr, i) => {
        const substitution = substitutions[i];
        if (typeof substitution === 'object') {
            acc += `${curr}${serialise(substitution)}`;
        }
        else if (substitution) {
            acc += `${curr}${substitution}`;
        }
        else {
            acc += curr;
        }
        return acc;
    }, '');
}
export function serialise(value) {
    return `deserialise(${JSON.stringify(JSON.stringify(value, replacer))})`;
}
export function deserialise(serialised) {
    return JSON.parse(serialised, reviver);
}
function replacer(key, value) {
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
function reviver(key, value) {
    if (Array.isArray(value) && value.length === 2 && typeof value[1] === 'string') {
        const type = value[0];
        value = value[1];
        if (type === ':regex:') {
            const fragments = value.match(/\/(.*?)\/([a-z]*)?$/i) || [];
            return new RegExp(fragments[1], fragments[2] || '');
        }
        if (type === ':function:') {
            return new Function(`return (${value}).apply(this, arguments);`);
        }
    }
    return value;
}
