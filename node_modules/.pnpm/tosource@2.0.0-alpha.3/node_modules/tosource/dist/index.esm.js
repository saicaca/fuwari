/* toSource by Marcello Bastea-Forte - zlib license */
function toSource(object, replacer, indent = '  ', startingIndent = '') {
    const seen = [];
    return walk(object, replacer, indent === false ? '' : indent, startingIndent, seen);
    function walk(object, replacer, indent, currentIndent, seen) {
        const nextIndent = currentIndent + indent;
        object = replacer ? replacer(object) : object;
        switch (typeof object) {
            case 'string':
                return JSON.stringify(object);
            case 'number':
                if (Object.is(object, -0)) {
                    return '-0';
                }
                return String(object);
            case 'boolean':
            case 'undefined':
                return String(object);
            case 'function':
                return object.toString();
        }
        if (object === null) {
            return 'null';
        }
        if (object instanceof RegExp) {
            return object.toString();
        }
        if (object instanceof Date) {
            return `new Date(${object.getTime()})`;
        }
        if (object instanceof Set) {
            return `new Set(${walk(Array.from(object.values()), replacer, indent, nextIndent, seen)})`;
        }
        if (object instanceof Map) {
            return `new Map(${walk(Array.from(object.entries()), replacer, indent, nextIndent, seen)})`;
        }
        if (seen.indexOf(object) >= 0) {
            return '{$circularReference:1}';
        }
        seen.push(object);
        function join(elements) {
            return (indent.slice(1) +
                elements.join(',' + (indent && '\n') + nextIndent) +
                (indent ? ' ' : ''));
        }
        if (Array.isArray(object)) {
            return `[${join(object.map((element) => walk(element, replacer, indent, nextIndent, seen.slice())))}]`;
        }
        const keys = Object.keys(object);
        if (keys.length) {
            return `{${join(keys.map((key) => (legalKey(key) ? key : JSON.stringify(key)) +
                ':' +
                walk(object[key], replacer, indent, nextIndent, seen.slice())))}}`;
        }
        return '{}';
    }
}
const KEYWORD_REGEXP = /^(abstract|boolean|break|byte|case|catch|char|class|const|continue|debugger|default|delete|do|double|else|enum|export|extends|false|final|finally|float|for|function|goto|if|implements|import|in|instanceof|int|interface|long|native|new|null|package|private|protected|public|return|short|static|super|switch|synchronized|this|throw|throws|transient|true|try|typeof|undefined|var|void|volatile|while|with)$/;
function legalKey(key) {
    return (/^([a-z_$][0-9a-z_$]*|[0-9]+)$/gi.test(key) && !KEYWORD_REGEXP.test(key));
}

export { toSource as default };
//# sourceMappingURL=index.esm.js.map
