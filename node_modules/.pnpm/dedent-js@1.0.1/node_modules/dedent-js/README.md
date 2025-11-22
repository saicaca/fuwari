# dedent-js

Removes indentation from multiline strings. Works with both tabs and spaces.

## Installation

```
$ npm install dedent-js
```

## Usage

```js
// Dedent can be also used as a function.
expect(dedent`Line #1
	Line #2
	Line #3`).to.equal('Line #1\nLine #2\nLine #3');

// Leading/trailing line break is removed.
expect(
	dedent`
	Line #1
	Line #2
	Line #3
	`
).to.equal('Line #1\nLine #2\nLine #3');

// No more than one leading/trailing line break is removed.
expect(
	dedent`

	Line #1
	Line #2
	Line #3

	`
).to.equal('\nLine #1\nLine #2\nLine #3\n');

// Only the "base" indentation is removed.
expect(
	dedent`
	Line #1
		Line #2
			Line #3
	`
).to.equal('Line #1\n\tLine #2\n\t\tLine #3');

// The last line is ignored if it doesn't contain anything else than whitespace.
expect(
	function () {
		return dedent`
			Line #1
			Line #2
			Line #3
		`;
	}()
).to.equal('Line #1\nLine #2\nLine #3');

// Escaped characters are NOT ignored.
expect(
	dedent`
	\tLine #1
	\tLine #2
	\tLine #3
	`
).to.equal('Line #1\nLine #2\nLine #3');
```

## License
Copyright (c) 2015 Martin Kolárik. Released under the MIT license.
