module.exports = function dedent(templateStrings) {
    var values = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        values[_i - 1] = arguments[_i];
    }
    var matches = [];
    var strings = typeof templateStrings === 'string' ? [templateStrings] : templateStrings.slice();
    // 1. Remove trailing whitespace.
    strings[strings.length - 1] = strings[strings.length - 1].replace(/\r?\n([\t ]*)$/, '');
    // 2. Find all line breaks to determine the highest common indentation level.
    for (var i = 0; i < strings.length; i++) {
        var match = void 0;
        if (match = strings[i].match(/\n[\t ]+/g)) {
            matches.push.apply(matches, match);
        }
    }
    // 3. Remove the common indentation from all strings.
    if (matches.length) {
        var size = Math.min.apply(Math, matches.map(function (value) { return value.length - 1; }));
        var pattern = new RegExp("\n[\t ]{" + size + "}", 'g');
        for (var i = 0; i < strings.length; i++) {
            strings[i] = strings[i].replace(pattern, '\n');
        }
    }
    // 4. Remove leading whitespace.
    strings[0] = strings[0].replace(/^\r?\n/, '');
    // 5. Perform interpolation.
    var string = strings[0];
    for (var i = 0; i < values.length; i++) {
        string += values[i] + strings[i + 1];
    }
    return string;
};
//# sourceMappingURL=index.js.map