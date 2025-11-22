import dedent from 'dedent-js';
import ts from 'typescript';
import { pascalCase } from 'scule';
import * as path from 'path';
import path__default, { join, resolve, dirname, basename } from 'path';
import { VERSION, parse } from 'svelte/compiler';

const comma = ','.charCodeAt(0);
const semicolon = ';'.charCodeAt(0);
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const intToChar = new Uint8Array(64); // 64 possible chars.
const charToInt = new Uint8Array(128); // z is 122 in ASCII
for (let i = 0; i < chars.length; i++) {
    const c = chars.charCodeAt(i);
    intToChar[i] = c;
    charToInt[c] = i;
}
function encodeInteger(builder, num, relative) {
    let delta = num - relative;
    delta = delta < 0 ? (-delta << 1) | 1 : delta << 1;
    do {
        let clamped = delta & 0b011111;
        delta >>>= 5;
        if (delta > 0)
            clamped |= 0b100000;
        builder.write(intToChar[clamped]);
    } while (delta > 0);
    return num;
}

const bufLength = 1024 * 16;
// Provide a fallback for older environments.
const td = typeof TextDecoder !== 'undefined'
    ? /* #__PURE__ */ new TextDecoder()
    : typeof Buffer !== 'undefined'
        ? {
            decode(buf) {
                const out = Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength);
                return out.toString();
            },
        }
        : {
            decode(buf) {
                let out = '';
                for (let i = 0; i < buf.length; i++) {
                    out += String.fromCharCode(buf[i]);
                }
                return out;
            },
        };
class StringWriter {
    constructor() {
        this.pos = 0;
        this.out = '';
        this.buffer = new Uint8Array(bufLength);
    }
    write(v) {
        const { buffer } = this;
        buffer[this.pos++] = v;
        if (this.pos === bufLength) {
            this.out += td.decode(buffer);
            this.pos = 0;
        }
    }
    flush() {
        const { buffer, out, pos } = this;
        return pos > 0 ? out + td.decode(buffer.subarray(0, pos)) : out;
    }
}
function encode(decoded) {
    const writer = new StringWriter();
    let sourcesIndex = 0;
    let sourceLine = 0;
    let sourceColumn = 0;
    let namesIndex = 0;
    for (let i = 0; i < decoded.length; i++) {
        const line = decoded[i];
        if (i > 0)
            writer.write(semicolon);
        if (line.length === 0)
            continue;
        let genColumn = 0;
        for (let j = 0; j < line.length; j++) {
            const segment = line[j];
            if (j > 0)
                writer.write(comma);
            genColumn = encodeInteger(writer, segment[0], genColumn);
            if (segment.length === 1)
                continue;
            sourcesIndex = encodeInteger(writer, segment[1], sourcesIndex);
            sourceLine = encodeInteger(writer, segment[2], sourceLine);
            sourceColumn = encodeInteger(writer, segment[3], sourceColumn);
            if (segment.length === 4)
                continue;
            namesIndex = encodeInteger(writer, segment[4], namesIndex);
        }
    }
    return writer.flush();
}

class BitSet {
	constructor(arg) {
		this.bits = arg instanceof BitSet ? arg.bits.slice() : [];
	}

	add(n) {
		this.bits[n >> 5] |= 1 << (n & 31);
	}

	has(n) {
		return !!(this.bits[n >> 5] & (1 << (n & 31)));
	}
}

class Chunk {
	constructor(start, end, content) {
		this.start = start;
		this.end = end;
		this.original = content;

		this.intro = '';
		this.outro = '';

		this.content = content;
		this.storeName = false;
		this.edited = false;

		{
			this.previous = null;
			this.next = null;
		}
	}

	appendLeft(content) {
		this.outro += content;
	}

	appendRight(content) {
		this.intro = this.intro + content;
	}

	clone() {
		const chunk = new Chunk(this.start, this.end, this.original);

		chunk.intro = this.intro;
		chunk.outro = this.outro;
		chunk.content = this.content;
		chunk.storeName = this.storeName;
		chunk.edited = this.edited;

		return chunk;
	}

	contains(index) {
		return this.start < index && index < this.end;
	}

	eachNext(fn) {
		let chunk = this;
		while (chunk) {
			fn(chunk);
			chunk = chunk.next;
		}
	}

	eachPrevious(fn) {
		let chunk = this;
		while (chunk) {
			fn(chunk);
			chunk = chunk.previous;
		}
	}

	edit(content, storeName, contentOnly) {
		this.content = content;
		if (!contentOnly) {
			this.intro = '';
			this.outro = '';
		}
		this.storeName = storeName;

		this.edited = true;

		return this;
	}

	prependLeft(content) {
		this.outro = content + this.outro;
	}

	prependRight(content) {
		this.intro = content + this.intro;
	}

	reset() {
		this.intro = '';
		this.outro = '';
		if (this.edited) {
			this.content = this.original;
			this.storeName = false;
			this.edited = false;
		}
	}

	split(index) {
		const sliceIndex = index - this.start;

		const originalBefore = this.original.slice(0, sliceIndex);
		const originalAfter = this.original.slice(sliceIndex);

		this.original = originalBefore;

		const newChunk = new Chunk(index, this.end, originalAfter);
		newChunk.outro = this.outro;
		this.outro = '';

		this.end = index;

		if (this.edited) {
			// after split we should save the edit content record into the correct chunk
			// to make sure sourcemap correct
			// For example:
			// '  test'.trim()
			//     split   -> '  ' + 'test'
			//   ✔️ edit    -> '' + 'test'
			//   ✖️ edit    -> 'test' + '' 
			// TODO is this block necessary?...
			newChunk.edit('', false);
			this.content = '';
		} else {
			this.content = originalBefore;
		}

		newChunk.next = this.next;
		if (newChunk.next) newChunk.next.previous = newChunk;
		newChunk.previous = this;
		this.next = newChunk;

		return newChunk;
	}

	toString() {
		return this.intro + this.content + this.outro;
	}

	trimEnd(rx) {
		this.outro = this.outro.replace(rx, '');
		if (this.outro.length) return true;

		const trimmed = this.content.replace(rx, '');

		if (trimmed.length) {
			if (trimmed !== this.content) {
				this.split(this.start + trimmed.length).edit('', undefined, true);
				if (this.edited) {
					// save the change, if it has been edited
					this.edit(trimmed, this.storeName, true);
				}
			}
			return true;
		} else {
			this.edit('', undefined, true);

			this.intro = this.intro.replace(rx, '');
			if (this.intro.length) return true;
		}
	}

	trimStart(rx) {
		this.intro = this.intro.replace(rx, '');
		if (this.intro.length) return true;

		const trimmed = this.content.replace(rx, '');

		if (trimmed.length) {
			if (trimmed !== this.content) {
				const newChunk = this.split(this.end - trimmed.length);
				if (this.edited) {
					// save the change, if it has been edited
					newChunk.edit(trimmed, this.storeName, true);
				}
				this.edit('', undefined, true);
			}
			return true;
		} else {
			this.edit('', undefined, true);

			this.outro = this.outro.replace(rx, '');
			if (this.outro.length) return true;
		}
	}
}

function getBtoa() {
	if (typeof globalThis !== 'undefined' && typeof globalThis.btoa === 'function') {
		return (str) => globalThis.btoa(unescape(encodeURIComponent(str)));
	} else if (typeof Buffer === 'function') {
		return (str) => Buffer.from(str, 'utf-8').toString('base64');
	} else {
		return () => {
			throw new Error('Unsupported environment: `window.btoa` or `Buffer` should be supported.');
		};
	}
}

const btoa = /*#__PURE__*/ getBtoa();

class SourceMap {
	constructor(properties) {
		this.version = 3;
		this.file = properties.file;
		this.sources = properties.sources;
		this.sourcesContent = properties.sourcesContent;
		this.names = properties.names;
		this.mappings = encode(properties.mappings);
		if (typeof properties.x_google_ignoreList !== 'undefined') {
			this.x_google_ignoreList = properties.x_google_ignoreList;
		}
	}

	toString() {
		return JSON.stringify(this);
	}

	toUrl() {
		return 'data:application/json;charset=utf-8;base64,' + btoa(this.toString());
	}
}

function guessIndent(code) {
	const lines = code.split('\n');

	const tabbed = lines.filter((line) => /^\t+/.test(line));
	const spaced = lines.filter((line) => /^ {2,}/.test(line));

	if (tabbed.length === 0 && spaced.length === 0) {
		return null;
	}

	// More lines tabbed than spaced? Assume tabs, and
	// default to tabs in the case of a tie (or nothing
	// to go on)
	if (tabbed.length >= spaced.length) {
		return '\t';
	}

	// Otherwise, we need to guess the multiple
	const min = spaced.reduce((previous, current) => {
		const numSpaces = /^ +/.exec(current)[0].length;
		return Math.min(numSpaces, previous);
	}, Infinity);

	return new Array(min + 1).join(' ');
}

function getRelativePath(from, to) {
	const fromParts = from.split(/[/\\]/);
	const toParts = to.split(/[/\\]/);

	fromParts.pop(); // get dirname

	while (fromParts[0] === toParts[0]) {
		fromParts.shift();
		toParts.shift();
	}

	if (fromParts.length) {
		let i = fromParts.length;
		while (i--) fromParts[i] = '..';
	}

	return fromParts.concat(toParts).join('/');
}

const toString = Object.prototype.toString;

function isObject(thing) {
	return toString.call(thing) === '[object Object]';
}

function getLocator(source) {
	const originalLines = source.split('\n');
	const lineOffsets = [];

	for (let i = 0, pos = 0; i < originalLines.length; i++) {
		lineOffsets.push(pos);
		pos += originalLines[i].length + 1;
	}

	return function locate(index) {
		let i = 0;
		let j = lineOffsets.length;
		while (i < j) {
			const m = (i + j) >> 1;
			if (index < lineOffsets[m]) {
				j = m;
			} else {
				i = m + 1;
			}
		}
		const line = i - 1;
		const column = index - lineOffsets[line];
		return { line, column };
	};
}

const wordRegex = /\w/;

class Mappings {
	constructor(hires) {
		this.hires = hires;
		this.generatedCodeLine = 0;
		this.generatedCodeColumn = 0;
		this.raw = [];
		this.rawSegments = this.raw[this.generatedCodeLine] = [];
		this.pending = null;
	}

	addEdit(sourceIndex, content, loc, nameIndex) {
		if (content.length) {
			const contentLengthMinusOne = content.length - 1;
			let contentLineEnd = content.indexOf('\n', 0);
			let previousContentLineEnd = -1;
			// Loop through each line in the content and add a segment, but stop if the last line is empty,
			// else code afterwards would fill one line too many
			while (contentLineEnd >= 0 && contentLengthMinusOne > contentLineEnd) {
				const segment = [this.generatedCodeColumn, sourceIndex, loc.line, loc.column];
				if (nameIndex >= 0) {
					segment.push(nameIndex);
				}
				this.rawSegments.push(segment);

				this.generatedCodeLine += 1;
				this.raw[this.generatedCodeLine] = this.rawSegments = [];
				this.generatedCodeColumn = 0;

				previousContentLineEnd = contentLineEnd;
				contentLineEnd = content.indexOf('\n', contentLineEnd + 1);
			}

			const segment = [this.generatedCodeColumn, sourceIndex, loc.line, loc.column];
			if (nameIndex >= 0) {
				segment.push(nameIndex);
			}
			this.rawSegments.push(segment);

			this.advance(content.slice(previousContentLineEnd + 1));
		} else if (this.pending) {
			this.rawSegments.push(this.pending);
			this.advance(content);
		}

		this.pending = null;
	}

	addUneditedChunk(sourceIndex, chunk, original, loc, sourcemapLocations) {
		let originalCharIndex = chunk.start;
		let first = true;
		// when iterating each char, check if it's in a word boundary
		let charInHiresBoundary = false;

		while (originalCharIndex < chunk.end) {
			if (this.hires || first || sourcemapLocations.has(originalCharIndex)) {
				const segment = [this.generatedCodeColumn, sourceIndex, loc.line, loc.column];

				if (this.hires === 'boundary') {
					// in hires "boundary", group segments per word boundary than per char
					if (wordRegex.test(original[originalCharIndex])) {
						// for first char in the boundary found, start the boundary by pushing a segment
						if (!charInHiresBoundary) {
							this.rawSegments.push(segment);
							charInHiresBoundary = true;
						}
					} else {
						// for non-word char, end the boundary by pushing a segment
						this.rawSegments.push(segment);
						charInHiresBoundary = false;
					}
				} else {
					this.rawSegments.push(segment);
				}
			}

			if (original[originalCharIndex] === '\n') {
				loc.line += 1;
				loc.column = 0;
				this.generatedCodeLine += 1;
				this.raw[this.generatedCodeLine] = this.rawSegments = [];
				this.generatedCodeColumn = 0;
				first = true;
			} else {
				loc.column += 1;
				this.generatedCodeColumn += 1;
				first = false;
			}

			originalCharIndex += 1;
		}

		this.pending = null;
	}

	advance(str) {
		if (!str) return;

		const lines = str.split('\n');

		if (lines.length > 1) {
			for (let i = 0; i < lines.length - 1; i++) {
				this.generatedCodeLine++;
				this.raw[this.generatedCodeLine] = this.rawSegments = [];
			}
			this.generatedCodeColumn = 0;
		}

		this.generatedCodeColumn += lines[lines.length - 1].length;
	}
}

const n = '\n';

const warned = {
	insertLeft: false,
	insertRight: false,
	storeName: false,
};

class MagicString {
	constructor(string, options = {}) {
		const chunk = new Chunk(0, string.length, string);

		Object.defineProperties(this, {
			original: { writable: true, value: string },
			outro: { writable: true, value: '' },
			intro: { writable: true, value: '' },
			firstChunk: { writable: true, value: chunk },
			lastChunk: { writable: true, value: chunk },
			lastSearchedChunk: { writable: true, value: chunk },
			byStart: { writable: true, value: {} },
			byEnd: { writable: true, value: {} },
			filename: { writable: true, value: options.filename },
			indentExclusionRanges: { writable: true, value: options.indentExclusionRanges },
			sourcemapLocations: { writable: true, value: new BitSet() },
			storedNames: { writable: true, value: {} },
			indentStr: { writable: true, value: undefined },
			ignoreList: { writable: true, value: options.ignoreList },
		});

		this.byStart[0] = chunk;
		this.byEnd[string.length] = chunk;
	}

	addSourcemapLocation(char) {
		this.sourcemapLocations.add(char);
	}

	append(content) {
		if (typeof content !== 'string') throw new TypeError('outro content must be a string');

		this.outro += content;
		return this;
	}

	appendLeft(index, content) {
		if (typeof content !== 'string') throw new TypeError('inserted content must be a string');

		this._split(index);

		const chunk = this.byEnd[index];

		if (chunk) {
			chunk.appendLeft(content);
		} else {
			this.intro += content;
		}
		return this;
	}

	appendRight(index, content) {
		if (typeof content !== 'string') throw new TypeError('inserted content must be a string');

		this._split(index);

		const chunk = this.byStart[index];

		if (chunk) {
			chunk.appendRight(content);
		} else {
			this.outro += content;
		}
		return this;
	}

	clone() {
		const cloned = new MagicString(this.original, { filename: this.filename });

		let originalChunk = this.firstChunk;
		let clonedChunk = (cloned.firstChunk = cloned.lastSearchedChunk = originalChunk.clone());

		while (originalChunk) {
			cloned.byStart[clonedChunk.start] = clonedChunk;
			cloned.byEnd[clonedChunk.end] = clonedChunk;

			const nextOriginalChunk = originalChunk.next;
			const nextClonedChunk = nextOriginalChunk && nextOriginalChunk.clone();

			if (nextClonedChunk) {
				clonedChunk.next = nextClonedChunk;
				nextClonedChunk.previous = clonedChunk;

				clonedChunk = nextClonedChunk;
			}

			originalChunk = nextOriginalChunk;
		}

		cloned.lastChunk = clonedChunk;

		if (this.indentExclusionRanges) {
			cloned.indentExclusionRanges = this.indentExclusionRanges.slice();
		}

		cloned.sourcemapLocations = new BitSet(this.sourcemapLocations);

		cloned.intro = this.intro;
		cloned.outro = this.outro;

		return cloned;
	}

	generateDecodedMap(options) {
		options = options || {};

		const sourceIndex = 0;
		const names = Object.keys(this.storedNames);
		const mappings = new Mappings(options.hires);

		const locate = getLocator(this.original);

		if (this.intro) {
			mappings.advance(this.intro);
		}

		this.firstChunk.eachNext((chunk) => {
			const loc = locate(chunk.start);

			if (chunk.intro.length) mappings.advance(chunk.intro);

			if (chunk.edited) {
				mappings.addEdit(
					sourceIndex,
					chunk.content,
					loc,
					chunk.storeName ? names.indexOf(chunk.original) : -1,
				);
			} else {
				mappings.addUneditedChunk(sourceIndex, chunk, this.original, loc, this.sourcemapLocations);
			}

			if (chunk.outro.length) mappings.advance(chunk.outro);
		});

		return {
			file: options.file ? options.file.split(/[/\\]/).pop() : undefined,
			sources: [
				options.source ? getRelativePath(options.file || '', options.source) : options.file || '',
			],
			sourcesContent: options.includeContent ? [this.original] : undefined,
			names,
			mappings: mappings.raw,
			x_google_ignoreList: this.ignoreList ? [sourceIndex] : undefined,
		};
	}

	generateMap(options) {
		return new SourceMap(this.generateDecodedMap(options));
	}

	_ensureindentStr() {
		if (this.indentStr === undefined) {
			this.indentStr = guessIndent(this.original);
		}
	}

	_getRawIndentString() {
		this._ensureindentStr();
		return this.indentStr;
	}

	getIndentString() {
		this._ensureindentStr();
		return this.indentStr === null ? '\t' : this.indentStr;
	}

	indent(indentStr, options) {
		const pattern = /^[^\r\n]/gm;

		if (isObject(indentStr)) {
			options = indentStr;
			indentStr = undefined;
		}

		if (indentStr === undefined) {
			this._ensureindentStr();
			indentStr = this.indentStr || '\t';
		}

		if (indentStr === '') return this; // noop

		options = options || {};

		// Process exclusion ranges
		const isExcluded = {};

		if (options.exclude) {
			const exclusions =
				typeof options.exclude[0] === 'number' ? [options.exclude] : options.exclude;
			exclusions.forEach((exclusion) => {
				for (let i = exclusion[0]; i < exclusion[1]; i += 1) {
					isExcluded[i] = true;
				}
			});
		}

		let shouldIndentNextCharacter = options.indentStart !== false;
		const replacer = (match) => {
			if (shouldIndentNextCharacter) return `${indentStr}${match}`;
			shouldIndentNextCharacter = true;
			return match;
		};

		this.intro = this.intro.replace(pattern, replacer);

		let charIndex = 0;
		let chunk = this.firstChunk;

		while (chunk) {
			const end = chunk.end;

			if (chunk.edited) {
				if (!isExcluded[charIndex]) {
					chunk.content = chunk.content.replace(pattern, replacer);

					if (chunk.content.length) {
						shouldIndentNextCharacter = chunk.content[chunk.content.length - 1] === '\n';
					}
				}
			} else {
				charIndex = chunk.start;

				while (charIndex < end) {
					if (!isExcluded[charIndex]) {
						const char = this.original[charIndex];

						if (char === '\n') {
							shouldIndentNextCharacter = true;
						} else if (char !== '\r' && shouldIndentNextCharacter) {
							shouldIndentNextCharacter = false;

							if (charIndex === chunk.start) {
								chunk.prependRight(indentStr);
							} else {
								this._splitChunk(chunk, charIndex);
								chunk = chunk.next;
								chunk.prependRight(indentStr);
							}
						}
					}

					charIndex += 1;
				}
			}

			charIndex = chunk.end;
			chunk = chunk.next;
		}

		this.outro = this.outro.replace(pattern, replacer);

		return this;
	}

	insert() {
		throw new Error(
			'magicString.insert(...) is deprecated. Use prependRight(...) or appendLeft(...)',
		);
	}

	insertLeft(index, content) {
		if (!warned.insertLeft) {
			console.warn(
				'magicString.insertLeft(...) is deprecated. Use magicString.appendLeft(...) instead',
			); // eslint-disable-line no-console
			warned.insertLeft = true;
		}

		return this.appendLeft(index, content);
	}

	insertRight(index, content) {
		if (!warned.insertRight) {
			console.warn(
				'magicString.insertRight(...) is deprecated. Use magicString.prependRight(...) instead',
			); // eslint-disable-line no-console
			warned.insertRight = true;
		}

		return this.prependRight(index, content);
	}

	move(start, end, index) {
		if (index >= start && index <= end) throw new Error('Cannot move a selection inside itself');

		this._split(start);
		this._split(end);
		this._split(index);

		const first = this.byStart[start];
		const last = this.byEnd[end];

		const oldLeft = first.previous;
		const oldRight = last.next;

		const newRight = this.byStart[index];
		if (!newRight && last === this.lastChunk) return this;
		const newLeft = newRight ? newRight.previous : this.lastChunk;

		if (oldLeft) oldLeft.next = oldRight;
		if (oldRight) oldRight.previous = oldLeft;

		if (newLeft) newLeft.next = first;
		if (newRight) newRight.previous = last;

		if (!first.previous) this.firstChunk = last.next;
		if (!last.next) {
			this.lastChunk = first.previous;
			this.lastChunk.next = null;
		}

		first.previous = newLeft;
		last.next = newRight || null;

		if (!newLeft) this.firstChunk = first;
		if (!newRight) this.lastChunk = last;
		return this;
	}

	overwrite(start, end, content, options) {
		options = options || {};
		return this.update(start, end, content, { ...options, overwrite: !options.contentOnly });
	}

	update(start, end, content, options) {
		if (typeof content !== 'string') throw new TypeError('replacement content must be a string');

		if (this.original.length !== 0) {
			while (start < 0) start += this.original.length;
			while (end < 0) end += this.original.length;
		}

		if (end > this.original.length) throw new Error('end is out of bounds');
		if (start === end)
			throw new Error(
				'Cannot overwrite a zero-length range – use appendLeft or prependRight instead',
			);

		this._split(start);
		this._split(end);

		if (options === true) {
			if (!warned.storeName) {
				console.warn(
					'The final argument to magicString.overwrite(...) should be an options object. See https://github.com/rich-harris/magic-string',
				); // eslint-disable-line no-console
				warned.storeName = true;
			}

			options = { storeName: true };
		}
		const storeName = options !== undefined ? options.storeName : false;
		const overwrite = options !== undefined ? options.overwrite : false;

		if (storeName) {
			const original = this.original.slice(start, end);
			Object.defineProperty(this.storedNames, original, {
				writable: true,
				value: true,
				enumerable: true,
			});
		}

		const first = this.byStart[start];
		const last = this.byEnd[end];

		if (first) {
			let chunk = first;
			while (chunk !== last) {
				if (chunk.next !== this.byStart[chunk.end]) {
					throw new Error('Cannot overwrite across a split point');
				}
				chunk = chunk.next;
				chunk.edit('', false);
			}

			first.edit(content, storeName, !overwrite);
		} else {
			// must be inserting at the end
			const newChunk = new Chunk(start, end, '').edit(content, storeName);

			// TODO last chunk in the array may not be the last chunk, if it's moved...
			last.next = newChunk;
			newChunk.previous = last;
		}
		return this;
	}

	prepend(content) {
		if (typeof content !== 'string') throw new TypeError('outro content must be a string');

		this.intro = content + this.intro;
		return this;
	}

	prependLeft(index, content) {
		if (typeof content !== 'string') throw new TypeError('inserted content must be a string');

		this._split(index);

		const chunk = this.byEnd[index];

		if (chunk) {
			chunk.prependLeft(content);
		} else {
			this.intro = content + this.intro;
		}
		return this;
	}

	prependRight(index, content) {
		if (typeof content !== 'string') throw new TypeError('inserted content must be a string');

		this._split(index);

		const chunk = this.byStart[index];

		if (chunk) {
			chunk.prependRight(content);
		} else {
			this.outro = content + this.outro;
		}
		return this;
	}

	remove(start, end) {
		if (this.original.length !== 0) {
			while (start < 0) start += this.original.length;
			while (end < 0) end += this.original.length;
		}

		if (start === end) return this;

		if (start < 0 || end > this.original.length) throw new Error('Character is out of bounds');
		if (start > end) throw new Error('end must be greater than start');

		this._split(start);
		this._split(end);

		let chunk = this.byStart[start];

		while (chunk) {
			chunk.intro = '';
			chunk.outro = '';
			chunk.edit('');

			chunk = end > chunk.end ? this.byStart[chunk.end] : null;
		}
		return this;
	}

	reset(start, end) {
		if (this.original.length !== 0) {
			while (start < 0) start += this.original.length;
			while (end < 0) end += this.original.length;
		}

		if (start === end) return this;

		if (start < 0 || end > this.original.length) throw new Error('Character is out of bounds');
		if (start > end) throw new Error('end must be greater than start');

		this._split(start);
		this._split(end);

		let chunk = this.byStart[start];

		while (chunk) {
			chunk.reset();

			chunk = end > chunk.end ? this.byStart[chunk.end] : null;
		}
		return this;
	}

	lastChar() {
		if (this.outro.length) return this.outro[this.outro.length - 1];
		let chunk = this.lastChunk;
		do {
			if (chunk.outro.length) return chunk.outro[chunk.outro.length - 1];
			if (chunk.content.length) return chunk.content[chunk.content.length - 1];
			if (chunk.intro.length) return chunk.intro[chunk.intro.length - 1];
		} while ((chunk = chunk.previous));
		if (this.intro.length) return this.intro[this.intro.length - 1];
		return '';
	}

	lastLine() {
		let lineIndex = this.outro.lastIndexOf(n);
		if (lineIndex !== -1) return this.outro.substr(lineIndex + 1);
		let lineStr = this.outro;
		let chunk = this.lastChunk;
		do {
			if (chunk.outro.length > 0) {
				lineIndex = chunk.outro.lastIndexOf(n);
				if (lineIndex !== -1) return chunk.outro.substr(lineIndex + 1) + lineStr;
				lineStr = chunk.outro + lineStr;
			}

			if (chunk.content.length > 0) {
				lineIndex = chunk.content.lastIndexOf(n);
				if (lineIndex !== -1) return chunk.content.substr(lineIndex + 1) + lineStr;
				lineStr = chunk.content + lineStr;
			}

			if (chunk.intro.length > 0) {
				lineIndex = chunk.intro.lastIndexOf(n);
				if (lineIndex !== -1) return chunk.intro.substr(lineIndex + 1) + lineStr;
				lineStr = chunk.intro + lineStr;
			}
		} while ((chunk = chunk.previous));
		lineIndex = this.intro.lastIndexOf(n);
		if (lineIndex !== -1) return this.intro.substr(lineIndex + 1) + lineStr;
		return this.intro + lineStr;
	}

	slice(start = 0, end = this.original.length) {
		if (this.original.length !== 0) {
			while (start < 0) start += this.original.length;
			while (end < 0) end += this.original.length;
		}

		let result = '';

		// find start chunk
		let chunk = this.firstChunk;
		while (chunk && (chunk.start > start || chunk.end <= start)) {
			// found end chunk before start
			if (chunk.start < end && chunk.end >= end) {
				return result;
			}

			chunk = chunk.next;
		}

		if (chunk && chunk.edited && chunk.start !== start)
			throw new Error(`Cannot use replaced character ${start} as slice start anchor.`);

		const startChunk = chunk;
		while (chunk) {
			if (chunk.intro && (startChunk !== chunk || chunk.start === start)) {
				result += chunk.intro;
			}

			const containsEnd = chunk.start < end && chunk.end >= end;
			if (containsEnd && chunk.edited && chunk.end !== end)
				throw new Error(`Cannot use replaced character ${end} as slice end anchor.`);

			const sliceStart = startChunk === chunk ? start - chunk.start : 0;
			const sliceEnd = containsEnd ? chunk.content.length + end - chunk.end : chunk.content.length;

			result += chunk.content.slice(sliceStart, sliceEnd);

			if (chunk.outro && (!containsEnd || chunk.end === end)) {
				result += chunk.outro;
			}

			if (containsEnd) {
				break;
			}

			chunk = chunk.next;
		}

		return result;
	}

	// TODO deprecate this? not really very useful
	snip(start, end) {
		const clone = this.clone();
		clone.remove(0, start);
		clone.remove(end, clone.original.length);

		return clone;
	}

	_split(index) {
		if (this.byStart[index] || this.byEnd[index]) return;

		let chunk = this.lastSearchedChunk;
		const searchForward = index > chunk.end;

		while (chunk) {
			if (chunk.contains(index)) return this._splitChunk(chunk, index);

			chunk = searchForward ? this.byStart[chunk.end] : this.byEnd[chunk.start];
		}
	}

	_splitChunk(chunk, index) {
		if (chunk.edited && chunk.content.length) {
			// zero-length edited chunks are a special case (overlapping replacements)
			const loc = getLocator(this.original)(index);
			throw new Error(
				`Cannot split a chunk that has already been edited (${loc.line}:${loc.column} – "${chunk.original}")`,
			);
		}

		const newChunk = chunk.split(index);

		this.byEnd[index] = chunk;
		this.byStart[index] = newChunk;
		this.byEnd[newChunk.end] = newChunk;

		if (chunk === this.lastChunk) this.lastChunk = newChunk;

		this.lastSearchedChunk = chunk;
		return true;
	}

	toString() {
		let str = this.intro;

		let chunk = this.firstChunk;
		while (chunk) {
			str += chunk.toString();
			chunk = chunk.next;
		}

		return str + this.outro;
	}

	isEmpty() {
		let chunk = this.firstChunk;
		do {
			if (
				(chunk.intro.length && chunk.intro.trim()) ||
				(chunk.content.length && chunk.content.trim()) ||
				(chunk.outro.length && chunk.outro.trim())
			)
				return false;
		} while ((chunk = chunk.next));
		return true;
	}

	length() {
		let chunk = this.firstChunk;
		let length = 0;
		do {
			length += chunk.intro.length + chunk.content.length + chunk.outro.length;
		} while ((chunk = chunk.next));
		return length;
	}

	trimLines() {
		return this.trim('[\\r\\n]');
	}

	trim(charType) {
		return this.trimStart(charType).trimEnd(charType);
	}

	trimEndAborted(charType) {
		const rx = new RegExp((charType || '\\s') + '+$');

		this.outro = this.outro.replace(rx, '');
		if (this.outro.length) return true;

		let chunk = this.lastChunk;

		do {
			const end = chunk.end;
			const aborted = chunk.trimEnd(rx);

			// if chunk was trimmed, we have a new lastChunk
			if (chunk.end !== end) {
				if (this.lastChunk === chunk) {
					this.lastChunk = chunk.next;
				}

				this.byEnd[chunk.end] = chunk;
				this.byStart[chunk.next.start] = chunk.next;
				this.byEnd[chunk.next.end] = chunk.next;
			}

			if (aborted) return true;
			chunk = chunk.previous;
		} while (chunk);

		return false;
	}

	trimEnd(charType) {
		this.trimEndAborted(charType);
		return this;
	}
	trimStartAborted(charType) {
		const rx = new RegExp('^' + (charType || '\\s') + '+');

		this.intro = this.intro.replace(rx, '');
		if (this.intro.length) return true;

		let chunk = this.firstChunk;

		do {
			const end = chunk.end;
			const aborted = chunk.trimStart(rx);

			if (chunk.end !== end) {
				// special case...
				if (chunk === this.lastChunk) this.lastChunk = chunk.next;

				this.byEnd[chunk.end] = chunk;
				this.byStart[chunk.next.start] = chunk.next;
				this.byEnd[chunk.next.end] = chunk.next;
			}

			if (aborted) return true;
			chunk = chunk.next;
		} while (chunk);

		return false;
	}

	trimStart(charType) {
		this.trimStartAborted(charType);
		return this;
	}

	hasChanged() {
		return this.original !== this.toString();
	}

	_replaceRegexp(searchValue, replacement) {
		function getReplacement(match, str) {
			if (typeof replacement === 'string') {
				return replacement.replace(/\$(\$|&|\d+)/g, (_, i) => {
					// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#specifying_a_string_as_a_parameter
					if (i === '$') return '$';
					if (i === '&') return match[0];
					const num = +i;
					if (num < match.length) return match[+i];
					return `$${i}`;
				});
			} else {
				return replacement(...match, match.index, str, match.groups);
			}
		}
		function matchAll(re, str) {
			let match;
			const matches = [];
			while ((match = re.exec(str))) {
				matches.push(match);
			}
			return matches;
		}
		if (searchValue.global) {
			const matches = matchAll(searchValue, this.original);
			matches.forEach((match) => {
				if (match.index != null) {
					const replacement = getReplacement(match, this.original);
					if (replacement !== match[0]) {
						this.overwrite(
							match.index,
							match.index + match[0].length,
							replacement
						);
					}
				}
			});
		} else {
			const match = this.original.match(searchValue);
			if (match && match.index != null) {
				const replacement = getReplacement(match, this.original);
				if (replacement !== match[0]) {
					this.overwrite(
						match.index,
						match.index + match[0].length,
						replacement
					);
				}
			}
		}
		return this;
	}

	_replaceString(string, replacement) {
		const { original } = this;
		const index = original.indexOf(string);

		if (index !== -1) {
			this.overwrite(index, index + string.length, replacement);
		}

		return this;
	}

	replace(searchValue, replacement) {
		if (typeof searchValue === 'string') {
			return this._replaceString(searchValue, replacement);
		}

		return this._replaceRegexp(searchValue, replacement);
	}

	_replaceAllString(string, replacement) {
		const { original } = this;
		const stringLength = string.length;
		for (
			let index = original.indexOf(string);
			index !== -1;
			index = original.indexOf(string, index + stringLength)
		) {
			const previous = original.slice(index, index + stringLength);
			if (previous !== replacement)
				this.overwrite(index, index + stringLength, replacement);
		}

		return this;
	}

	replaceAll(searchValue, replacement) {
		if (typeof searchValue === 'string') {
			return this._replaceAllString(searchValue, replacement);
		}

		if (!searchValue.global) {
			throw new TypeError(
				'MagicString.prototype.replaceAll called with a non-global RegExp argument',
			);
		}

		return this._replaceRegexp(searchValue, replacement);
	}
}

// @ts-check
/** @typedef { import('estree').BaseNode} BaseNode */

/** @typedef {{
	skip: () => void;
	remove: () => void;
	replace: (node: BaseNode) => void;
}} WalkerContext */

class WalkerBase {
	constructor() {
		/** @type {boolean} */
		this.should_skip = false;

		/** @type {boolean} */
		this.should_remove = false;

		/** @type {BaseNode | null} */
		this.replacement = null;

		/** @type {WalkerContext} */
		this.context = {
			skip: () => (this.should_skip = true),
			remove: () => (this.should_remove = true),
			replace: (node) => (this.replacement = node)
		};
	}

	/**
	 *
	 * @param {any} parent
	 * @param {string} prop
	 * @param {number} index
	 * @param {BaseNode} node
	 */
	replace(parent, prop, index, node) {
		if (parent) {
			if (index !== null) {
				parent[prop][index] = node;
			} else {
				parent[prop] = node;
			}
		}
	}

	/**
	 *
	 * @param {any} parent
	 * @param {string} prop
	 * @param {number} index
	 */
	remove(parent, prop, index) {
		if (parent) {
			if (index !== null) {
				parent[prop].splice(index, 1);
			} else {
				delete parent[prop];
			}
		}
	}
}

// @ts-check

/** @typedef { import('estree').BaseNode} BaseNode */
/** @typedef { import('./walker.js').WalkerContext} WalkerContext */

/** @typedef {(
 *    this: WalkerContext,
 *    node: BaseNode,
 *    parent: BaseNode,
 *    key: string,
 *    index: number
 * ) => void} SyncHandler */

class SyncWalker extends WalkerBase {
	/**
	 *
	 * @param {SyncHandler} enter
	 * @param {SyncHandler} leave
	 */
	constructor(enter, leave) {
		super();

		/** @type {SyncHandler} */
		this.enter = enter;

		/** @type {SyncHandler} */
		this.leave = leave;
	}

	/**
	 *
	 * @param {BaseNode} node
	 * @param {BaseNode} parent
	 * @param {string} [prop]
	 * @param {number} [index]
	 * @returns {BaseNode}
	 */
	visit(node, parent, prop, index) {
		if (node) {
			if (this.enter) {
				const _should_skip = this.should_skip;
				const _should_remove = this.should_remove;
				const _replacement = this.replacement;
				this.should_skip = false;
				this.should_remove = false;
				this.replacement = null;

				this.enter.call(this.context, node, parent, prop, index);

				if (this.replacement) {
					node = this.replacement;
					this.replace(parent, prop, index, node);
				}

				if (this.should_remove) {
					this.remove(parent, prop, index);
				}

				const skipped = this.should_skip;
				const removed = this.should_remove;

				this.should_skip = _should_skip;
				this.should_remove = _should_remove;
				this.replacement = _replacement;

				if (skipped) return node;
				if (removed) return null;
			}

			for (const key in node) {
				const value = node[key];

				if (typeof value !== "object") {
					continue;
				} else if (Array.isArray(value)) {
					for (let i = 0; i < value.length; i += 1) {
						if (value[i] !== null && typeof value[i].type === 'string') {
							if (!this.visit(value[i], node, key, i)) {
								// removed
								i--;
							}
						}
					}
				} else if (value !== null && typeof value.type === "string") {
					this.visit(value, node, key, null);
				}
			}

			if (this.leave) {
				const _replacement = this.replacement;
				const _should_remove = this.should_remove;
				this.replacement = null;
				this.should_remove = false;

				this.leave.call(this.context, node, parent, prop, index);

				if (this.replacement) {
					node = this.replacement;
					this.replace(parent, prop, index, node);
				}

				if (this.should_remove) {
					this.remove(parent, prop, index);
				}

				const removed = this.should_remove;

				this.replacement = _replacement;
				this.should_remove = _should_remove;

				if (removed) return null;
			}
		}

		return node;
	}
}

// @ts-check

/** @typedef { import('estree').BaseNode} BaseNode */
/** @typedef { import('./sync.js').SyncHandler} SyncHandler */
/** @typedef { import('./async.js').AsyncHandler} AsyncHandler */

/**
 *
 * @param {BaseNode} ast
 * @param {{
 *   enter?: SyncHandler
 *   leave?: SyncHandler
 * }} walker
 * @returns {BaseNode}
 */
function walk(ast, { enter, leave }) {
	const instance = new SyncWalker(enter, leave);
	return instance.visit(ast, null);
}

function parseAttributes(str, start) {
    const attrs = [];
    const pattern = /([\w-$]+\b)(?:=(?:"([^"]*)"|'([^']*)'|(\S+)))?/g;
    let match;
    while ((match = pattern.exec(str)) !== null) {
        const attr = match[0];
        const name = match[1];
        const value = match[2] || match[3] || match[4];
        const attrStart = start + str.indexOf(attr);
        attrs[name] = value !== null && value !== void 0 ? value : name;
        attrs.push({
            type: 'Attribute',
            name,
            value: !value || [
                {
                    type: 'Text',
                    start: attrStart + attr.indexOf('=') + 1,
                    end: attrStart + attr.length,
                    raw: value
                }
            ],
            start: attrStart,
            end: attrStart + attr.length
        });
    }
    return attrs;
}
// Regex ensures that attributes with > characters in them still result in the content being matched correctly
const scriptRegex = /(<!--[^]*?-->)|(<script((?:\s+[^=>'"\/\s]+=(?:"[^"]*"|'[^']*'|[^>\s]+)|\s+[^=>'"\/\s]+)*\s*)>)([\S\s]*?)<\/script>/g;
const styleRegex = /(<!--[^]*?-->)|(<style((?:\s+[^=>'"\/\s]+=(?:"[^"]*"|'[^']*'|[^>\s]+)|\s+[^=>'"\/\s]+)*\s*)>)([\S\s]*?)<\/style>/g;
function extractTag(htmlx, tag) {
    const exp = tag === 'script' ? scriptRegex : styleRegex;
    const matches = [];
    let match = null;
    while ((match = exp.exec(htmlx)) != null) {
        if (match[0].startsWith('<!--')) {
            // Tag is inside comment
            continue;
        }
        let content = match[4];
        if (!content) {
            // Keep tag and transform it like a regular element
            content = '';
        }
        const start = match.index + match[2].length;
        const end = start + content.length;
        const containerStart = match.index;
        const containerEnd = match.index + match[0].length;
        matches.push({
            start: containerStart,
            end: containerEnd,
            name: tag,
            type: tag === 'style' ? 'Style' : 'Script',
            attributes: parseAttributes(match[3], containerStart + `<${tag}`.length),
            content: {
                type: 'Text',
                start,
                end,
                value: content,
                raw: content
            }
        });
    }
    return matches;
}
function findVerbatimElements(htmlx) {
    const styleTags = extractTag(htmlx, 'style');
    const tags = extractTag(htmlx, 'script');
    for (const styleTag of styleTags) {
        // Could happen if someone has a `<style>...</style>` string in their script tag
        const insideScript = tags.some((tag) => tag.start < styleTag.start && tag.end > styleTag.end);
        if (!insideScript) {
            tags.push(styleTag);
        }
    }
    return tags;
}
function blankVerbatimContent(htmlx, verbatimElements) {
    let output = htmlx;
    for (const node of verbatimElements) {
        const content = node.content;
        if (content) {
            output =
                output.substring(0, content.start) +
                    output
                        .substring(content.start, content.end)
                        // blank out the content
                        .replace(/[^\n]/g, ' ')
                        // excess blank space can make the svelte parser very slow (sec->min). break it up with comments (works in style/script)
                        .replace(/[^\n][^\n][^\n][^\n]\n/g, '/**/\n') +
                    output.substring(content.end);
        }
    }
    return output;
}
function parseHtmlx(htmlx, parse, options) {
    //Svelte tries to parse style and script tags which doesn't play well with typescript, so we blank them out.
    //HTMLx spec says they should just be retained after processing as is, so this is fine
    const verbatimElements = findVerbatimElements(htmlx);
    const deconstructed = blankVerbatimContent(htmlx, verbatimElements);
    //extract the html content parsed as htmlx this excludes our script and style tags
    const parsingCode = options.emitOnTemplateError && !options.svelte5Plus
        ? blankPossiblyErrorOperatorOrPropertyAccess(deconstructed)
        : deconstructed;
    const htmlxAst = parse(parsingCode, options.svelte5Plus ? { loose: options.emitOnTemplateError } : undefined).html;
    //restore our script and style tags as nodes to maintain validity with HTMLx
    for (const s of verbatimElements) {
        htmlxAst.children.push(s);
        htmlxAst.start = Math.min(htmlxAst.start, s.start);
        htmlxAst.end = Math.max(htmlxAst.end, s.end);
    }
    return { htmlxAst, tags: verbatimElements };
}
const possibleOperatorOrPropertyAccess = new Set([
    '.',
    '?',
    '*',
    '~',
    '=',
    '<',
    '!',
    '&',
    '^',
    '|',
    ',',
    '+',
    '-'
]);
const id_char = /[\w$]/;
function blankPossiblyErrorOperatorOrPropertyAccess(htmlx) {
    let index = htmlx.indexOf('}');
    let lastIndex = 0;
    const { length } = htmlx;
    while (index < length && index >= 0) {
        let backwardIndex = index - 1;
        while (backwardIndex > lastIndex) {
            const char = htmlx.charAt(backwardIndex);
            if (possibleOperatorOrPropertyAccess.has(char)) {
                if (char === '!') {
                    // remove ! if it's at the beginning but not if it's used as the TS non-null assertion operator
                    let prev = backwardIndex - 1;
                    while (prev > lastIndex && htmlx.charAt(prev) === ' ') {
                        prev--;
                    }
                    if (id_char.test(htmlx.charAt(prev))) {
                        break;
                    }
                }
                const isPlusOrMinus = char === '+' || char === '-';
                const isIncrementOrDecrement = isPlusOrMinus && htmlx.charAt(backwardIndex - 1) === char;
                if (isIncrementOrDecrement) {
                    backwardIndex -= 2;
                    continue;
                }
                htmlx =
                    htmlx.substring(0, backwardIndex) + ' ' + htmlx.substring(backwardIndex + 1);
            }
            else if (!/\s/.test(char) && char !== ')' && char !== ']') {
                break;
            }
            backwardIndex--;
        }
        lastIndex = index;
        index = htmlx.indexOf('}', index + 1);
    }
    return htmlx;
}

/**
 * use:xxx={params}   --->    __sveltets_2_ensureAction(xxx(svelte.mapElementTag('ParentNodeName'),(params)));
 */
function handleActionDirective(attr, element) {
    element.addAction(attr);
}

/**
 * Moves or inserts text to the specified end in order.
 * "In order" means that the transformation of the text before
 * the given position reads exactly what was moved/inserted
 * from left to right.
 * After the transformation is done, everything inside the start-end-range that was
 * not moved will be removed. If there's a delete position given, things will be moved
 * to the end first before getting deleted. This may ensure better mappings for auto completion
 * for example.
 * Note: If you need the last char to be mapped so that it follows the previous character,
 * you may need to find a different way because MagicString does not allow us to move a range
 * that goes from `start` to `end` to the `end` position.
 */
function transform(str, start, end, transformations) {
    var _a, _b;
    const moves = [];
    let appendPosition = end;
    let ignoreNextString = false;
    let deletePos;
    let deleteDest;
    for (let i = 0; i < transformations.length; i++) {
        const transformation = transformations[i];
        if (typeof transformation === 'number') {
            deletePos = moves.length;
            deleteDest = transformation;
        }
        else if (typeof transformation === 'string') {
            if (!ignoreNextString) {
                str.appendLeft(appendPosition, transformation);
            }
            ignoreNextString = false;
        }
        else {
            const tStart = transformation[0];
            let tEnd = transformation[1];
            if (tStart === tEnd) {
                // zero-range selection, don't move, it would
                // cause bugs and isn't necessary anyway
                continue;
            }
            if (tEnd < end - 1 &&
                // TODO can we somehow make this more performant?
                !transformations.some((t) => typeof t !== 'string' && t[0] === tEnd)) {
                tEnd += 1;
                const next = transformations[i + 1];
                ignoreNextString = typeof next === 'string';
                // Do not append the next string, rather overwrite the next character. This ensures
                // that mappings of the string afterwards are not mapped to a previous character, making
                // mappings of ranges one character too short. If there's no string in the next transformation,
                // completely delete the first character afterwards. This also makes the mapping more correct,
                // so that autocompletion triggered on the last character works correctly.
                const overwrite = typeof next === 'string' ? next : '';
                str.overwrite(tEnd - 1, tEnd, overwrite, { contentOnly: true });
            }
            appendPosition = tEnd;
            moves.push([tStart, tEnd]);
        }
    }
    deletePos = deletePos !== null && deletePos !== void 0 ? deletePos : moves.length;
    for (let i = 0; i < deletePos; i++) {
        str.move(moves[i][0], moves[i][1], end);
    }
    let removeStart = start;
    const sortedMoves = [...moves].sort((t1, t2) => t1[0] - t2[0]);
    // Remove everything between the transformations up until the end position
    for (const transformation of sortedMoves) {
        if (removeStart < transformation[0]) {
            if (deletePos !== moves.length &&
                removeStart > deleteDest &&
                removeStart < end &&
                transformation[0] < end) {
                str.move(removeStart, transformation[0], end);
            }
            if (transformation[0] < end) {
                // Use one space because of hover etc: This will make map deleted characters to the whitespace
                str.overwrite(removeStart, transformation[0], ' ', { contentOnly: true });
            }
        }
        removeStart = transformation[1];
    }
    if (removeStart > end) {
        // Reset the end to the last transformation before the end if there were transformations after the end
        // so we still delete the correct range afterwards
        let idx = sortedMoves.findIndex((m) => m[0] > end) - 1;
        removeStart = (_b = (_a = sortedMoves[idx]) === null || _a === void 0 ? void 0 : _a[1]) !== null && _b !== void 0 ? _b : end;
    }
    if (removeStart < end) {
        // Completely delete the first character afterwards. This makes the mapping more correct,
        // so that autocompletion triggered on the last character works correctly.
        str.overwrite(removeStart, removeStart + 1, '', { contentOnly: true });
        removeStart++;
    }
    if (removeStart < end) {
        // Use one space because of hover etc: This will map deleted characters to the whitespace
        if (deletePos !== moves.length && removeStart > deleteDest && removeStart + 1 < end) {
            // Can only move stuff up to the end, not including, else we get a "cannot move inside itself" error
            str.move(removeStart, end - 1, end);
            str.overwrite(removeStart, end - 1, ' ', { contentOnly: true });
            str.overwrite(end - 1, end, '', { contentOnly: true });
        }
        else {
            str.overwrite(removeStart, end, ' ', { contentOnly: true });
        }
    }
    for (let i = deletePos; i < moves.length; i++) {
        // Can happen when there's not enough space left at the end of an unfininished element/component tag.
        // Better to leave potentially slightly disarranged code than fail loudly
        if (moves[i][1] >= end && moves[i][0] <= end)
            break;
        str.move(moves[i][0], moves[i][1], end);
    }
}
/**
 * Surrounds given range with a prefix and suffix. This is benefitial
 * for better mappings in some cases. Example: If we transform `foo` to `"foo"`
 * and if TS underlines the whole `"foo"`, we need to make sure that the quotes
 * are also mapped to the correct positions.
 * Returns the input start/end transformation for convenience.
 */
function surroundWith(str, [start, end], prefix, suffix) {
    if (start + 1 === end) {
        str.overwrite(start, end, `${prefix}${str.original.charAt(start)}${suffix}`, {
            contentOnly: true
        });
    }
    else {
        str.overwrite(start, start + 1, `${prefix}${str.original.charAt(start)}`, {
            contentOnly: true
        });
        str.overwrite(end - 1, end, `${str.original.charAt(end - 1)}${suffix}`, {
            contentOnly: true
        });
    }
    return [start, end];
}
/**
 * Returns the [start, end] indexes of a directive (action,animation,etc) name.
 * Example: use:foo --> [startOfFoo, endOfFoo]
 */
function getDirectiveNameStartEndIdx(str, node) {
    const colonIdx = str.original.indexOf(':', node.start);
    return [colonIdx + 1, colonIdx + 1 + `${node.name}`.length];
}
/**
 * Removes characters from the string that are invalid for TS variable names.
 * Careful: This does not check if the leading character
 * is valid (numerical values aren't for example).
 */
function sanitizePropName(name) {
    return name
        .split('')
        .map((char) => (/[0-9A-Za-z$_]/.test(char) ? char : '_'))
        .join('');
}
/**
 * Check if there's a member access trailing behind given expression and if yes,
 * bump the position to include it.
 * Usually it's there because of the preprocessing we do before we let Svelte parse the template.
 */
function withTrailingPropertyAccess(originalText, position) {
    let index = position;
    while (index < originalText.length) {
        const char = originalText[index];
        if (!char.trim()) {
            index++;
            continue;
        }
        if (char === '.') {
            return index + 1;
        }
        if (char === '?' && originalText[index + 1] === '.') {
            return index + 2;
        }
        break;
    }
    return position;
}
function rangeWithTrailingPropertyAccess(originalText, node) {
    return [node.start, withTrailingPropertyAccess(originalText, node.end)];
}
/**
 * Get the end of the node, excluding the type annotation
 */
function getEnd(node) {
    var _a, _b;
    return isTypescriptNode(node) ? node.expression.end : ((_b = (_a = node.typeAnnotation) === null || _a === void 0 ? void 0 : _a.start) !== null && _b !== void 0 ? _b : node.end);
}
function isTypescriptNode(node) {
    return (node.type === 'TSAsExpression' ||
        node.type === 'TSSatisfiesExpression' ||
        node.type === 'TSNonNullExpression');
}
/**
 * Returns `true` if the given block is implicitly closed, which could be the case in loose parsing mode.
 * E.g.:
 * ```html
 * <div>
 *   {#if x}
 * </div>
 * ```
 * @param end
 * @param block
 * @returns
 */
function isImplicitlyClosedBlock(end, block) {
    var _a, _b;
    return end < ((_b = (_a = block.children[block.children.length - 1]) === null || _a === void 0 ? void 0 : _a.end) !== null && _b !== void 0 ? _b : block.expression.end);
}

/**
 * animate:xxx(yyy)   --->   __sveltets_2_ensureAnimation(xxx(svelte.mapElementTag('..'),__sveltets_2_AnimationMove,(yyy)));
 */
function handleAnimateDirective(str, attr, element) {
    const transformations = [
        '__sveltets_2_ensureAnimation(',
        getDirectiveNameStartEndIdx(str, attr),
        `(${element.typingsNamespace}.mapElementTag('${element.tagName}'),__sveltets_2_AnimationMove`
    ];
    if (attr.expression) {
        transformations.push(',(', rangeWithTrailingPropertyAccess(str.original, attr.expression), ')');
    }
    transformations.push('));');
    element.appendToStartEnd(transformations);
}

var svgAttributes = 'accent-height accumulate additive alignment-baseline allowReorder alphabetic amplitude arabic-form ascent attributeName attributeType autoReverse azimuth baseFrequency baseline-shift baseProfile bbox begin bias by calcMode cap-height class clip clipPathUnits clip-path clip-rule color color-interpolation color-interpolation-filters color-profile color-rendering contentScriptType contentStyleType cursor cx cy d decelerate descent diffuseConstant direction display divisor dominant-baseline dur dx dy edgeMode elevation enable-background end exponent externalResourcesRequired fill fill-opacity fill-rule filter filterRes filterUnits flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight format from fr fx fy g1 g2 glyph-name glyph-orientation-horizontal glyph-orientation-vertical glyphRef gradientTransform gradientUnits hanging height href horiz-adv-x horiz-origin-x id ideographic image-rendering in in2 intercept k k1 k2 k3 k4 kernelMatrix kernelUnitLength kerning keyPoints keySplines keyTimes lang lengthAdjust letter-spacing lighting-color limitingConeAngle local marker-end marker-mid marker-start markerHeight markerUnits markerWidth mask maskContentUnits maskUnits mathematical max media method min mode name numOctaves offset onabort onactivate onbegin onclick onend onerror onfocusin onfocusout onload onmousedown onmousemove onmouseout onmouseover onmouseup onrepeat onresize onscroll onunload opacity operator order orient orientation origin overflow overline-position overline-thickness panose-1 paint-order pathLength patternContentUnits patternTransform patternUnits pointer-events points pointsAtX pointsAtY pointsAtZ preserveAlpha preserveAspectRatio primitiveUnits r radius refX refY rendering-intent repeatCount repeatDur requiredExtensions requiredFeatures restart result rotate rx ry scale seed shape-rendering slope spacing specularConstant specularExponent speed spreadMethod startOffset stdDeviation stemh stemv stitchTiles stop-color stop-opacity strikethrough-position strikethrough-thickness string stroke stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width style surfaceScale systemLanguage tabindex tableValues target targetX targetY text-anchor text-decoration text-rendering textLength to transform type u1 u2 underline-position underline-thickness unicode unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical values version vert-adv-y vert-origin-x vert-origin-y viewBox viewTarget visibility width widths word-spacing writing-mode x x-height x1 x2 xChannelSelector xlink:actuate xlink:arcrole xlink:href xlink:role xlink:show xlink:title xlink:type xml:base xml:lang xml:space y y1 y2 yChannelSelector z zoomAndPan'.split(' ');

const IGNORE_START_COMMENT = '/*Ωignore_startΩ*/';
const IGNORE_END_COMMENT = '/*Ωignore_endΩ*/';
/** to tell tooling to ignore the character at this position; can for example be used to ignore everything starting at this position */
const IGNORE_POSITION_COMMENT = '/*Ωignore_positionΩ*/';
/**
 * Surrounds given string with a start/end comment which marks it
 * to be ignored by tooling.
 */
function surroundWithIgnoreComments(str) {
    return IGNORE_START_COMMENT + str + IGNORE_END_COMMENT;
}

const voidTags = 'area,base,br,col,embed,hr,img,input,link,meta,param,source,track,wbr'.split(',');
/**
 * Handles HTML elements as well as svelte:options, svelte:head, svelte:window, svelte:body, svelte:element
 *
 * Children of this element should call the methods on this class to add themselves to the correct
 * position within the transformation.
 *
 * The transformation result does not have anything to do with HTMLx, it instead uses plan JS,
 * leveraging scoped blocks (`{ ... }`). Each element is transformed to something that is
 * contained in such a block. This ensures we can declare variables inside that do not leak
 * to the outside while preserving TypeScript's control flow.
 *
 * A transformation reads for example like this:
 * ```
 * // before
 * <div class={foo} />
 * // after
 * { const $$_div = __sveltets_2_createElement("div", {"class": foo,}); }
 * ```
 */
class Element {
    get name() {
        this.referencedName = true;
        return this._name;
    }
    /**
     * @param str The MagicString instance used to manipulate the text
     * @param node The Svelte AST node that represents this element
     * @param typingsNamespace Determines which namespace to use for the createElement function
     * @param parent The Svelte AST parent node
     */
    constructor(str, node, typingsNamespace, parent) {
        this.str = str;
        this.node = node;
        this.typingsNamespace = typingsNamespace;
        this.parent = parent;
        this.startEndTransformation = ['});'];
        this.attrsTransformation = [];
        this.actionsTransformation = [];
        this.actionIdentifiers = [];
        this.endTransformation = [];
        // Add const $$xxx = ... only if the variable name is actually used
        // in order to prevent "$$xxx is defined but never used" TS hints
        this.referencedName = false;
        if (parent) {
            parent.child = this;
        }
        this.tagName = this.node.name === 'svelte:body' ? 'body' : this.node.name;
        this.isSelfclosing = this.computeIsSelfclosing();
        this.startTagStart = this.node.start;
        this.startTagEnd = this.computeStartTagEnd();
        const tagEnd = (this.tagNameEnd = this.startTagStart + this.node.name.length + 1);
        // Ensure deleted characters are mapped to the attributes object so we
        // get autocompletion when triggering it on a whitespace.
        if (/\s/.test(str.original.charAt(tagEnd))) {
            this.attrsTransformation.push(tagEnd);
            this.attrsTransformation.push([tagEnd, tagEnd + 1]);
            // Overwrite necessary or else we get really weird mappings
            this.str.overwrite(tagEnd, tagEnd + 1, '', { contentOnly: true });
        }
        switch (this.node.name) {
            // Although not everything that is possible to add to Element
            // is valid on the special svelte elements,
            // we still also handle them here and let the Svelte parser handle invalid
            // cases. For us it doesn't make a difference to a normal HTML element.
            case 'svelte:options':
            case 'svelte:head':
            case 'svelte:window':
            case 'svelte:body':
            case 'svelte:fragment': {
                // remove the colon: svelte:xxx -> sveltexxx
                const nodeName = `svelte${this.node.name.substring(7)}`;
                this._name = '$$_' + nodeName + this.computeDepth();
                break;
            }
            case 'svelte:element': {
                this._name = '$$_svelteelement' + this.computeDepth();
                break;
            }
            case 'slot': {
                this._name = '$$_slot' + this.computeDepth();
                break;
            }
            default: {
                this._name = '$$_' + sanitizePropName(this.node.name) + this.computeDepth();
                break;
            }
        }
    }
    /**
     * attribute={foo}  -->  "attribute": foo,
     * @param name Attribute name
     * @param value Attribute value, if present. If not present, this is treated as a shorthand attribute
     */
    addAttribute(name, value) {
        if (value) {
            this.attrsTransformation.push(...name, ':', ...value, ',');
        }
        else {
            this.attrsTransformation.push(...name, ',');
        }
    }
    /**
     * Handle the slot of `<... slot=".." />`
     * @param transformation Slot name transformation
     */
    addSlotName(transformation) {
        this.slotLetsTransformation = this.slotLetsTransformation || [[], []];
        this.slotLetsTransformation[0] = transformation;
    }
    /**
     * Handle the let: of `<... let:xx={yy} />`
     * @param transformation Let transformation
     */
    addSlotLet(transformation) {
        this.slotLetsTransformation = this.slotLetsTransformation || [['default'], []];
        this.slotLetsTransformation[1].push(...transformation, ',');
    }
    addAction(attr) {
        const id = `$$action_${this.actionIdentifiers.length}`;
        this.actionIdentifiers.push(id);
        if (!this.actionsTransformation.length) {
            this.actionsTransformation.push('{');
        }
        this.actionsTransformation.push(`const ${id} = __sveltets_2_ensureAction(`, getDirectiveNameStartEndIdx(this.str, attr), `(${this.typingsNamespace}.mapElementTag('${this.tagName}')`);
        if (attr.expression) {
            this.actionsTransformation.push(',(', rangeWithTrailingPropertyAccess(this.str.original, attr.expression), ')');
        }
        this.actionsTransformation.push('));');
    }
    /**
     * Add something right after the start tag end.
     */
    appendToStartEnd(value) {
        this.startEndTransformation.push(...value);
    }
    performTransformation() {
        this.endTransformation.push('}');
        const slotLetTransformation = [];
        if (this.slotLetsTransformation) {
            if (this.slotLetsTransformation[0][0] === 'default') {
                slotLetTransformation.push(
                // add dummy destructuring parameter because if all parameters are unused,
                // the mapping will be confusing, because TS will highlight the whole destructuring
                `{const {${surroundWithIgnoreComments('$$_$$')},`, ...this.slotLetsTransformation[1], `} = ${this.parent.name}.$$slot_def.default;$$_$$;`);
            }
            else {
                slotLetTransformation.push(
                // See comment above
                `{const {${surroundWithIgnoreComments('$$_$$')},`, ...this.slotLetsTransformation[1], `} = ${this.parent.name}.$$slot_def["`, ...this.slotLetsTransformation[0], '"];$$_$$;');
            }
            this.endTransformation.push('}');
        }
        if (this.actionIdentifiers.length) {
            this.endTransformation.push('}');
        }
        if (this.isSelfclosing) {
            // The transformation is the whole start tag + <, ex: <span
            // To avoid the end tag transform being moved to before the tag name,
            // manually remove the first character and let the `transform` function skip removing unused
            let transformEnd = this.startTagEnd;
            if (this.str.original[transformEnd - 1] !== '>' &&
                (transformEnd === this.tagNameEnd || transformEnd === this.tagNameEnd + 1)) {
                transformEnd = this.startTagStart;
                this.str.remove(this.startTagStart, this.startTagStart + 1);
            }
            transform(this.str, this.startTagStart, transformEnd, [
                // Named slot transformations go first inside a outer block scope because
                // <div let:xx {x} /> means "use the x of let:x", and without a separate
                // block scope this would give a "used before defined" error
                ...slotLetTransformation,
                ...this.actionsTransformation,
                ...this.getStartTransformation(),
                ...this.attrsTransformation,
                ...this.startEndTransformation,
                ...this.endTransformation
            ]);
        }
        else {
            transform(this.str, this.startTagStart, this.startTagEnd, [
                ...slotLetTransformation,
                ...this.actionsTransformation,
                ...this.getStartTransformation(),
                ...this.attrsTransformation,
                ...this.startEndTransformation
            ]);
            const closingTag = this.str.original.substring(this.str.original.lastIndexOf('</', this.node.end - 1) + 2, this.node.end - 1);
            const tagEndIdx = this.str.original
                .substring(this.node.start, this.node.end)
                .lastIndexOf(`</${this.node.name}`);
            // tagEndIdx === -1 happens in situations of unclosed tags like `<p>fooo <p>anothertag</p>`
            const endStart = tagEndIdx === -1 || closingTag.trim() !== this.node.name
                ? this.node.end
                : tagEndIdx + this.node.start;
            transform(this.str, endStart, this.node.end, this.endTransformation);
        }
    }
    isCustomElement() {
        var _a, _b, _c;
        if (this.tagName.includes('-')) {
            return true;
        }
        if ((_c = (_b = (_a = this.node.attributes) === null || _a === void 0 ? void 0 : _a.find((a) => a.name === 'is')) === null || _b === void 0 ? void 0 : _b.value[0]) === null || _c === void 0 ? void 0 : _c.data.includes('-')) {
            return true;
        }
        return false;
    }
    getStartTransformation() {
        var _a, _b;
        const createElement = `${this.typingsNamespace}.createElement`;
        const addActions = () => {
            if (this.actionIdentifiers.length) {
                return `, __sveltets_2_union(${this.actionIdentifiers.join(',')})`;
            }
            else {
                return '';
            }
        };
        let createElementStatement;
        switch (this.node.name) {
            // Although not everything that is possible to add to Element
            // is valid on the special svelte elements,
            // we still also handle them here and let the Svelte parser handle invalid
            // cases. For us it doesn't make a difference to a normal HTML element.
            case 'svelte:options':
            case 'svelte:head':
            case 'svelte:window':
            case 'svelte:body':
            case 'svelte:fragment': {
                createElementStatement = [`${createElement}("${this.node.name}"${addActions()}, {`];
                break;
            }
            case 'svelte:element': {
                const nodeName = this.node.tag
                    ? typeof this.node.tag !== 'string'
                        ? [this.node.tag.start, this.node.tag.end]
                        : `"${this.node.tag}"`
                    : '""';
                createElementStatement = [`${createElement}(`, nodeName, `${addActions()}, {`];
                break;
            }
            case 'slot': {
                // If the element is a <slot> tag, create the element with the createSlot-function
                // which is created inside createRenderFunction.ts to check that the name and attributes
                // of the slot tag are correct. The check will error if the user defined $$Slots
                // and the slot definition or its attributes contradict that type definition.
                const slotName = ((_b = (_a = this.node.attributes) === null || _a === void 0 ? void 0 : _a.find((a) => a.name === 'name')) === null || _b === void 0 ? void 0 : _b.value[0]) ||
                    'default';
                createElementStatement = [
                    '__sveltets_createSlot(',
                    typeof slotName === 'string'
                        ? `"${slotName}"`
                        : surroundWith(this.str, [slotName.start, slotName.end], '"', '"'),
                    ', {'
                ];
                break;
            }
            default: {
                createElementStatement = [
                    `${createElement}("`,
                    [this.node.start + 1, this.tagNameEnd],
                    `"${addActions()}, {`
                ];
                break;
            }
        }
        if (this.referencedName) {
            createElementStatement[0] = `const ${this._name} = ` + createElementStatement[0];
        }
        createElementStatement[0] = `{ ${createElementStatement[0]}`;
        return createElementStatement;
    }
    computeStartTagEnd() {
        var _a;
        if ((_a = this.node.children) === null || _a === void 0 ? void 0 : _a.length) {
            return this.node.children[0].start;
        }
        return this.isSelfclosing
            ? this.node.end
            : this.str.original.lastIndexOf('>', this.node.end - 2) + 1;
    }
    computeIsSelfclosing() {
        var _a;
        if (this.str.original[this.node.end - 2] === '/' || voidTags.includes(this.node.name)) {
            return true;
        }
        return (!((_a = this.node.children) === null || _a === void 0 ? void 0 : _a.length) &&
            // Paranoid check because theoretically there could be other void
            // tags in different namespaces other than HTML
            !this.str.original
                .substring(this.node.start, this.node.end)
                .match(new RegExp(`</${this.node.name}\\s*>$`)));
    }
    computeDepth() {
        let idx = 0;
        let parent = this.parent;
        while (parent) {
            parent = parent.parent;
            idx++;
        }
        return idx;
    }
}

/**
 * Handles Svelte components as well as svelte:self and svelte:component
 *
 * Children of this element should call the methods on this class to add themselves to the correct
 * position within the transformation.
 *
 * The transformation result does not have anything to do with HTMLx, it instead uses plan JS,
 * leveraging scoped blocks (`{ ... }`). Each element is transformed to something that is
 * contained in such a block. This ensures we can declare variables inside that do not leak
 * to the outside while preserving TypeScript's control flow.
 *
 * A transformation reads for example like this:
 * ```
 * // before
 * <Comp prop={foo} />
 * // after
 * { const $$_Comp = new Comp({ target: __sveltets_2_any(), props: {"prop": foo,}}); }
 * ```
 */
class InlineComponent {
    get name() {
        if (this.addNameConstDeclaration) {
            this.addNameConstDeclaration();
            this.addNameConstDeclaration = undefined;
        }
        return this._name;
    }
    constructor(str, node, parent) {
        this.str = str;
        this.node = node;
        this.parent = parent;
        this.startTransformation = [];
        this.startEndTransformation = [];
        this.propsTransformation = [];
        this.eventsTransformation = [];
        this.snippetPropsTransformation = [];
        this.endTransformation = [];
        if (parent) {
            parent.child = this;
        }
        this.isSelfclosing = this.computeIsSelfclosing();
        this.startTagStart = this.node.start;
        this.startTagEnd = this.computeStartTagEnd();
        const tagEnd = (this.tagNameEnd = this.startTagStart + this.node.name.length + 1);
        // Ensure deleted characters are mapped to the attributes object so we
        // get autocompletion when triggering it on a whitespace.
        if (/\s/.test(str.original.charAt(tagEnd))) {
            this.propsTransformation.push(tagEnd);
            this.propsTransformation.push([tagEnd, tagEnd + 1]);
            // Overwrite necessary or else we get really weird mappings
            this.str.overwrite(tagEnd, tagEnd + 1, '', { contentOnly: true });
        }
        if (this.node.name === 'svelte:self') {
            // TODO try to get better typing here, maybe TS allows us to use the created class
            // even if it's used in the function that is used to create it
            this._name = '$$_svelteself' + this.computeDepth();
            this.startTransformation.push('{ __sveltets_2_createComponentAny({');
            this.addNameConstDeclaration = () => (this.startTransformation[0] = `{ const ${this._name} = __sveltets_2_createComponentAny({`);
            this.startEndTransformation.push('});');
        }
        else {
            const isSvelteComponentTag = this.node.name === 'svelte:component';
            // We don't know if the thing we use to create the Svelte component with
            // is actually a proper Svelte component, which would lead to errors
            // when accessing things like $$prop_def. Therefore widen the type
            // here, falling back to a any-typed component to ensure the user doesn't
            // get weird followup-errors all over the place. The diagnostic error
            // will be on the __sveltets_2_ensureComponent part, giving a more helpful message
            // The name is reversed here so that when the component is undeclared,
            // TypeScript won't suggest the undeclared variable to be a misspelling of the generated variable
            this._name =
                '$$_' +
                    Array.from(sanitizePropName(this.node.name)).reverse().join('') +
                    this.computeDepth();
            const constructorName = this._name + 'C';
            const nodeNameStart = isSvelteComponentTag
                ? this.node.expression.start
                : this.str.original.indexOf(this.node.name, this.node.start);
            const nodeNameEnd = isSvelteComponentTag
                ? this.node.expression.end
                : nodeNameStart + this.node.name.length;
            this.startTransformation.push(`{ const ${constructorName} = __sveltets_2_ensureComponent(`, [nodeNameStart, nodeNameEnd], `); new ${constructorName}({ target: __sveltets_2_any(), props: {`);
            this.addNameConstDeclaration = () => (this.startTransformation[2] = `); const ${this._name} = new ${constructorName}({ target: __sveltets_2_any(), props: {`);
            this.startEndTransformation.push('}});');
        }
    }
    /**
     * prop={foo}  -->  "prop": foo,
     * @param name Property name
     * @param value Attribute value, if present. If not present, this is treated as a shorthand attribute
     */
    addProp(name, value) {
        if (value) {
            this.propsTransformation.push(...name, ':', ...value, ',');
        }
        else {
            this.propsTransformation.push(...name, ',');
        }
    }
    /**
     * on:click={xxx}  -->  $$_Component.$on("click", xxx)
     * @param name Event name
     * @param expression Event handler, if present
     */
    addEvent([nameStart, nameEnd], expression) {
        this.eventsTransformation.push(`${this.name}.$on(`, surroundWith(this.str, [nameStart, nameEnd], '"', '"'), ', ', expression ? expression : '() => {}', ');');
    }
    /**
     * Handle the slot of `<... slot=".." />`
     * @param transformation Slot name transformation
     */
    addSlotName(transformation) {
        this.slotLetsTransformation = this.slotLetsTransformation || [[], []];
        this.slotLetsTransformation[0] = transformation;
    }
    /**
     * Handle the let: of `<... let:xx={yy} />`
     * @param transformation Let transformation
     */
    addSlotLet(transformation) {
        this.slotLetsTransformation = this.slotLetsTransformation || [['default'], []];
        this.slotLetsTransformation[1].push(...transformation, ',');
    }
    addImplicitSnippetProp(name, transforms) {
        this.addProp([name], transforms);
        this.snippetPropsTransformation.push(this.str.original.slice(name[0], name[1]));
    }
    /**
     * Add something right after the start tag end.
     */
    appendToStartEnd(value) {
        this.startEndTransformation.push(...value);
    }
    performTransformation() {
        var _a;
        const namedSlotLetTransformation = [];
        const defaultSlotLetTransformation = [];
        if (this.slotLetsTransformation) {
            if (this.slotLetsTransformation[0][0] === 'default') {
                defaultSlotLetTransformation.push(
                // add dummy destructuring parameter because if all parameters are unused,
                // the mapping will be confusing, because TS will highlight the whole destructuring
                `{const {${surroundWithIgnoreComments('$$_$$')},`, ...this.slotLetsTransformation[1], `} = ${this.name}.$$slot_def.default;$$_$$;`);
            }
            else {
                namedSlotLetTransformation.push(
                // See comment above
                `{const {${surroundWithIgnoreComments('$$_$$')},`, ...this.slotLetsTransformation[1], `} = ${this.parent.name}.$$slot_def["`, ...this.slotLetsTransformation[0], '"];$$_$$;');
            }
            this.endTransformation.push('}');
        }
        const snippetPropVariables = (_a = this.snippetPropsTransformation) === null || _a === void 0 ? void 0 : _a.join(', ');
        const snippetPropVariablesDeclaration = snippetPropVariables
            ? surroundWithIgnoreComments(`const {${snippetPropVariables}} = ${this.name}.$$prop_def;`)
            : '';
        if (this.isSelfclosing) {
            this.endTransformation.push('}');
            transform(this.str, this.startTagStart, this.startTagEnd, [
                // Named slot transformations go first inside a outer block scope because
                // <Comp let:xx {x} /> means "use the x of let:x", and without a separate
                // block scope this would give a "used before defined" error
                ...namedSlotLetTransformation,
                ...this.startTransformation,
                ...this.propsTransformation,
                ...this.startEndTransformation,
                ...this.eventsTransformation,
                ...defaultSlotLetTransformation,
                snippetPropVariablesDeclaration,
                ...this.endTransformation
            ]);
        }
        else {
            let endStart = this.str.original
                .substring(this.node.start, this.node.end)
                .lastIndexOf(`</${this.node.name}`);
            if (endStart === -1) {
                // Can happen in loose parsing mode when there's no closing tag
                endStart = this.node.end;
                this.startTagEnd = Math.max(this.node.end - 1, this.tagNameEnd);
            }
            else {
                endStart += this.node.start;
            }
            if (!this.node.name.startsWith('svelte:') && endStart !== this.node.end) {
                // Ensure the end tag is mapped, too. </Component> -> Component}
                this.endTransformation.push([endStart + 2, endStart + this.node.name.length + 2]);
            }
            this.endTransformation.push('}');
            let transformationEnd = this.startTagEnd;
            // The transformation is the whole start tag + <, ex: <Comp
            // To avoid the "cannot move inside itself" error,
            // manually remove the first character and let the transform function skip removing unused
            if (transformationEnd === this.tagNameEnd) {
                transformationEnd = this.startTagStart;
                this.str.remove(this.startTagStart, this.startTagStart + 1);
            }
            transform(this.str, this.startTagStart, transformationEnd, [
                // See comment above why this goes first
                ...namedSlotLetTransformation,
                ...this.startTransformation,
                ...this.propsTransformation,
                ...this.startEndTransformation,
                ...this.eventsTransformation,
                snippetPropVariablesDeclaration,
                ...defaultSlotLetTransformation
            ]);
            transform(this.str, endStart, this.node.end, this.endTransformation);
        }
    }
    computeStartTagEnd() {
        var _a;
        if ((_a = this.node.children) === null || _a === void 0 ? void 0 : _a.length) {
            return this.node.children[0].start;
        }
        return this.isSelfclosing
            ? this.node.end
            : this.str.original.lastIndexOf('>', this.node.end - 2) + 1;
    }
    computeIsSelfclosing() {
        return this.str.original[this.node.end - 2] === '/';
    }
    computeDepth() {
        let idx = 0;
        let parent = this.parent;
        while (parent) {
            parent = parent.parent;
            idx++;
        }
        return idx;
    }
}

/**
 * List taken from `elements.d.ts` in Svelte core by searching for all attributes of type `number | undefined | null`;
 */
const numberOnlyAttributes = new Set([
    'aria-colcount',
    'aria-colindex',
    'aria-colspan',
    'aria-level',
    'aria-posinset',
    'aria-rowcount',
    'aria-rowindex',
    'aria-rowspan',
    'aria-setsize',
    'aria-valuemax',
    'aria-valuemin',
    'aria-valuenow',
    'results',
    'span',
    'marginheight',
    'marginwidth',
    'maxlength',
    'minlength',
    'currenttime',
    'defaultplaybackrate',
    'volume',
    'high',
    'low',
    'optimum',
    'start',
    'size',
    'border',
    'cols',
    'rows',
    'colspan',
    'rowspan',
    'tabindex'
]);
/**
 * Handle various kinds of attributes and make them conform to being valid in context of a object definition
 * - {x}   --->    x
 * - x="{..}"   --->    x:..
 * - lowercase DOM attributes
 * - multi-value handling
 */
function handleAttribute(str, attr, parent, preserveCase, svelte5Plus, element) {
    if (parent.name === '!DOCTYPE' ||
        ['Style', 'Script'].includes(parent.type) ||
        (attr.name === 'name' && parent.type === 'Slot')) {
        // - <!DOCTYPE html> is already removed by now from MagicString
        // - Don't handle script / style tag attributes (context or lang for example)
        // - name=".." of <slot> tag is already handled in Element
        return;
    }
    if (attr.name === 'slot' &&
        attributeValueIsOfType(attr.value, 'Text') &&
        element.parent instanceof InlineComponent) {
        // - slot=".." in context of slots with let:xx is handled differently
        element.addSlotName([[attr.value[0].start, attr.value[0].end]]);
        return;
    }
    const addAttribute = element instanceof Element
        ? (name, value) => {
            if (attr.name.startsWith('data-') && !attr.name.startsWith('data-sveltekit-')) {
                // any attribute prefixed with data- is valid, but we can't
                // type that statically, so we need this workaround
                name.unshift('...__sveltets_2_empty({');
                if (!value) {
                    value = ['__sveltets_2_any()'];
                }
                value.push('})');
            }
            element.addAttribute(name, value);
        }
        : (name, value) => {
            if (attr.name.startsWith('--')) {
                // CSS custom properties are not part of the props
                // definition, so wrap them to not get "--xx is invalid prop" errors
                name.unshift('...__sveltets_2_cssProp({');
                if (!value) {
                    value = ['""'];
                }
                value.push('})');
            }
            element.addProp(name, value);
        };
    /**
     * lowercase the attribute name to make it adhere to our intrinsic elements definition
     */
    const transformAttributeCase = (name) => {
        if (!preserveCase &&
            !svgAttributes.find((x) => x == name) &&
            !(element instanceof Element && element.isCustomElement()) &&
            !(svelte5Plus && name.startsWith('on'))) {
            return name.toLowerCase();
        }
        else {
            return name;
        }
    };
    // Handle attribute name
    const attributeName = [];
    if (attributeValueIsOfType(attr.value, 'AttributeShorthand')) {
        // For the attribute shorthand, the name will be the mapped part
        let [start, end] = [attr.value[0].start, attr.value[0].end];
        if (start === end) {
            // Loose parsing mode, we have an empty attribute value, e.g. {}
            // For proper intellisense we need to make this a non-empty expression.
            start--;
            str.overwrite(start, end, ' ', { contentOnly: true });
        }
        addAttribute([[start, end]]);
        return;
    }
    else {
        let name = element instanceof Element && parent.type === 'Element'
            ? transformAttributeCase(attr.name)
            : attr.name;
        // surround with quotes because dashes or other invalid property characters could be part of the name
        // Overwrite first char with "+char because TS will squiggle the whole "prop" including quotes when something is wrong
        if (name !== attr.name) {
            name = '"' + name;
            str.overwrite(attr.start, attr.start + attr.name.length, name);
        }
        else {
            str.overwrite(attr.start, attr.start + 1, '"' + str.original.charAt(attr.start), {
                contentOnly: true
            });
        }
        attributeName.push([attr.start, attr.start + attr.name.length], '"');
    }
    // Handle attribute value
    const attributeValue = [];
    if (attr.value === true) {
        attributeValue.push(attr.name === 'popover' ? '""' : 'true');
        addAttribute(attributeName, attributeValue);
        return;
    }
    if (attr.value.length == 0) {
        // shouldn't happen
        addAttribute(attributeName, ['""']);
        return;
    }
    //handle single value
    if (attr.value.length == 1) {
        const attrVal = attr.value[0];
        if (attrVal.type == 'Text') {
            // Handle the attr="" special case with a transformation that allows mapping of the position
            if (attrVal.start === attrVal.end) {
                addAttribute(attributeName, [[attrVal.start - 1, attrVal.end + 1]]);
                return;
            }
            const lastCharIndex = attrVal.end - 1;
            const hasBrackets = str.original[lastCharIndex] === '}' ||
                ((str.original[lastCharIndex] === '"' || str.original[lastCharIndex] === "'") &&
                    str.original[lastCharIndex - 1] === '}');
            const needsNumberConversion = !hasBrackets &&
                parent.type === 'Element' &&
                numberOnlyAttributes.has(attr.name.toLowerCase()) &&
                !isNaN(attrVal.data);
            const includesTemplateLiteralQuote = attrVal.data.includes('`');
            const quote = !includesTemplateLiteralQuote
                ? '`'
                : ['"', "'"].includes(str.original[attrVal.start - 1])
                    ? str.original[attrVal.start - 1]
                    : '"';
            if (!needsNumberConversion) {
                attributeValue.push(quote);
            }
            if (includesTemplateLiteralQuote && attrVal.data.split('\n').length > 1) {
                // Multiline attribute value text which can't be wrapped in a template literal
                // -> ensure it's still a valid transformation by transforming the actual line break
                str.overwrite(attrVal.start, attrVal.end, attrVal.data.split('\n').join('\\n'), {
                    contentOnly: true
                });
            }
            attributeValue.push([attrVal.start, attrVal.end]);
            if (!needsNumberConversion) {
                attributeValue.push(quote);
            }
            addAttribute(attributeName, attributeValue);
        }
        else if (attrVal.type == 'MustacheTag') {
            let [start, end] = rangeWithTrailingPropertyAccess(str.original, attrVal.expression);
            if (start === end) {
                // Loose parsing mode, we have an empty attribute value, e.g. attr={}
                // For proper intellisense we need to make this a non-empty expression.
                start--;
                str.overwrite(start, end, ' ', { contentOnly: true });
            }
            attributeValue.push([start, end]);
            addAttribute(attributeName, attributeValue);
        }
        return;
    }
    // We have multiple attribute values, so we build a template string out of them.
    for (const n of attr.value) {
        if (n.type === 'MustacheTag') {
            str.appendRight(n.start, '$');
        }
    }
    attributeValue.push('`', [attr.value[0].start, attr.value[attr.value.length - 1].end], '`');
    addAttribute(attributeName, attributeValue);
}
function attributeValueIsOfType(value, type) {
    return value !== true && value.length == 1 && value[0].type == type;
}

/**
 * This needs to be called on the way out, not on the way on, when walking,
 * because else the order of moves might get messed up with moves in
 * the children.
 *
 * The await block consists of these blocks:
 *- expression: the promise - has start and end
 *- value: the result of the promise - has start and end
 *- error: the error branch value - has start and end
 *- pending: start/end of the pending block (if exists), with skip boolean
 *- then: start/end of the then block (if exists), with skip boolean
 *- catch: start/end of the catch block (if exists), with skip boolean
 *
 * Implementation note:
 * As soon there's a `then` with a value, we transform that to
 * `{const $$_value = foo; {const foo = await $$_value;..}}` because
 *
 * - `{#await foo then foo}` or `{#await foo}..{:then foo}..` is valid Svelte code
 * - `{#await foo} {bar} {:then bar} {bar} {/await} is valid Svelte code`
 *
 *  Both would throw "variable used before declaration" if we didn't do the
 * transformation this way.
 */
function handleAwait(str, awaitBlock) {
    var _a, _b;
    const transforms = ['{ '];
    if (!awaitBlock.pending.skip) {
        transforms.push([awaitBlock.pending.start, awaitBlock.pending.end]);
    }
    if (awaitBlock.error || !awaitBlock.catch.skip) {
        transforms.push('try { ');
    }
    if (awaitBlock.value) {
        transforms.push('const $$_value = ');
    }
    const expressionEnd = withTrailingPropertyAccess(str.original, awaitBlock.expression.end);
    transforms.push('await (', [awaitBlock.expression.start, expressionEnd], ');');
    if (awaitBlock.value) {
        transforms.push('{ const ', [awaitBlock.value.start, awaitBlock.value.end], ' = $$_value; ');
    }
    if (!awaitBlock.then.skip) {
        if (awaitBlock.pending.skip) {
            transforms.push([awaitBlock.then.start, awaitBlock.then.end]);
        }
        else if ((_a = awaitBlock.then.children) === null || _a === void 0 ? void 0 : _a.length) {
            transforms.push([
                awaitBlock.then.children[0].start,
                awaitBlock.then.children[awaitBlock.then.children.length - 1].end
            ]);
        }
    }
    if (awaitBlock.value) {
        transforms.push('}');
    }
    if (awaitBlock.error || !awaitBlock.catch.skip) {
        transforms.push('} catch($$_e) { ');
        if (awaitBlock.error) {
            transforms.push('const ', [awaitBlock.error.start, awaitBlock.error.end], ' = __sveltets_2_any();');
        }
        if (!awaitBlock.catch.skip && ((_b = awaitBlock.catch.children) === null || _b === void 0 ? void 0 : _b.length)) {
            transforms.push([
                awaitBlock.catch.children[0].start,
                awaitBlock.catch.children[awaitBlock.catch.children.length - 1].end
            ]);
        }
        transforms.push('}');
    }
    transforms.push('}');
    transform(str, awaitBlock.start, awaitBlock.end, transforms);
}

/**
 * List of binding names that are transformed to sth like `binding = variable`.
 */
const oneWayBindingAttributes = new Set([
    'clientWidth',
    'clientHeight',
    'offsetWidth',
    'offsetHeight',
    'duration',
    'seeking',
    'ended',
    'readyState',
    'naturalWidth',
    'naturalHeight'
]);
/**
 * List of binding names that are transformed to sth like `binding = variable as GeneratedCode`.
 */
const oneWayBindingAttributesNotOnElement = new Map([
    ['contentRect', 'DOMRectReadOnly'],
    ['contentBoxSize', 'ResizeObserverSize[]'],
    ['borderBoxSize', 'ResizeObserverSize[]'],
    ['devicePixelContentBoxSize', 'ResizeObserverSize[]'],
    // available on the element, but with a different type
    ['buffered', "import('svelte/elements').SvelteMediaTimeRange[]"],
    ['played', "import('svelte/elements').SvelteMediaTimeRange[]"],
    ['seekable', "import('svelte/elements').SvelteMediaTimeRange[]"]
]);
const supportsBindThis = [
    'InlineComponent',
    'Element',
    'Body',
    'Slot' // only valid for Web Components compile target
];
/**
 * Transform bind:xxx into something that conforms to JS/TS
 */
function handleBinding(str, attr, parent, element, preserveBind, isSvelte5Plus) {
    const isGetSetBinding = attr.expression.type === 'SequenceExpression';
    const [get, set] = isGetSetBinding ? attr.expression.expressions : [];
    // bind this
    if (attr.name === 'this' && supportsBindThis.includes(parent.type)) {
        // bind:this is effectively only works bottom up - the variable is updated by the element, not
        // the other way round. So we check if the instance is assignable to the variable.
        // Note: If the component unmounts (it's inside an if block, or svelte:component this={null},
        // the value becomes null, but we don't add it to the clause because it would introduce
        // worse DX for the 99% use case, and because null !== undefined which others might use to type the declaration.
        if (isGetSetBinding) {
            element.appendToStartEnd(['(', [set.start, getEnd(set)], `)(${element.name});`]);
        }
        else {
            appendOneWayBinding(attr, ` = ${element.name}`, element);
        }
        return;
    }
    if (!isGetSetBinding) {
        // bind group on input
        if (element instanceof Element && attr.name == 'group' && parent.name == 'input') {
            // add reassignment to force TS to widen the type of the declaration (in case it's never reassigned anywhere else)
            appendOneWayBinding(attr, ' = __sveltets_2_any(null)', element);
            return;
        }
        // one way binding
        if (oneWayBindingAttributes.has(attr.name) && element instanceof Element) {
            appendOneWayBinding(attr, `= ${element.name}.${attr.name}`, element);
            return;
        }
        // one way binding whose property is not on the element
        if (oneWayBindingAttributesNotOnElement.has(attr.name) && element instanceof Element) {
            element.appendToStartEnd([
                [attr.expression.start, getEnd(attr.expression)],
                `= ${surroundWithIgnoreComments(`null as ${oneWayBindingAttributesNotOnElement.get(attr.name)}`)};`
            ]);
            return;
        }
        // add reassignment to force TS to widen the type of the declaration (in case it's never reassigned anywhere else)
        const expressionStr = str.original.substring(attr.expression.start, getEnd(attr.expression));
        element.appendToStartEnd([
            surroundWithIgnoreComments(`() => ${expressionStr} = __sveltets_2_any(null);`)
        ]);
    }
    // other bindings which are transformed to normal attributes/props
    const isShorthand = attr.expression.start === attr.start + 'bind:'.length;
    const name = preserveBind && element instanceof Element
        ? // HTML typings - preserve the bind: prefix
            isShorthand
                ? [`"${str.original.substring(attr.start, attr.end)}"`]
                : ['"', [attr.start, str.original.lastIndexOf('=', attr.expression.start)], '"']
        : // Other typings - remove the bind: prefix
            isShorthand
                ? [[attr.expression.start, attr.expression.end]]
                : [
                    [
                        attr.start + 'bind:'.length,
                        str.original.lastIndexOf('=', attr.expression.start)
                    ]
                ];
    const value = isShorthand
        ? preserveBind && element instanceof Element
            ? [rangeWithTrailingPropertyAccess(str.original, attr.expression)]
            : undefined
        : isGetSetBinding
            ? [
                '__sveltets_2_get_set_binding(',
                [get.start, get.end],
                ',',
                rangeWithTrailingPropertyAccess(str.original, set),
                ')'
            ]
            : [rangeWithTrailingPropertyAccess(str.original, attr.expression)];
    if (isSvelte5Plus && element instanceof InlineComponent) {
        // To check if property is actually bindable
        element.appendToStartEnd([`${element.name}.$$bindings = '${attr.name}';`]);
    }
    if (element instanceof Element) {
        element.addAttribute(name, value);
    }
    else {
        element.addProp(name, value);
    }
}
function appendOneWayBinding(attr, assignment, element) {
    const expression = attr.expression;
    const end = getEnd(expression);
    const hasTypeAnnotation = expression.typeAnnotation || isTypescriptNode(expression);
    const array = [
        [expression.start, end],
        assignment + (hasTypeAnnotation ? '' : ';')
    ];
    if (hasTypeAnnotation) {
        array.push([end, expression.end], ';');
    }
    element.appendToStartEnd(array);
}

/**
 * class:xx={yyy}   --->   yyy;
 */
function handleClassDirective(str, attr, element) {
    element.appendToStartEnd([rangeWithTrailingPropertyAccess(str.original, attr.expression), ';']);
}

/**
 * Removes comment altogether as it's unimportant for the output
 */
function handleComment(str, node) {
    str.overwrite(node.start, node.end, '', { contentOnly: true });
}

/**
 * `{@const x = y}` --> `const x = y;`
 *
 * The transformation happens directly in-place. This is more strict than the
 * Svelte compiler because the compiler moves all const declarations to the top.
 * This transformation results in `x used before being defined` errors if someone
 * uses a const variable before declaring it, which arguably is more helpful
 * than what the Svelte compiler does.
 */
function handleConstTag(str, constTag) {
    str.overwrite(constTag.start, constTag.expression.start, 'const ');
    str.overwrite(withTrailingPropertyAccess(str.original, constTag.expression.end), constTag.end, ';');
}

/**
 * {@debug a}		--->   ;a;
 * {@debug a, b}	--->   ;a;b;
 */
function handleDebug(str, debugBlock) {
    let cursor = debugBlock.start;
    for (const identifier of debugBlock.identifiers) {
        str.overwrite(cursor, identifier.start, ';', { contentOnly: true });
        cursor = identifier.end;
    }
    str.overwrite(cursor, debugBlock.end, ';', { contentOnly: true });
}

/**
 * Transform #each into a for-of loop
 *
 * Implementation notes:
 * - If code is
 *   `{#each items as items,i (key)}`
 *   then the transformation is
 *   `{ const $$_each = __sveltets_2_ensureArray(items); for (const items of $$_each) { let i = 0;key;`.
 *   Transform it this way because `{#each items as items}` is valid Svelte code, but the transformation
 *   `for(const items of items){..}` is invalid ("variable used before declaration"). Don't do the transformation
 *   like this everytime because `$$_each` could turn up in the auto completion.
 *
 * - The `ensureArray` method checks that only `ArrayLike` objects are passed to `#each`.
 *   `for (const ..)` wouldn't error in this case because it accepts any kind of iterable.
 *
 * - `{#each true, items as item}` is valid, we need to add braces around that expression, else
 *   `ensureArray` will error that there are more args than expected
 */
function handleEach(str, eachBlock) {
    var _a, _b, _c;
    const startEnd = str.original.indexOf('}', ((_a = eachBlock.key) === null || _a === void 0 ? void 0 : _a.end) || ((_b = eachBlock.context) === null || _b === void 0 ? void 0 : _b.end) || eachBlock.expression.end) + 1;
    let transforms;
    // {#each true, [1,2]} is valid but for (const x of true, [1,2]) is not if not wrapped with braces
    const containsComma = str.original
        .substring(eachBlock.expression.start, eachBlock.expression.end)
        .includes(',');
    const expressionEnd = getEnd(eachBlock.expression);
    const contextEnd = eachBlock.context && getEnd(eachBlock.context);
    const arrayAndItemVarTheSame = !!eachBlock.context &&
        str.original.substring(eachBlock.expression.start, expressionEnd) ===
            str.original.substring(eachBlock.context.start, contextEnd);
    if (arrayAndItemVarTheSame) {
        transforms = [
            `{ const $$_each = __sveltets_2_ensureArray(${containsComma ? '(' : ''}`,
            [eachBlock.expression.start, eachBlock.expression.end],
            `${containsComma ? ')' : ''}); for(let `,
            [eachBlock.context.start, contextEnd],
            ' of $$_each){'
        ];
    }
    else {
        transforms = [
            'for(let ',
            eachBlock.context ? [eachBlock.context.start, contextEnd] : '$$each_item',
            ` of __sveltets_2_ensureArray(${containsComma ? '(' : ''}`,
            [eachBlock.expression.start, eachBlock.expression.end],
            `${containsComma ? ')' : ''})){${eachBlock.context ? '' : '$$each_item;'}`
        ];
    }
    if (eachBlock.index) {
        const indexStart = str.original.indexOf(eachBlock.index, ((_c = eachBlock.context) === null || _c === void 0 ? void 0 : _c.end) || eachBlock.expression.end);
        const indexEnd = indexStart + eachBlock.index.length;
        transforms.push('let ', [indexStart, indexEnd], ' = 1;');
    }
    if (eachBlock.key) {
        transforms.push([eachBlock.key.start, eachBlock.key.end], ';');
    }
    transform(str, eachBlock.start, startEnd, transforms);
    const endEach = str.original.lastIndexOf('{', eachBlock.end - 1);
    // {/each} -> } or {:else} -> }
    if (eachBlock.else) {
        const elseEnd = str.original.lastIndexOf('}', eachBlock.else.start);
        const elseStart = str.original.lastIndexOf('{', elseEnd);
        str.overwrite(elseStart, elseEnd + 1, '}' + (arrayAndItemVarTheSame ? '}' : ''), {
            contentOnly: true
        });
        if (!isImplicitlyClosedBlock(endEach, eachBlock)) {
            str.remove(endEach, eachBlock.end);
        }
    }
    else {
        const closing = '}' + (arrayAndItemVarTheSame ? '}' : '');
        if (isImplicitlyClosedBlock(endEach, eachBlock)) {
            str.prependLeft(eachBlock.end, closing);
        }
        else {
            str.overwrite(endEach, eachBlock.end, closing, {
                contentOnly: true
            });
        }
    }
}

/**
 * Transform on:xxx={yyy}
 * - For DOM elements: ---> onxxx: yyy,
 * - For Svelte components/special elements: ---> componentInstance.$on("xxx", yyy)}
 */
function handleEventHandler(str, attr, element) {
    const nameStart = str.original.indexOf(':', attr.start) + 1;
    // If there's no expression, it's event bubbling (on:click)
    const nameEnd = nameStart + attr.name.length;
    if (element instanceof Element) {
        // Prefix with "on:" for better mapping.
        // Surround with quotes because event name could contain invalid prop chars.
        surroundWith(str, [nameStart, nameEnd], '"on:', '"');
        element.addAttribute([[nameStart, nameEnd]], attr.expression
            ? [rangeWithTrailingPropertyAccess(str.original, attr.expression)]
            : ['undefined']);
    }
    else {
        element.addEvent([nameStart, nameEnd], attr.expression
            ? rangeWithTrailingPropertyAccess(str.original, attr.expression)
            : undefined);
    }
}

/**
 * Transforms #if and :else if to a regular if control block.
 */
function handleIf(str, ifBlock) {
    if (ifBlock.elseif) {
        // {:else if expr}  -->  } else if(expr) {
        const start = str.original.lastIndexOf('{', ifBlock.expression.start);
        str.overwrite(start, ifBlock.expression.start, '} else if (');
    }
    else {
        // {#if expr}  -->  if (expr){
        str.overwrite(ifBlock.start, ifBlock.expression.start, 'if(');
    }
    const expressionEnd = withTrailingPropertyAccess(str.original, ifBlock.expression.end);
    const end = str.original.indexOf('}', expressionEnd);
    str.overwrite(expressionEnd, end + 1, '){');
    const endif = str.original.lastIndexOf('{', ifBlock.end - 1);
    if (isImplicitlyClosedBlock(endif, ifBlock)) {
        str.prependLeft(ifBlock.end, '}');
    }
    else {
        // {/if} -> }
        str.overwrite(endif, ifBlock.end, '}');
    }
}
/**
 * {:else}   --->   } else {
 */
function handleElse(str, elseBlock, parent) {
    if (parent.type !== 'IfBlock') {
        // This is the else branch of an #each block which is handled elsewhere
        return;
    }
    const elseEnd = str.original.lastIndexOf('}', elseBlock.start);
    const elseword = str.original.lastIndexOf(':else', elseEnd);
    const elseStart = str.original.lastIndexOf('{', elseword);
    str.overwrite(elseStart, elseStart + 1, '}');
    str.overwrite(elseEnd, elseEnd + 1, '{');
    const colon = str.original.indexOf(':', elseword);
    str.remove(colon, colon + 1);
}

/**
 * {#key expr}content{/key}   --->   expr; {content}
 */
function handleKey(str, keyBlock) {
    // {#key expr}   ->   expr;{
    str.overwrite(keyBlock.start, keyBlock.expression.start, '', { contentOnly: true });
    const expressionEnd = withTrailingPropertyAccess(str.original, keyBlock.expression.end);
    const end = str.original.indexOf('}', expressionEnd);
    str.overwrite(expressionEnd, end + 1, '; {');
    // {/key}   -> }
    const endKey = str.original.lastIndexOf('{', keyBlock.end - 1);
    if (!isImplicitlyClosedBlock(endKey, keyBlock)) {
        str.overwrite(endKey, keyBlock.end, '}', { contentOnly: true });
    }
}

/**
 * `let:foo={bar}`  -->  `foo:bar`, which becomes `const {foo:bar} = $$_parent.$$slotDef['slotName'];`
 * @param node
 * @param element
 */
function handleLet(str, node, parent, preserveCase, svelte5Plus, element) {
    if (element instanceof InlineComponent) {
        // let:xx belongs to either the default slot or a named slot,
        // which is determined in Attribute.ts
        addSlotLet(node, element);
    }
    else {
        if (element.parent instanceof InlineComponent) {
            // let:xx is on a HTML element and belongs to a (named slot of a parent component
            addSlotLet(node, element);
        }
        else {
            // let:xx is a regular HTML attribute (probably a mistake by the user)
            handleAttribute(str, {
                start: node.start,
                end: node.end,
                type: 'Attribute',
                name: 'let:' + node.name,
                value: node.expression
                    ? [
                        {
                            type: 'MustacheTag',
                            start: node.expression.start,
                            end: node.expression.end,
                            expression: node.expression
                        }
                    ]
                    : true
            }, parent, preserveCase, svelte5Plus, element);
        }
    }
}
function addSlotLet(node, element) {
    const letTransformation = [
        [node.start + 'let:'.length, node.start + 'let:'.length + node.name.length]
    ];
    if (node.expression) {
        letTransformation.push(':', [node.expression.start, node.expression.end]);
    }
    element.addSlotLet(letTransformation);
}

/**
 * Handle mustache tags that are not part of attributes
 * {a}  -->  a;
 */
function handleMustacheTag(str, node, parent) {
    if (parent.type === 'Attribute' || parent.type === 'StyleDirective') {
        // handled inside Attribute.ts / StyleDirective.ts
        return;
    }
    const text = str.original.slice(node.start + 1, node.end - 1);
    if (text.trimStart().startsWith('{')) {
        // possibly an object literal, wrapping it in parentheses so it's treated as an expression
        str.overwrite(node.start, node.start + 1, ';(', { contentOnly: true });
        str.overwrite(node.end - 1, node.end, ');', { contentOnly: true });
        return;
    }
    str.overwrite(node.start, node.start + 1, '', { contentOnly: true });
    str.overwrite(node.end - 1, node.end, ';', { contentOnly: true });
}

/**
 * {@html ...}   --->   ...;
 */
function handleRawHtml(str, node) {
    str.overwrite(node.start, node.expression.start, ' ');
    str.overwrite(withTrailingPropertyAccess(str.original, node.expression.end), node.end, ';');
}

/**
 * Handle spreaded attributes/props on elements/components by removing the braces.
 * That way they can be added as a regular object spread.
 * `{...xx}` -> `...x`
 */
function handleSpread(node, element) {
    const transformation = [[node.start + 1, node.end - 1]];
    if (element instanceof Element) {
        element.addAttribute(transformation);
    }
    else {
        element.addProp(transformation);
    }
}

/**
 * style:xx         --->  __sveltets_2_ensureType(String, Number, xx);
 * style:xx={yy}    --->  __sveltets_2_ensureType(String, Number, yy);
 * style:xx="yy"    --->  __sveltets_2_ensureType(String, Number, "yy");
 * style:xx="a{b}"  --->  __sveltets_2_ensureType(String, Number, `a${b}`);
 */
function handleStyleDirective(str, style, element) {
    const htmlx = str.original;
    const ensureType = '__sveltets_2_ensureType(String, Number, ';
    if (style.value === true || style.value.length === 0) {
        element.appendToStartEnd([
            ensureType,
            [htmlx.indexOf(':', style.start) + 1, style.end],
            ');'
        ]);
        return;
    }
    if (style.value.length > 1) {
        // We have multiple attribute values, so we build a template string out of them.
        for (const n of style.value) {
            if (n.type === 'MustacheTag') {
                str.appendRight(n.start, '$');
            }
        }
        element.appendToStartEnd([
            ensureType + '`',
            [style.value[0].start, style.value[style.value.length - 1].end],
            '`);'
        ]);
        return;
    }
    const styleVal = style.value[0];
    if (styleVal.type === 'Text') {
        const quote = ['"', "'"].includes(str.original[styleVal.start - 1])
            ? str.original[styleVal.start - 1]
            : '"';
        element.appendToStartEnd([
            `${ensureType}${quote}`,
            [styleVal.start, styleVal.end],
            `${quote});`
        ]);
    }
    else {
        // MustacheTag
        element.appendToStartEnd([ensureType, [styleVal.start + 1, styleVal.end - 1], ');']);
    }
}

/**
 * Handles a text node transformation.
 * Removes everything except whitespace (for better visual output) when it's normal HTML text for example inside an element
 * to not clutter up the output. For attributes it leaves the text as is.
 */
function handleText(str, node, parent) {
    if (!node.data || parent.type === 'Attribute') {
        return;
    }
    let replacement = node.data.replace(/\S/g, '');
    if (!replacement && node.data.length) {
        // minimum of 1 whitespace which ensure hover or other things don't give weird results
        // where for example you hover over a text and get a hover info about the containing tag.
        replacement = ' ';
    }
    str.overwrite(node.start, node.end, replacement, {
        contentOnly: true
    });
}

/**
 * transition|modifier:xxx(yyy)   --->   __sveltets_2_ensureTransition(xxx(svelte.mapElementTag('..'),(yyy)));
 */
function handleTransitionDirective(str, attr, element) {
    const transformations = [
        '__sveltets_2_ensureTransition(',
        getDirectiveNameStartEndIdx(str, attr),
        `(${element.typingsNamespace}.mapElementTag('${element.tagName}')`
    ];
    if (attr.expression) {
        transformations.push(',(', rangeWithTrailingPropertyAccess(str.original, attr.expression), ')');
    }
    transformations.push('));');
    element.appendToStartEnd(transformations);
}

/**
 * Transform #snippet into a function
 *
 * ```html
 * {#snippet foo(bar)}
 * ..
 * {/snippet}
 * ```
 * --> if standalone:
 * ```ts
 * const foo = (bar) => { async () => {
 * ..
 * };return return __sveltets_2_any(0)};
 * ```
 * --> if slot prop:
 * ```ts
 * foo: (bar) => {
 * ..
 * }
 * ```
 */
function handleSnippet(str, snippetBlock, component) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const isImplicitProp = component !== undefined;
    const endSnippet = str.original.lastIndexOf('{', snippetBlock.end - 1);
    const afterSnippet = isImplicitProp
        ? `};return __sveltets_2_any(0)}`
        : `};return __sveltets_2_any(0)};`;
    if (isImplicitlyClosedBlock(endSnippet, snippetBlock)) {
        str.prependLeft(snippetBlock.end, afterSnippet);
    }
    else {
        str.overwrite(endSnippet, snippetBlock.end, afterSnippet, {
            contentOnly: true
        });
    }
    const lastParameter = (_a = snippetBlock.parameters) === null || _a === void 0 ? void 0 : _a.at(-1);
    const startEnd = str.original.indexOf('}', (_d = (_c = (_b = lastParameter === null || lastParameter === void 0 ? void 0 : lastParameter.typeAnnotation) === null || _b === void 0 ? void 0 : _b.end) !== null && _c !== void 0 ? _c : lastParameter === null || lastParameter === void 0 ? void 0 : lastParameter.end) !== null && _d !== void 0 ? _d : snippetBlock.expression.end) + 1;
    let parameters;
    if ((_e = snippetBlock.parameters) === null || _e === void 0 ? void 0 : _e.length) {
        const firstParameter = snippetBlock.parameters[0];
        const start = (_h = (_g = (_f = firstParameter === null || firstParameter === void 0 ? void 0 : firstParameter.leadingComments) === null || _f === void 0 ? void 0 : _f[0]) === null || _g === void 0 ? void 0 : _g.start) !== null && _h !== void 0 ? _h : firstParameter.start;
        const end = (_k = (_j = lastParameter.typeAnnotation) === null || _j === void 0 ? void 0 : _j.end) !== null && _k !== void 0 ? _k : lastParameter.end;
        parameters = [start, end];
    }
    // inner async function for potential #await blocks
    const afterParameters = ` => { async ()${IGNORE_POSITION_COMMENT} => {`;
    if (isImplicitProp) {
        /** Can happen in loose parsing mode, e.g. code is currently `{#snippet }` */
        const emptyId = snippetBlock.expression.start === snippetBlock.expression.end;
        if (emptyId) {
            // Give intellisense a way to map into the right position for implicit prop completion
            str.overwrite(snippetBlock.start, snippetBlock.expression.start - 1, '', {
                contentOnly: true
            });
            str.overwrite(snippetBlock.expression.start - 1, snippetBlock.expression.start, ' ', {
                contentOnly: true
            });
        }
        else {
            str.overwrite(snippetBlock.start, snippetBlock.expression.start, '', {
                contentOnly: true
            });
        }
        const transforms = ['('];
        if (parameters) {
            transforms.push(parameters);
            const [start, end] = parameters;
            str.overwrite(snippetBlock.expression.end, start, '', {
                contentOnly: true
            });
            str.overwrite(end, startEnd, '', { contentOnly: true });
        }
        else {
            str.overwrite(snippetBlock.expression.end, startEnd, '', { contentOnly: true });
        }
        transforms.push(')' + afterParameters);
        transforms.push([startEnd, snippetBlock.end]);
        if (component instanceof InlineComponent) {
            component.addImplicitSnippetProp([snippetBlock.expression.start - (emptyId ? 1 : 0), snippetBlock.expression.end], transforms);
        }
        else {
            component.addAttribute([[snippetBlock.expression.start - (emptyId ? 1 : 0), snippetBlock.expression.end]], transforms);
        }
    }
    else {
        const transforms = [
            'const ',
            [snippetBlock.expression.start, snippetBlock.expression.end],
            IGNORE_POSITION_COMMENT,
            ` = ${snippetBlock.typeParams ? `<${snippetBlock.typeParams}>` : ''}(`
        ];
        if (parameters) {
            transforms.push(parameters);
        }
        transforms.push(')', surroundWithIgnoreComments(`: ReturnType<import('svelte').Snippet>`), // shows up nicely preserved on hover, other alternatives don't
        afterParameters);
        transform(str, snippetBlock.start, startEnd, transforms);
    }
}
function handleImplicitChildren(componentNode, component) {
    var _a;
    if (((_a = componentNode.children) === null || _a === void 0 ? void 0 : _a.length) === 0) {
        return;
    }
    let hasSlot = false;
    for (const child of componentNode.children) {
        if (child.type === 'SvelteSelf' ||
            child.type === 'InlineComponent' ||
            child.type === 'Element' ||
            child.type === 'SlotTemplate') {
            if (child.attributes.some((a) => {
                var _a;
                return a.type === 'Attribute' &&
                    a.name === 'slot' &&
                    ((_a = a.value[0]) === null || _a === void 0 ? void 0 : _a.data) !== 'default';
            })) {
                continue;
            }
        }
        if (child.type === 'Comment' ||
            child.type === 'Slot' ||
            (child.type === 'Text' && child.data.trim() === '')) {
            continue;
        }
        if (child.type !== 'SnippetBlock') {
            hasSlot = true;
            break;
        }
    }
    if (!hasSlot) {
        return;
    }
    // it's enough to fake a children prop, we don't need to actually move the content inside (which would also reset control flow)
    component.addProp(['children'], ['() => { return __sveltets_2_any(0); }']);
}
function hoistSnippetBlock(str, blockOrEl) {
    var _a;
    if (blockOrEl.type === 'InlineComponent' || blockOrEl.type === 'SvelteBoundary') {
        // implicit props, handled in InlineComponent
        return;
    }
    let targetPosition;
    for (const node of (_a = blockOrEl.children) !== null && _a !== void 0 ? _a : []) {
        if (node.type !== 'SnippetBlock') {
            if (targetPosition === undefined && (node.type !== 'Text' || node.data.trim() !== '')) {
                targetPosition = node.type === 'Text' ? node.end : node.start;
            }
            continue;
        }
        // already first
        if (targetPosition === undefined) {
            continue;
        }
        if (node.start === targetPosition) {
            continue;
        }
        str.move(node.start, node.end, targetPosition);
    }
}

/**
 * `{@render foo(x)}` --> `;foo(x);`
 */
function handleRenderTag(str, renderTag) {
    str.overwrite(renderTag.start, renderTag.expression.start, ';__sveltets_2_ensureSnippet(', {
        contentOnly: true
    });
    str.overwrite(withTrailingPropertyAccess(str.original, renderTag.expression.end), renderTag.end, ');');
}

/**
 * Add this tag to a HTML comment in a Svelte component and its contents will
 * be added as a docstring in the resulting JSX for the component class.
 */
const COMPONENT_DOCUMENTATION_HTML_COMMENT_TAG = '@component';
class ComponentDocumentation {
    constructor() {
        this.componentDocumentation = '';
        this.handleComment = (node) => {
            if ('data' in node &&
                typeof node.data === 'string' &&
                node.data.includes(COMPONENT_DOCUMENTATION_HTML_COMMENT_TAG)) {
                this.componentDocumentation = node.data
                    .replace(COMPONENT_DOCUMENTATION_HTML_COMMENT_TAG, '')
                    .trim();
            }
        };
    }
    getFormatted() {
        if (!this.componentDocumentation) {
            return '';
        }
        if (!this.componentDocumentation.includes('\n')) {
            return `/** ${this.componentDocumentation} */\n`;
        }
        const lines = dedent(this.componentDocumentation)
            .split('\n')
            .map((line) => ` *${line ? ` ${line}` : ''}`)
            .join('\n');
        return `/**\n${lines}\n */\n`;
    }
}

let Scope$1 = class Scope {
    constructor(parent) {
        this.declared = new Set();
        this.parent = parent;
    }
    hasDefined(name) {
        return this.declared.has(name) || (!!this.parent && this.parent.hasDefined(name));
    }
};
class ScopeStack {
    constructor() {
        this.current = new Scope$1();
    }
    push() {
        this.current = new Scope$1(this.current);
    }
    pop() {
        this.current = this.current.parent;
    }
}

function isMember$1(parent, prop) {
    return parent.type == 'MemberExpression' && prop == 'property';
}
function isObjectKey(parent, prop) {
    return parent.type == 'Property' && prop == 'key';
}
function isObjectValue(parent, prop) {
    return parent.type == 'Property' && prop == 'value';
}
function isObjectValueShortHand(property) {
    const { value, key } = property;
    return value && isIdentifier(value) && key.start === value.start && key.end == value.end;
}
function attributeValueIsString(attr) {
    var _a;
    return attr.value.length !== 1 || ((_a = attr.value[0]) === null || _a === void 0 ? void 0 : _a.type) === 'Text';
}
function isDestructuringPatterns(node) {
    return node.type === 'ArrayPattern' || node.type === 'ObjectPattern';
}
function isIdentifier(node) {
    return node.type === 'Identifier';
}
function getSlotName(child) {
    var _a, _b;
    const slot = (_a = child.attributes) === null || _a === void 0 ? void 0 : _a.find((a) => a.name == 'slot');
    return (_b = slot === null || slot === void 0 ? void 0 : slot.value) === null || _b === void 0 ? void 0 : _b[0].raw;
}

const reservedNames = new Set(['$$props', '$$restProps', '$$slots']);
class Stores {
    constructor(scope, isDeclaration) {
        this.scope = scope;
        this.isDeclaration = isDeclaration;
        this.possibleStores = [];
    }
    handleDirective(node, str) {
        if (this.notAStore(node.name) || this.isDeclaration.value) {
            return;
        }
        const start = str.original.indexOf('$', node.start);
        const end = start + node.name.length;
        this.possibleStores.push({
            node: { type: 'Identifier', start, end, name: node.name },
            parent: { start: 0, end: 0, type: '' },
            scope: this.scope.current
        });
    }
    handleIdentifier(node, parent, prop) {
        if (this.notAStore(node.name)) {
            return;
        }
        //handle potential store
        if (this.isDeclaration.value) {
            if (isObjectKey(parent, prop)) {
                return;
            }
            this.scope.current.declared.add(node.name);
        }
        else {
            if (isMember$1(parent, prop) && !parent.computed) {
                return;
            }
            if (isObjectKey(parent, prop)) {
                return;
            }
            this.possibleStores.push({ node, parent, scope: this.scope.current });
        }
    }
    getStoreNames() {
        const stores = this.possibleStores.filter(({ node, scope }) => {
            const name = node.name;
            // if variable starting with '$' was manually declared by the user,
            // this isn't a store access.
            return !scope.hasDefined(name);
        });
        return stores.map(({ node }) => node.name.slice(1));
    }
    notAStore(name) {
        return name[0] !== '$' || reservedNames.has(name);
    }
}

class Scripts {
    constructor(htmlxAst) {
        this.htmlxAst = htmlxAst;
        // All script tags, no matter at what level, are listed within the root children, because
        // of the logic in htmlxparser.ts
        // To get the top level scripts, filter out all those that are part of children's children.
        // Those have another type ('Element' with name 'script').
        this.scriptTags = this.htmlxAst.children.filter((child) => child.type === 'Script');
        this.topLevelScripts = this.scriptTags;
    }
    checkIfElementIsScriptTag(node, parent) {
        if (parent !== this.htmlxAst && node.name === 'script') {
            this.topLevelScripts = this.topLevelScripts.filter((tag) => tag.start !== node.start || tag.end !== node.end);
        }
    }
    checkIfContainsScriptTag(node) {
        this.topLevelScripts = this.topLevelScripts.filter((tag) => !(node.start <= tag.start && node.end >= tag.end));
    }
    getTopLevelScriptTags() {
        let scriptTag = null;
        let moduleScriptTag = null;
        // should be 2 at most, one each, so using forEach is safe
        this.topLevelScripts.forEach((tag) => {
            if (tag.attributes &&
                tag.attributes.find((a) => (a.name == 'context' &&
                    a.value.length == 1 &&
                    a.value[0].raw == 'module') ||
                    a.name === 'module')) {
                moduleScriptTag = tag;
            }
            else {
                scriptTag = tag;
            }
        });
        return { scriptTag, moduleScriptTag };
    }
    blankOtherScriptTags(str) {
        this.scriptTags
            .filter((tag) => !this.topLevelScripts.includes(tag))
            .forEach((tag) => {
            str.remove(tag.start, tag.end);
        });
    }
}

function isInterfaceOrTypeDeclaration(node) {
    return ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node);
}
function findExportKeyword(node) {
    var _a;
    return ts.canHaveModifiers(node)
        ? (_a = ts.getModifiers(node)) === null || _a === void 0 ? void 0 : _a.find((x) => x.kind == ts.SyntaxKind.ExportKeyword)
        : undefined;
}
/**
 * Node is like `bla = ...` or `{bla} = ...` or `[bla] = ...`
 */
function isAssignmentBinaryExpr(node) {
    return (ts.isBinaryExpression(node) &&
        node.operatorToken.kind == ts.SyntaxKind.EqualsToken &&
        (ts.isIdentifier(node.left) ||
            ts.isObjectLiteralExpression(node.left) ||
            ts.isArrayLiteralExpression(node.left)));
}
/**
 * Returns if node is like `$: bla = ...` or `$: ({bla} = ...)` or `$: [bla] = ...=`
 */
function getBinaryAssignmentExpr(node) {
    if (ts.isExpressionStatement(node.statement)) {
        if (isAssignmentBinaryExpr(node.statement.expression)) {
            return node.statement.expression;
        }
        if (ts.isParenthesizedExpression(node.statement.expression) &&
            isAssignmentBinaryExpr(node.statement.expression.expression)) {
            return node.statement.expression.expression;
        }
    }
}
/**
 * Returns true if node is like `({bla} ..)` or `([bla] ...)`
 */
function isParenthesizedObjectOrArrayLiteralExpression(node) {
    return (ts.isParenthesizedExpression(node) &&
        ts.isBinaryExpression(node.expression) &&
        (ts.isObjectLiteralExpression(node.expression.left) ||
            ts.isArrayLiteralExpression(node.expression.left)));
}
/**
 *
 * Adapted from https://github.com/Rich-Harris/periscopic/blob/d7a820b04e1f88b452313ab3e54771b352f0defb/src/index.ts#L150
 */
function extractIdentifiers(node, identifiers = []) {
    if (ts.isIdentifier(node)) {
        identifiers.push(node);
    }
    else if (ts.isBindingElement(node)) {
        extractIdentifiers(node.name, identifiers);
    }
    else if (isMember(node)) {
        let object = node;
        while (isMember(object)) {
            object = object.expression;
        }
        if (ts.isIdentifier(object)) {
            identifiers.push(object);
        }
    }
    else if (ts.isArrayBindingPattern(node) || ts.isObjectBindingPattern(node)) {
        node.elements.forEach((element) => {
            extractIdentifiers(element, identifiers);
        });
    }
    else if (ts.isObjectLiteralExpression(node)) {
        node.properties.forEach((child) => {
            if (ts.isSpreadAssignment(child)) {
                extractIdentifiers(child.expression, identifiers);
            }
            else if (ts.isShorthandPropertyAssignment(child)) {
                // in ts Ast { a = 1 } and { a } are both ShorthandPropertyAssignment
                extractIdentifiers(child.name, identifiers);
            }
            else if (ts.isPropertyAssignment(child)) {
                // { a: b }
                extractIdentifiers(child.initializer, identifiers);
            }
        });
    }
    else if (ts.isArrayLiteralExpression(node)) {
        node.elements.forEach((element) => {
            if (ts.isSpreadElement(element)) {
                extractIdentifiers(element, identifiers);
            }
            else {
                extractIdentifiers(element, identifiers);
            }
        });
    }
    else if (ts.isBinaryExpression(node)) {
        extractIdentifiers(node.left, identifiers);
    }
    return identifiers;
}
function isMember(node) {
    return ts.isElementAccessExpression(node) || ts.isPropertyAccessExpression(node);
}
/**
 * Returns variable at given level with given name,
 * if it is a variable declaration in the form of `const/let a = ..`
 */
function getVariableAtTopLevel(node, identifierName) {
    for (const child of node.statements) {
        if (ts.isVariableStatement(child)) {
            const variable = child.declarationList.declarations.find((declaration) => ts.isIdentifier(declaration.name) && declaration.name.text === identifierName);
            if (variable) {
                return variable;
            }
        }
    }
}
/**
 * Get the leading multiline trivia doc of the node.
 */
function getLastLeadingDoc(node) {
    var _a;
    const nodeText = node.getFullText();
    const comments = (_a = ts
        .getLeadingCommentRanges(nodeText, 0)) === null || _a === void 0 ? void 0 : _a.filter((c) => c.kind === ts.SyntaxKind.MultiLineCommentTrivia);
    const comment = comments === null || comments === void 0 ? void 0 : comments[(comments === null || comments === void 0 ? void 0 : comments.length) - 1];
    if (comment) {
        let commentText = nodeText.substring(comment.pos, comment.end);
        const typedefTags = ts.getAllJSDocTagsOfKind(node, ts.SyntaxKind.JSDocTypedefTag);
        typedefTags
            .filter((tag) => tag.pos >= comment.pos)
            .map((tag) => nodeText.substring(tag.pos, tag.end))
            .forEach((comment) => {
            commentText = commentText.replace(comment, '');
        });
        return commentText;
    }
}
/**
 * Returns true if given identifier is not the property name of an aliased import.
 * In other words: It is not `a` in `import {a as b} from ..`
 */
function isNotPropertyNameOfImport(identifier) {
    return (!ts.isImportSpecifier(identifier.parent) || identifier.parent.propertyName !== identifier);
}
/**
 * Extract the variable names that are assigned to out of a labeled statement.
 */
function getNamesFromLabeledStatement(node) {
    var _a;
    const leftHandSide = (_a = getBinaryAssignmentExpr(node)) === null || _a === void 0 ? void 0 : _a.left;
    if (!leftHandSide) {
        return [];
    }
    return (extractIdentifiers(leftHandSide)
        .map((id) => id.text)
        // svelte won't let you create a variable with $ prefix (reserved for stores)
        .filter((name) => !name.startsWith('$')));
}
/**
 * move node to top of script so they appear outside our render function
 */
function moveNode(node, str, astOffset, scriptStart, sourceFile) {
    var _a;
    const scanner = ts.createScanner(sourceFile.languageVersion, 
    /*skipTrivia*/ false, sourceFile.languageVariant);
    const comments = (_a = ts.getLeadingCommentRanges(node.getFullText(), 0)) !== null && _a !== void 0 ? _a : [];
    if (!comments.some((comment) => comment.hasTrailingNewLine) &&
        isNewGroup(sourceFile, node, scanner)) {
        str.appendRight(node.getStart() + astOffset, '\n');
    }
    for (const comment of comments) {
        const commentEnd = node.pos + comment.end + astOffset;
        str.move(node.pos + comment.pos + astOffset, commentEnd, scriptStart + 1);
        if (comment.hasTrailingNewLine) {
            str.overwrite(commentEnd - 1, commentEnd, str.original[commentEnd - 1] + '\n');
        }
    }
    str.move(node.getStart() + astOffset, node.end + astOffset, scriptStart + 1);
    //add in a \n
    const originalEndChar = str.original[node.end + astOffset - 1];
    str.overwrite(node.end + astOffset - 1, node.end + astOffset, originalEndChar + '\n');
}
/**
 * adopted from https://github.com/microsoft/TypeScript/blob/6e0447fdf165b1cec9fc80802abcc15bd23a268f/src/services/organizeImports.ts#L111
 */
function isNewGroup(sourceFile, topLevelImportDecl, scanner) {
    const startPos = topLevelImportDecl.getFullStart();
    const endPos = topLevelImportDecl.getStart();
    scanner.setText(sourceFile.text, startPos, endPos - startPos);
    let numberOfNewLines = 0;
    while (scanner.getTokenPos() < endPos) {
        const tokenKind = scanner.scan();
        if (tokenKind === ts.SyntaxKind.NewLineTrivia) {
            numberOfNewLines++;
            if (numberOfNewLines >= 2) {
                return true;
            }
        }
    }
    return false;
}
function getTopLevelImports(sourceFile) {
    return sourceFile.statements.filter(ts.isImportDeclaration).sort((a, b) => a.end - b.end);
}

/**
 * Get the constructor type of a component node
 * @param node The component node to infer the this type from
 * @param thisValue If node is svelte:component, you may pass the value
 *                  of this={..} to use that instead of the more general componentType
 */
function getTypeForComponent(node) {
    if (node.name === 'svelte:component' || node.name === 'svelte:self') {
        return '__sveltets_1_componentType()';
    }
    else {
        return node.name;
    }
}
function attributeStrValueAsJsExpression(attr) {
    if (attr.value.length == 0) {
        return "''"; //wut?
    }
    //handle single value
    if (attr.value.length == 1) {
        const attrVal = attr.value[0];
        if (attrVal.type == 'Text') {
            return '"' + attrVal.raw + '"';
        }
    }
    // we have multiple attribute values, so we know we are building a string out of them.
    // so return a dummy string, it will typecheck the same :)
    return '"__svelte_ts_string"';
}
function is$$SlotsDeclaration(node) {
    return isInterfaceOrTypeDeclaration(node) && node.name.text === '$$Slots';
}
class SlotHandler {
    constructor(htmlx) {
        this.htmlx = htmlx;
        this.slots = new Map();
        this.resolved = new Map();
        this.resolvedExpression = new Map();
    }
    resolve(identifierDef, initExpression, scope) {
        let resolved = this.resolved.get(identifierDef);
        if (resolved) {
            return resolved;
        }
        resolved = this.getResolveExpressionStr(identifierDef, scope, initExpression);
        if (resolved) {
            this.resolved.set(identifierDef, resolved);
        }
        return resolved;
    }
    /**
     * Returns a string which expresses the given identifier unpacked to
     * the top level in order to express the slot types correctly later on.
     *
     * Example: {#each items as item} ---> __sveltets_2_unwrapArr(items)
     */
    getResolveExpressionStr(identifierDef, scope, initExpression) {
        const { name } = identifierDef;
        const owner = scope.getOwner(name);
        if ((owner === null || owner === void 0 ? void 0 : owner.type) === 'CatchBlock') {
            return '__sveltets_2_any({})';
        }
        // list.map(list => list.someProperty)
        // initExpression's scope should the parent scope of identifier scope
        else if ((owner === null || owner === void 0 ? void 0 : owner.type) === 'ThenBlock') {
            const resolvedExpression = this.resolveExpression(initExpression, scope.parent);
            return `__sveltets_2_unwrapPromiseLike(${resolvedExpression})`;
        }
        else if ((owner === null || owner === void 0 ? void 0 : owner.type) === 'EachBlock') {
            const resolvedExpression = this.resolveExpression(initExpression, scope.parent);
            return `__sveltets_2_unwrapArr(${resolvedExpression})`;
        }
        return null;
    }
    resolveDestructuringAssignment(destructuringNode, identifiers, initExpression, scope) {
        const destructuring = this.htmlx.slice(destructuringNode.start, destructuringNode.end);
        identifiers.forEach((identifier) => {
            const resolved = this.getResolveExpressionStr(identifier, scope, initExpression);
            if (resolved) {
                this.resolved.set(identifier, `((${destructuring}) => ${identifier.name})(${resolved})`);
            }
        });
    }
    resolveDestructuringAssignmentForLet(destructuringNode, identifiers, letNode, component, slotName) {
        const destructuring = this.htmlx.slice(destructuringNode.start, destructuringNode.end);
        identifiers.forEach((identifier) => {
            const resolved = this.getResolveExpressionStrForLet(letNode, component, slotName);
            this.resolved.set(identifier, `((${destructuring}) => ${identifier.name})(${resolved})`);
        });
    }
    getResolveExpressionStrForLet(letNode, component, slotName) {
        return `${getSingleSlotDef(component, slotName)}.${letNode.name}`;
    }
    resolveLet(letNode, identifierDef, component, slotName) {
        let resolved = this.resolved.get(identifierDef);
        if (resolved) {
            return resolved;
        }
        resolved = this.getResolveExpressionStrForLet(letNode, component, slotName);
        this.resolved.set(identifierDef, resolved);
        return resolved;
    }
    getSlotConsumerOfComponent(component) {
        var _a;
        let result = (_a = this.getLetNodes(component, 'default')) !== null && _a !== void 0 ? _a : [];
        for (const child of component.children) {
            const slotName = getSlotName(child);
            if (slotName) {
                const letNodes = this.getLetNodes(child, slotName);
                if (letNodes === null || letNodes === void 0 ? void 0 : letNodes.length) {
                    result = result.concat(letNodes);
                }
            }
        }
        return result;
    }
    getLetNodes(child, slotName) {
        var _a;
        const letNodes = ((_a = child === null || child === void 0 ? void 0 : child.attributes) !== null && _a !== void 0 ? _a : []).filter((attr) => attr.type === 'Let');
        return letNodes === null || letNodes === void 0 ? void 0 : letNodes.map((letNode) => ({
            letNode,
            slotName
        }));
    }
    /**
     * Resolves the slot expression to a string that can be used
     * in the props-object in the return type of the render function
     */
    resolveExpression(expression, scope) {
        let resolved = this.resolvedExpression.get(expression);
        if (resolved) {
            return resolved;
        }
        const strForExpression = new MagicString(this.htmlx);
        const identifiers = [];
        const objectShortHands = [];
        walk(expression, {
            enter(node, parent, prop) {
                if (node.type === 'Identifier') {
                    if (parent) {
                        if (isMember$1(parent, prop)) {
                            return;
                        }
                        if (isObjectKey(parent, prop)) {
                            return;
                        }
                        if (isObjectValue(parent, prop)) {
                            // { value }
                            if (isObjectValueShortHand(parent)) {
                                this.skip();
                                objectShortHands.push(node);
                                return;
                            }
                        }
                    }
                    this.skip();
                    identifiers.push(node);
                }
            }
        });
        const getOverwrite = (name) => {
            const init = scope.getInit(name);
            return init ? this.resolved.get(init) : name;
        };
        for (const identifier of objectShortHands) {
            const { end, name } = identifier;
            const value = getOverwrite(name);
            strForExpression.appendLeft(end, `:${value}`);
        }
        for (const identifier of identifiers) {
            const { start, end, name } = identifier;
            const value = getOverwrite(name);
            strForExpression.overwrite(start, end, value);
        }
        resolved = strForExpression.slice(expression.start, expression.end);
        this.resolvedExpression.set(expression, resolved);
        return resolved;
    }
    handleSlot(node, scope) {
        var _a;
        const nameAttr = node.attributes.find((a) => a.name == 'name');
        const slotName = nameAttr ? nameAttr.value[0].raw : 'default';
        //collect attributes
        const attributes = new Map();
        for (const attr of node.attributes) {
            if (attr.name == 'name') {
                continue;
            }
            if (attr.type === 'Spread') {
                const rawName = attr.expression.name;
                const init = scope.getInit(rawName);
                const name = init ? this.resolved.get(init) : rawName;
                attributes.set(`__spread__${name}`, name);
            }
            if (!((_a = attr.value) === null || _a === void 0 ? void 0 : _a.length)) {
                continue;
            }
            if (attributeValueIsString(attr)) {
                attributes.set(attr.name, attributeStrValueAsJsExpression(attr));
                continue;
            }
            attributes.set(attr.name, this.resolveAttr(attr, scope));
        }
        this.slots.set(slotName, attributes);
    }
    getSlotDef() {
        return this.slots;
    }
    resolveAttr(attr, scope) {
        const attrVal = attr.value[0];
        if (!attrVal) {
            return null;
        }
        if (attrVal.type == 'AttributeShorthand') {
            const { name } = attrVal.expression;
            const init = scope.getInit(name);
            const resolved = this.resolved.get(init);
            return resolved !== null && resolved !== void 0 ? resolved : name;
        }
        if (attrVal.type == 'MustacheTag') {
            return this.resolveExpression(attrVal.expression, scope);
        }
        throw Error('Unknown attribute value type:' + attrVal.type);
    }
}
function getSingleSlotDef(componentNode, slotName) {
    // In contrast to getSingleSlotDef in htmlx2jsx, use a simple instanceOf-transformation here.
    // This means that if someone forwards a slot whose type can only be infered from the input properties
    // because there's a generic relationship, then that slot type is of type any or unknown.
    // This is a limitation which could be tackled later. The problem is that in contrast to the transformation
    // in htmlx2jsx, we cannot know for sure that all properties we would generate the component with exist
    // in this scope, some could have been generated through each/await blocks or other lets.
    const componentType = getTypeForComponent(componentNode);
    return `__sveltets_2_instanceOf(${componentType}).$$slot_def['${slotName}']`;
}

/**
 * adopted from https://github.com/sveltejs/svelte/blob/master/src/compiler/compile/nodes/shared/TemplateScope.ts
 */
class TemplateScope {
    constructor(parent) {
        this.owners = new Map();
        this.inits = new Map();
        this.parent = parent;
        this.names = new Set(parent ? parent.names : []);
    }
    addMany(inits, owner) {
        inits.forEach((item) => this.add(item, owner));
        return this;
    }
    add(init, owner) {
        const { name } = init;
        this.names.add(name);
        this.inits.set(name, init);
        this.owners.set(name, owner);
        return this;
    }
    child() {
        const child = new TemplateScope(this);
        return child;
    }
    getOwner(name) {
        var _a;
        return this.owners.get(name) || ((_a = this.parent) === null || _a === void 0 ? void 0 : _a.getOwner(name));
    }
    getInit(name) {
        var _a;
        return this.inits.get(name) || ((_a = this.parent) === null || _a === void 0 ? void 0 : _a.getInit(name));
    }
    isLet(name) {
        const owner = this.getOwner(name);
        return owner && (owner.type === 'Element' || owner.type === 'InlineComponent');
    }
}

function isReference(node, parent) {
    if (node.type === 'MemberExpression') {
        return !node.computed && isReference(node.object, node);
    }
    if (node.type === 'Identifier') {
        if (!parent)
            return true;
        switch (parent.type) {
            // disregard `bar` in `foo.bar`
            case 'MemberExpression': return parent.computed || node === parent.object;
            // disregard the `foo` in `class {foo(){}}` but keep it in `class {[foo](){}}`
            case 'MethodDefinition': return parent.computed;
            // disregard the `foo` in `class {foo=bar}` but keep it in `class {[foo]=bar}` and `class {bar=foo}`
            case 'FieldDefinition': return parent.computed || node === parent.value;
            // disregard the `bar` in `{ bar: foo }`, but keep it in `{ [bar]: foo }`
            case 'Property': return parent.computed || node === parent.value;
            // disregard the `bar` in `export { foo as bar }` or
            // the foo in `import { foo as bar }`
            case 'ExportSpecifier':
            case 'ImportSpecifier': return node === parent.local;
            // disregard the `foo` in `foo: while (...) { ... break foo; ... continue foo;}`
            case 'LabeledStatement':
            case 'BreakStatement':
            case 'ContinueStatement': return false;
            default: return true;
        }
    }
    return false;
}

// @ts-check

/** @typedef { import('estree').Node} Node */
/** @typedef { import('estree').VariableDeclaration} VariableDeclaration */
/** @typedef { import('estree').ClassDeclaration} ClassDeclaration */
/** @typedef { import('estree').VariableDeclarator} VariableDeclarator */
/** @typedef { import('estree').Property} Property */
/** @typedef { import('estree').RestElement} RestElement */
/** @typedef { import('estree').Identifier} Identifier */

/**
 *
 * @param {Node} expression
 */
function analyze(expression) {
	/** @type {WeakMap<Node, Scope>} */
	const map = new WeakMap();

	/** @type {Map<string, Node>} */
	const globals = new Map();

	const scope = new Scope(null, false);

	/** @type {[Scope, Identifier][]} */
	const references = [];
	let current_scope = scope;

	walk(expression, {
		/**
		 *
		 * @param {Node} node
		 * @param {Node} parent
		 */
		enter(node, parent) {
			switch (node.type) {
				case 'Identifier':
					if (isReference(node, parent)) {
						references.push([current_scope, node]);
					}
					break;

				case 'ImportDeclaration':
					node.specifiers.forEach((specifier) => {
						current_scope.declarations.set(specifier.local.name, specifier);
					});
					break;

				case 'FunctionExpression':
				case 'FunctionDeclaration':
				case 'ArrowFunctionExpression':
					if (node.type === 'FunctionDeclaration') {
						if (node.id) {
							current_scope.declarations.set(node.id.name, node);
						}

						map.set(node, current_scope = new Scope(current_scope, false));
					} else {
						map.set(node, current_scope = new Scope(current_scope, false));

						if (node.type === 'FunctionExpression' && node.id) {
							current_scope.declarations.set(node.id.name, node);
						}
					}

					node.params.forEach(param => {
						extract_names(param).forEach(name => {
							current_scope.declarations.set(name, node);
						});
					});
					break;

				case 'ForStatement':
				case 'ForInStatement':
				case 'ForOfStatement':
					map.set(node, current_scope = new Scope(current_scope, true));
					break;

				case 'BlockStatement':
					map.set(node, current_scope = new Scope(current_scope, true));
					break;

				case 'ClassDeclaration':
				case 'VariableDeclaration':
					current_scope.add_declaration(node);
					break;

				case 'CatchClause':
					map.set(node, current_scope = new Scope(current_scope, true));

					if (node.param) {
						extract_names(node.param).forEach(name => {
							current_scope.declarations.set(name, node.param);
						});
					}
					break;
			}
		},

		/**
		 *
		 * @param {Node} node
		 */
		leave(node) {
			if (map.has(node)) {
				current_scope = current_scope.parent;
			}
		}
	});

	for (let i = references.length - 1; i >= 0; --i) {
		const [scope, reference] = references[i];

		if (!scope.references.has(reference.name)) {
			add_reference(scope, reference.name);

			if (!scope.find_owner(reference.name)) {
				globals.set(reference.name, reference);
			}
		}
	}

	return { map, scope, globals };
}

/**
 *
 * @param {Scope} scope
 * @param {string} name
 */
function add_reference(scope, name) {
	scope.references.add(name);
	if (scope.parent) add_reference(scope.parent, name);
}

class Scope {
	constructor(parent, block) {
		/** @type {Scope | null} */
		this.parent = parent;

		/** @type {boolean} */
		this.block = block;

		/** @type {Map<string, Node>} */
		this.declarations = new Map();

		/** @type {Set<string>} */
		this.initialised_declarations = new Set();

		/** @type {Set<string>} */
		this.references = new Set();
	}

	/**
	 *
	 * @param {VariableDeclaration | ClassDeclaration} node
	 */
	add_declaration(node) {
		if (node.type === 'VariableDeclaration') {
			if (node.kind === 'var' && this.block && this.parent) {
				this.parent.add_declaration(node);
			} else {
				/**
				 *
				 * @param {VariableDeclarator} declarator
				 */
				const handle_declarator = (declarator) => {
					extract_names(declarator.id).forEach(name => {
						this.declarations.set(name, node);
						if (declarator.init) this.initialised_declarations.add(name);
					});				};

				node.declarations.forEach(handle_declarator);
			}
		} else if (node.id) {
			this.declarations.set(node.id.name, node);
		}
	}

	/**
	 *
	 * @param {string} name
	 * @returns {Scope | null}
	 */
	find_owner(name) {
		if (this.declarations.has(name)) return this;
		return this.parent && this.parent.find_owner(name);
	}

	/**
	 *
	 * @param {string} name
	 * @returns {boolean}
	 */
	has(name) {
		return (
			this.declarations.has(name) || (!!this.parent && this.parent.has(name))
		);
	}
}

/**
 *
 * @param {Node} param
 * @returns {string[]}
 */
function extract_names(param) {
	return extract_identifiers(param).map(node => node.name);
}

/**
 *
 * @param {Node} param
 * @param {Identifier[]} nodes
 * @returns {Identifier[]}
 */
function extract_identifiers(param, nodes = []) {
	switch (param.type) {
		case 'Identifier':
			nodes.push(param);
			break;

		case 'MemberExpression':
			let object = param;
			while (object.type === 'MemberExpression') {
				object = /** @type {any} */ (object.object);
			}
			nodes.push(/** @type {any} */ (object));
			break;

		case 'ObjectPattern':
			/**
			 *
			 * @param {Property | RestElement} prop
			 */
			const handle_prop = (prop) => {
				if (prop.type === 'RestElement') {
					extract_identifiers(prop.argument, nodes);
				} else {
					extract_identifiers(prop.value, nodes);
				}
			};

			param.properties.forEach(handle_prop);
			break;

		case 'ArrayPattern':
			/**
			 *
			 * @param {Node} element
			 */
			const handle_element = (element) => {
				if (element) extract_identifiers(element, nodes);
			};

			param.elements.forEach(handle_element);
			break;

		case 'RestElement':
			extract_identifiers(param.argument, nodes);
			break;

		case 'AssignmentPattern':
			extract_identifiers(param.left, nodes);
			break;
	}

	return nodes;
}

function handleScopeAndResolveForSlot({ identifierDef, initExpression, owner, slotHandler, templateScope }) {
    if (isIdentifier(identifierDef)) {
        templateScope.add(identifierDef, owner);
        slotHandler.resolve(identifierDef, initExpression, templateScope);
    }
    if (isDestructuringPatterns(identifierDef)) {
        // the node object is returned as-it with no mutation
        const identifiers = extract_identifiers(identifierDef);
        templateScope.addMany(identifiers, owner);
        slotHandler.resolveDestructuringAssignment(identifierDef, identifiers, initExpression, templateScope);
    }
}
function handleScopeAndResolveLetVarForSlot({ letNode, component, slotName, templateScope, slotHandler }) {
    const { expression } = letNode;
    // <Component let:a>
    if (!expression) {
        templateScope.add(letNode, component);
        slotHandler.resolveLet(letNode, letNode, component, slotName);
    }
    else {
        if (isIdentifier(expression)) {
            templateScope.add(expression, component);
            slotHandler.resolveLet(letNode, expression, component, slotName);
        }
        const expForExtract = { ...expression };
        // https://github.com/sveltejs/svelte/blob/3a37de364bfbe75202d8e9fcef9e76b9ce6faaa2/src/compiler/compile/nodes/Let.ts#L37
        if (expression.type === 'ArrayExpression') {
            expForExtract.type = 'ArrayPattern';
        }
        else if (expression.type === 'ObjectExpression') {
            expForExtract.type = 'ObjectPattern';
        }
        if (isDestructuringPatterns(expForExtract)) {
            const identifiers = extract_identifiers(expForExtract);
            templateScope.addMany(identifiers, component);
            slotHandler.resolveDestructuringAssignmentForLet(expForExtract, identifiers, letNode, component, slotName);
        }
    }
}

class EventHandler {
    constructor() {
        this.bubbledEvents = new Map();
        this.callees = [];
    }
    handleEventHandler(node, parent) {
        const eventName = node.name;
        // pass-through/ bubble
        if (!node.expression) {
            if (parent.type === 'InlineComponent') {
                if (parent.name !== 'svelte:self') {
                    this.handleEventHandlerBubble(parent, eventName);
                }
                return;
            }
            this.bubbledEvents.set(eventName, getEventDefExpressionForNonComponent(eventName, parent));
        }
    }
    handleIdentifier(node, parent, prop) {
        if (prop === 'callee') {
            this.callees.push({ name: node.name, parent });
        }
    }
    getBubbledEvents() {
        return this.bubbledEvents;
    }
    getDispatchedEventsForIdentifier(name) {
        const eventNames = new Set();
        this.callees.forEach((callee) => {
            if (callee.name === name) {
                const [name] = callee.parent.arguments;
                if (name.value !== undefined) {
                    eventNames.add(name.value);
                }
            }
        });
        return eventNames;
    }
    bubbledEventsAsStrings() {
        return Array.from(this.bubbledEvents.entries()).map(eventMapEntryToString);
    }
    handleEventHandlerBubble(parent, eventName) {
        const componentEventDef = `__sveltets_2_instanceOf(${parent.name})`;
        const exp = `__sveltets_2_bubbleEventDef(${componentEventDef}.$$events_def, '${eventName}')`;
        const exist = this.bubbledEvents.get(eventName);
        this.bubbledEvents.set(eventName, exist ? [].concat(exist, exp) : exp);
    }
}
function getEventDefExpressionForNonComponent(eventName, ele) {
    switch (ele.type) {
        case 'Element':
            return `__sveltets_2_mapElementEvent('${eventName}')`;
        case 'Body':
            return `__sveltets_2_mapBodyEvent('${eventName}')`;
        case 'Window':
            return `__sveltets_2_mapWindowEvent('${eventName}')`;
    }
}
function eventMapEntryToString([eventName, expression]) {
    return `'${eventName}':${Array.isArray(expression) ? `__sveltets_2_unionType(${expression.join(',')})` : expression}`;
}

function is$$EventsDeclaration(node) {
    return isInterfaceOrTypeDeclaration(node) && node.name.text === '$$Events';
}
/**
 * This class accumulates all events that are dispatched from the component.
 * It also tracks bubbled/forwarded events.
 *
 * It can not track events which are not fired through a variable
 * which was not instantiated within the component with `createEventDispatcher`.
 * This means that event dispatchers which are defined outside of the component and then imported do not get picked up.
 *
 * The logic is as follows:
 * - If there exists a ComponentEvents interface definition, use that and skip the rest
 * - Else first try to find the `createEventDispatcher` import
 * - If it exists, try to find the variables where `createEventDispatcher()` is assigned to
 * - For each variable found, try to find out if it's typed.
 *   - If yes, extract the event names and the event types from it
 *   - If no, track all invocations of it to get the event names
 */
class ComponentEvents {
    get eventsClass() {
        return this.componentEventsInterface.isPresent()
            ? this.componentEventsInterface
            : this.componentEventsFromEventsMap;
    }
    constructor(eventHandler, strictEvents, str) {
        this.strictEvents = strictEvents;
        this.str = str;
        this.componentEventsInterface = new ComponentEventsFromInterface();
        this.componentEventsFromEventsMap = new ComponentEventsFromEventsMap(eventHandler);
    }
    /**
     * Collect state and create the API which will be part
     * of the return object of the `svelte2tsx` function.
     */
    createAPI() {
        const entries = [];
        const iterableEntries = this.eventsClass.events.entries();
        for (const entry of iterableEntries) {
            entries.push({ name: entry[0], ...entry[1] });
        }
        return {
            getAll() {
                return entries;
            }
        };
    }
    toDefString() {
        return this.eventsClass.toDefString();
    }
    setComponentEventsInterface(node, astOffset) {
        this.componentEventsInterface.setComponentEventsInterface(node, this.str, astOffset);
    }
    hasEvents() {
        return this.eventsClass.events.size > 0;
    }
    hasStrictEvents() {
        return this.componentEventsInterface.isPresent() || this.strictEvents;
    }
    checkIfImportIsEventDispatcher(node) {
        this.componentEventsFromEventsMap.checkIfImportIsEventDispatcher(node);
        this.componentEventsInterface.checkIfImportIsEventDispatcher(node);
    }
    checkIfIsStringLiteralDeclaration(node) {
        this.componentEventsFromEventsMap.checkIfIsStringLiteralDeclaration(node);
    }
    checkIfDeclarationInstantiatedEventDispatcher(node) {
        this.componentEventsFromEventsMap.checkIfDeclarationInstantiatedEventDispatcher(node);
        this.componentEventsInterface.checkIfDeclarationInstantiatedEventDispatcher(node);
    }
    checkIfCallExpressionIsDispatch(node) {
        this.componentEventsFromEventsMap.checkIfCallExpressionIsDispatch(node);
    }
}
class ComponentEventsFromInterface {
    constructor() {
        this.events = new Map();
        this.eventDispatcherImport = '';
    }
    setComponentEventsInterface(node, str, astOffset) {
        this.str = str;
        this.astOffset = astOffset;
        this.events = this.extractEvents(node);
    }
    checkIfImportIsEventDispatcher(node) {
        if (this.eventDispatcherImport) {
            return;
        }
        this.eventDispatcherImport = checkIfImportIsEventDispatcher(node);
    }
    checkIfDeclarationInstantiatedEventDispatcher(node) {
        if (!this.isPresent()) {
            return;
        }
        const result = checkIfDeclarationInstantiatedEventDispatcher(node, this.eventDispatcherImport);
        if (!result) {
            return;
        }
        const { dispatcherTyping, dispatcherCreationExpr } = result;
        if (!dispatcherTyping) {
            this.str.prependLeft(dispatcherCreationExpr.expression.getEnd() + this.astOffset, '<__sveltets_2_CustomEvents<$$Events>>');
        }
    }
    toDefString() {
        return this.isPresent() ? '{} as unknown as $$Events' : undefined;
    }
    isPresent() {
        return !!this.str;
    }
    extractEvents(node) {
        const map = new Map();
        if (ts.isInterfaceDeclaration(node)) {
            this.extractProperties(node.members, map);
        }
        else {
            if (ts.isTypeLiteralNode(node.type)) {
                this.extractProperties(node.type.members, map);
            }
            else if (ts.isIntersectionTypeNode(node.type)) {
                node.type.types.forEach((type) => {
                    if (ts.isTypeLiteralNode(type)) {
                        this.extractProperties(type.members, map);
                    }
                });
            }
        }
        return map;
    }
    extractProperties(members, map) {
        members.filter(ts.isPropertySignature).forEach((member) => {
            var _a;
            map.set(getName(member.name), {
                type: ((_a = member.type) === null || _a === void 0 ? void 0 : _a.getText()) || 'Event',
                doc: getDoc(member)
            });
        });
    }
}
class ComponentEventsFromEventsMap {
    constructor(eventHandler) {
        this.eventHandler = eventHandler;
        this.events = new Map();
        this.dispatchedEvents = new Set();
        this.stringVars = new Map();
        this.eventDispatcherImport = '';
        this.eventDispatchers = [];
        this.events = this.extractEvents(eventHandler);
    }
    checkIfImportIsEventDispatcher(node) {
        if (this.eventDispatcherImport) {
            return;
        }
        this.eventDispatcherImport = checkIfImportIsEventDispatcher(node);
    }
    checkIfIsStringLiteralDeclaration(node) {
        if (ts.isIdentifier(node.name) &&
            node.initializer &&
            ts.isStringLiteral(node.initializer)) {
            this.stringVars.set(node.name.text, node.initializer.text);
        }
    }
    checkIfDeclarationInstantiatedEventDispatcher(node) {
        const result = checkIfDeclarationInstantiatedEventDispatcher(node, this.eventDispatcherImport);
        if (!result) {
            return;
        }
        const { dispatcherTyping, dispatcherName } = result;
        if (dispatcherTyping) {
            this.eventDispatchers.push({
                name: dispatcherName,
                typing: dispatcherTyping.getText()
            });
            if (ts.isTypeLiteralNode(dispatcherTyping)) {
                dispatcherTyping.members.filter(ts.isPropertySignature).forEach((member) => {
                    var _a;
                    this.addToEvents(getName(member.name), {
                        type: `CustomEvent<${((_a = member.type) === null || _a === void 0 ? void 0 : _a.getText()) || 'any'}>`,
                        doc: getDoc(member)
                    });
                });
            }
        }
        else {
            this.eventDispatchers.push({ name: dispatcherName });
            this.eventHandler
                .getDispatchedEventsForIdentifier(dispatcherName)
                .forEach((evtName) => {
                this.addToEvents(evtName);
                this.dispatchedEvents.add(evtName);
            });
        }
    }
    checkIfCallExpressionIsDispatch(node) {
        if (this.eventDispatchers.some((dispatcher) => !dispatcher.typing &&
            ts.isIdentifier(node.expression) &&
            node.expression.text === dispatcher.name)) {
            const firstArg = node.arguments[0];
            if (ts.isStringLiteral(firstArg)) {
                this.addToEvents(firstArg.text);
                this.dispatchedEvents.add(firstArg.text);
            }
            else if (ts.isIdentifier(firstArg)) {
                const str = this.stringVars.get(firstArg.text);
                if (str) {
                    this.addToEvents(str);
                    this.dispatchedEvents.add(str);
                }
            }
        }
    }
    addToEvents(eventName, info = { type: 'CustomEvent<any>' }) {
        if (this.events.has(eventName)) {
            // If there are multiple definitions, merge them by falling back to any-typing
            this.events.set(eventName, { type: 'CustomEvent<any>' });
            this.dispatchedEvents.add(eventName);
        }
        else {
            this.events.set(eventName, info);
        }
    }
    toDefString() {
        return ('{' +
            [
                ...this.eventDispatchers
                    .map((dispatcher) => dispatcher.typing &&
                    `...__sveltets_2_toEventTypings<${dispatcher.typing}>()`)
                    .filter((str) => !!str),
                ...this.eventHandler.bubbledEventsAsStrings(),
                ...[...this.dispatchedEvents.keys()].map((e) => `'${e}': __sveltets_2_customEvent`)
            ].join(', ') +
            '}');
    }
    extractEvents(eventHandler) {
        const map = new Map();
        for (const name of eventHandler.getBubbledEvents().keys()) {
            map.set(name, { type: 'Event' });
        }
        return map;
    }
}
function getName(prop) {
    if (ts.isIdentifier(prop) || ts.isStringLiteral(prop)) {
        return prop.text;
    }
    if (ts.isComputedPropertyName(prop)) {
        if (ts.isIdentifier(prop.expression)) {
            const identifierName = prop.expression.text;
            const identifierValue = getIdentifierValue(prop, identifierName);
            if (!identifierValue) {
                throwError$1(prop);
            }
            return identifierValue;
        }
    }
    throwError$1(prop);
}
function getIdentifierValue(prop, identifierName) {
    const variable = getVariableAtTopLevel(prop.getSourceFile(), identifierName);
    if (variable && ts.isStringLiteral(variable.initializer)) {
        return variable.initializer.text;
    }
}
function throwError$1(prop) {
    const error = new Error('The ComponentEvents interface can only have properties of type ' +
        'Identifier, StringLiteral or ComputedPropertyName. ' +
        'In case of ComputedPropertyName, ' +
        'it must be a const declared within the component and initialized with a string.');
    error.start = toLineColumn(prop.getStart());
    error.end = toLineColumn(prop.getEnd());
    throw error;
    function toLineColumn(pos) {
        const lineChar = prop.getSourceFile().getLineAndCharacterOfPosition(pos);
        return {
            line: lineChar.line + 1,
            column: lineChar.character
        };
    }
}
function getDoc(member) {
    let doc = undefined;
    const comment = getLastLeadingDoc(member);
    if (comment) {
        doc = comment
            .split('\n')
            .map((line) => 
        // Remove /** */
        line
            .replace(/\s*\/\*\*/, '')
            .replace(/\s*\*\//, '')
            .replace(/\s*\*/, '')
            .trim())
            .join('\n');
    }
    return doc;
}
function checkIfImportIsEventDispatcher(node) {
    var _a;
    if (ts.isStringLiteral(node.moduleSpecifier) && node.moduleSpecifier.text !== 'svelte') {
        return;
    }
    const namedImports = (_a = node.importClause) === null || _a === void 0 ? void 0 : _a.namedBindings;
    if (namedImports && ts.isNamedImports(namedImports)) {
        const eventDispatcherImport = namedImports.elements.find(
        // If it's an aliased import, propertyName is set
        (el) => (el.propertyName || el.name).text === 'createEventDispatcher');
        if (eventDispatcherImport) {
            return eventDispatcherImport.name.text;
        }
    }
}
function checkIfDeclarationInstantiatedEventDispatcher(node, eventDispatcherImport) {
    var _a;
    if (!ts.isIdentifier(node.name) || !node.initializer) {
        return;
    }
    if (ts.isCallExpression(node.initializer) &&
        ts.isIdentifier(node.initializer.expression) &&
        node.initializer.expression.text === eventDispatcherImport) {
        const dispatcherName = node.name.text;
        const dispatcherTyping = (_a = node.initializer.typeArguments) === null || _a === void 0 ? void 0 : _a[0];
        return {
            dispatcherName,
            dispatcherTyping,
            dispatcherCreationExpr: node.initializer
        };
    }
}

/**
 * {@attach xxx}   --->    [Symbol()]: xxx
 */
function handleAttachTag(tag, element) {
    // element.addAttachment(attr);
    if (element instanceof InlineComponent) {
        element.addProp(['[Symbol("@attach")]'], [[tag.expression.start, tag.expression.end]]);
    }
    else {
        element.addAttribute(['[Symbol("@attach")]'], [[tag.expression.start, tag.expression.end]]);
    }
}

/**
 * Walks the HTMLx part of the Svelte component
 * and converts it to JSX
 */
function convertHtmlxToJsx(str, ast, tags, options = { svelte5Plus: false }) {
    options.typingsNamespace = options.typingsNamespace || 'svelteHTML';
    const preserveAttributeCase = options.namespace === 'foreign';
    const rootSnippets = [];
    let element;
    const pendingSnippetHoistCheck = new Set();
    let uses$$props = false;
    let uses$$restProps = false;
    let uses$$slots = false;
    let usesAccessors = !!options.accessors;
    let isRunes = false;
    const componentDocumentation = new ComponentDocumentation();
    //track if we are in a declaration scope
    const isDeclaration = { value: false };
    //track $store variables since we are only supposed to give top level scopes special treatment, and users can declare $blah variables at higher scopes
    //which prevents us just changing all instances of Identity that start with $
    const scopeStack = new ScopeStack();
    const stores = new Stores(scopeStack, isDeclaration);
    const scripts = new Scripts(ast);
    const handleSvelteOptions = (node) => {
        for (let i = 0; i < node.attributes.length; i++) {
            const optionName = node.attributes[i].name;
            const optionValue = node.attributes[i].value;
            switch (optionName) {
                case 'accessors':
                    if (Array.isArray(optionValue)) {
                        if (optionValue[0].type === 'MustacheTag') {
                            usesAccessors = optionValue[0].expression.value;
                        }
                    }
                    else {
                        usesAccessors = true;
                    }
                    break;
                case 'runes':
                    if (Array.isArray(optionValue)) {
                        if (optionValue[0].type === 'MustacheTag') {
                            isRunes = optionValue[0].expression.value;
                        }
                    }
                    else {
                        isRunes = true;
                    }
                    break;
            }
        }
    };
    const handleIdentifier = (node) => {
        if (node.name === '$$props') {
            uses$$props = true;
            return;
        }
        if (node.name === '$$restProps') {
            uses$$restProps = true;
            return;
        }
        if (node.name === '$$slots') {
            uses$$slots = true;
            return;
        }
    };
    const handleStyleTag = (node) => {
        str.remove(node.start, node.end);
    };
    const slotHandler = new SlotHandler(str.original);
    let templateScope = new TemplateScope();
    const handleComponentLet = (component) => {
        templateScope = templateScope.child();
        const lets = slotHandler.getSlotConsumerOfComponent(component);
        for (const { letNode, slotName } of lets) {
            handleScopeAndResolveLetVarForSlot({
                letNode,
                slotName,
                slotHandler,
                templateScope,
                component
            });
        }
    };
    const handleScopeAndResolveForSlotInner = (identifierDef, initExpression, owner) => {
        handleScopeAndResolveForSlot({
            identifierDef,
            initExpression,
            slotHandler,
            templateScope,
            owner
        });
    };
    const eventHandler = new EventHandler();
    const path = [];
    walk(ast, {
        enter: (estreeTypedNode, estreeTypedParent, prop) => {
            var _a;
            const node = estreeTypedNode;
            const parent = estreeTypedParent;
            path.push(node);
            if (prop == 'params' &&
                (parent.type == 'FunctionDeclaration' || parent.type == 'ArrowFunctionExpression')) {
                isDeclaration.value = true;
            }
            if (prop == 'id' && parent.type == 'VariableDeclarator') {
                isDeclaration.value = true;
            }
            try {
                switch (node.type) {
                    case 'Identifier':
                        handleIdentifier(node);
                        stores.handleIdentifier(node, parent, prop);
                        eventHandler.handleIdentifier(node, parent, prop);
                        break;
                    case 'IfBlock':
                        handleIf(str, node);
                        break;
                    case 'EachBlock':
                        templateScope = templateScope.child();
                        if (node.context) {
                            handleScopeAndResolveForSlotInner(node.context, node.expression, node);
                        }
                        handleEach(str, node);
                        break;
                    case 'ElseBlock':
                        handleElse(str, node, parent);
                        break;
                    case 'KeyBlock':
                        handleKey(str, node);
                        break;
                    case 'BlockStatement':
                    case 'FunctionDeclaration':
                    case 'ArrowFunctionExpression':
                        scopeStack.push();
                        break;
                    case 'SnippetBlock':
                        scopeStack.push();
                        handleSnippet(str, node, (element instanceof InlineComponent &&
                            estreeTypedParent.type === 'InlineComponent') ||
                            (element instanceof Element &&
                                element.tagName === 'svelte:boundary')
                            ? element
                            : undefined);
                        if (parent === ast) {
                            // root snippet -> move to instance script or possibly even module script
                            const result = analyze({
                                type: 'FunctionDeclaration',
                                start: -1,
                                end: -1,
                                id: node.expression,
                                params: (_a = node.parameters) !== null && _a !== void 0 ? _a : [],
                                body: {
                                    type: 'BlockStatement',
                                    start: -1,
                                    end: -1,
                                    body: node.children // wrong AST, but periscopic doesn't care
                                }
                            });
                            rootSnippets.push([
                                node.start,
                                node.end,
                                result.globals,
                                node.expression.name
                            ]);
                        }
                        else {
                            pendingSnippetHoistCheck.add(parent);
                        }
                        break;
                    case 'MustacheTag':
                        handleMustacheTag(str, node, parent);
                        break;
                    case 'RawMustacheTag':
                        scripts.checkIfContainsScriptTag(node);
                        handleRawHtml(str, node);
                        break;
                    case 'DebugTag':
                        handleDebug(str, node);
                        break;
                    case 'ConstTag':
                        handleConstTag(str, node);
                        break;
                    case 'RenderTag':
                        handleRenderTag(str, node);
                        break;
                    case 'AttachTag':
                        handleAttachTag(node, element);
                        break;
                    case 'InlineComponent':
                        if (element) {
                            element.child = new InlineComponent(str, node, element);
                            element = element.child;
                        }
                        else {
                            element = new InlineComponent(str, node);
                        }
                        if (options.svelte5Plus) {
                            handleImplicitChildren(node, element);
                        }
                        handleComponentLet(node);
                        break;
                    case 'Element':
                    case 'Options':
                    case 'Window':
                    case 'Head':
                    case 'Title':
                    case 'Document':
                    case 'Body':
                    case 'SvelteBoundary':
                    case 'Slot':
                    case 'SlotTemplate':
                        if (node.type === 'Element') {
                            scripts.checkIfElementIsScriptTag(node, parent);
                        }
                        else if (node.type === 'Options') {
                            handleSvelteOptions(node);
                        }
                        else if (node.type === 'Slot') {
                            slotHandler.handleSlot(node, templateScope);
                        }
                        if (node.name === '!DOCTYPE') {
                            str.remove(node.start, node.end);
                        }
                        else {
                            if (element) {
                                element.child = new Element(str, node, options.typingsNamespace, element);
                                element = element.child;
                            }
                            else {
                                element = new Element(str, node, options.typingsNamespace);
                            }
                        }
                        break;
                    case 'Comment':
                        componentDocumentation.handleComment(node);
                        handleComment(str, node);
                        break;
                    case 'Binding':
                        handleBinding(str, node, parent, element, options.typingsNamespace === 'svelteHTML', options.svelte5Plus);
                        break;
                    case 'Class':
                        handleClassDirective(str, node, element);
                        break;
                    case 'StyleDirective':
                        handleStyleDirective(str, node, element);
                        break;
                    case 'Action':
                        stores.handleDirective(node, str);
                        handleActionDirective(node, element);
                        break;
                    case 'Transition':
                        stores.handleDirective(node, str);
                        handleTransitionDirective(str, node, element);
                        break;
                    case 'Animation':
                        stores.handleDirective(node, str);
                        handleAnimateDirective(str, node, element);
                        break;
                    case 'Attribute':
                        handleAttribute(str, node, parent, preserveAttributeCase, options.svelte5Plus, element);
                        break;
                    case 'Spread':
                        handleSpread(node, element);
                        break;
                    case 'EventHandler':
                        eventHandler.handleEventHandler(node, parent);
                        handleEventHandler(str, node, element);
                        break;
                    case 'Let':
                        handleLet(str, node, parent, preserveAttributeCase, options.svelte5Plus, element);
                        break;
                    case 'Text':
                        handleText(str, node, parent);
                        break;
                    case 'Style':
                        handleStyleTag(node);
                        break;
                    case 'VariableDeclarator':
                        isDeclaration.value = true;
                        break;
                    case 'AwaitBlock':
                        templateScope = templateScope.child();
                        if (node.value) {
                            handleScopeAndResolveForSlotInner(node.value, node.expression, node.then);
                        }
                        if (node.error) {
                            handleScopeAndResolveForSlotInner(node.error, node.expression, node.catch);
                        }
                        break;
                    case 'AwaitExpression':
                        isRunes || (isRunes = path.every(({ type }) => type !== 'ArrowFunctionExpression' &&
                            type !== 'FunctionExpression' &&
                            type !== 'FunctionDeclaration'));
                }
            }
            catch (e) {
                console.error('Error walking node ', node, e);
                throw e;
            }
        },
        leave: (estreeTypedNode, estreeTypedParent, prop) => {
            const node = estreeTypedNode;
            const parent = estreeTypedParent;
            path.pop();
            if (prop == 'params' &&
                (parent.type == 'FunctionDeclaration' || parent.type == 'ArrowFunctionExpression')) {
                isDeclaration.value = false;
            }
            if (prop == 'id' && parent.type == 'VariableDeclarator') {
                isDeclaration.value = false;
            }
            const onTemplateScopeLeave = () => {
                templateScope = templateScope.parent;
            };
            try {
                switch (node.type) {
                    case 'BlockStatement':
                    case 'FunctionDeclaration':
                    case 'ArrowFunctionExpression':
                    case 'SnippetBlock':
                        scopeStack.pop();
                        break;
                    case 'EachBlock':
                        onTemplateScopeLeave();
                        break;
                    case 'AwaitBlock':
                        onTemplateScopeLeave();
                        handleAwait(str, node);
                        break;
                    case 'InlineComponent':
                    case 'Element':
                    case 'Options':
                    case 'Window':
                    case 'Head':
                    case 'Title':
                    case 'Body':
                    case 'SvelteBoundary':
                    case 'Document':
                    case 'Slot':
                    case 'SlotTemplate':
                        if (node.type === 'InlineComponent') {
                            onTemplateScopeLeave();
                        }
                        if (node.name !== '!DOCTYPE') {
                            element.performTransformation();
                            element = element.parent;
                        }
                        break;
                }
            }
            catch (e) {
                console.error('Error leaving node ', node);
                throw e;
            }
        }
    });
    // hoist inner snippets to top of containing element
    for (const node of pendingSnippetHoistCheck) {
        hoistSnippetBlock(str, node);
    }
    // resolve scripts
    const { scriptTag, moduleScriptTag } = scripts.getTopLevelScriptTags();
    if (options.mode !== 'ts') {
        scripts.blankOtherScriptTags(str);
    }
    //resolve stores
    const resolvedStores = stores.getStoreNames();
    return {
        htmlAst: ast,
        moduleScriptTag,
        scriptTag,
        rootSnippets,
        slots: slotHandler.getSlotDef(),
        events: new ComponentEvents(eventHandler, tags.some((tag) => { var _a; return (_a = tag.attributes) === null || _a === void 0 ? void 0 : _a.some((a) => a.name === 'strictEvents'); }), str),
        uses$$props,
        uses$$restProps,
        uses$$slots,
        componentDocumentation,
        resolvedStores,
        usesAccessors,
        isRunes
    };
}

/**
 * Returns the path to the global svelte2tsx files that should be included in the project.
 * Creates a hidden folder in the user's node_modules if `hiddenFolderPath` is provided.
 */
function get_global_types(tsSystem, isSvelte3, sveltePath, typesPath, hiddenFolderPath) {
    let svelteHtmlPath = isSvelte3 ? undefined : join(sveltePath, 'svelte-html.d.ts');
    svelteHtmlPath =
        svelteHtmlPath && tsSystem.fileExists(svelteHtmlPath) ? svelteHtmlPath : undefined;
    let svelteTsxFiles;
    if (isSvelte3) {
        svelteTsxFiles = ['./svelte-shims.d.ts', './svelte-jsx.d.ts', './svelte-native-jsx.d.ts'];
    }
    else {
        svelteTsxFiles = ['./svelte-shims-v4.d.ts', './svelte-native-jsx.d.ts'];
        if (!svelteHtmlPath) {
            svelteTsxFiles.push('./svelte-jsx-v4.d.ts');
        }
    }
    svelteTsxFiles = svelteTsxFiles.map((f) => tsSystem.resolvePath(resolve(typesPath, f)));
    if (hiddenFolderPath) {
        try {
            // IDE context - the `import('svelte')` statements inside the d.ts files will load the Svelte version of
            // the extension, which can cause all sorts of problems. Therefore put the files into a hidden folder in
            // the user's node_modules, preferably next to the Svelte package.
            let path = dirname(sveltePath);
            if (!tsSystem.directoryExists(resolve(path, 'node_modules'))) {
                path = hiddenFolderPath;
                while (path && !tsSystem.directoryExists(resolve(path, 'node_modules'))) {
                    const parent = dirname(path);
                    if (path === parent) {
                        path = '';
                        break;
                    }
                    path = parent;
                }
            }
            if (path) {
                const hiddenPath = resolve(path, 'node_modules/.svelte2tsx-language-server-files');
                const newFiles = [];
                for (const f of svelteTsxFiles) {
                    const hiddenFile = resolve(hiddenPath, basename(f));
                    const existing = tsSystem.readFile(hiddenFile);
                    const toWrite = tsSystem.readFile(f);
                    if (!toWrite) {
                        throw new Error(`Could not read file: ${f}`);
                    }
                    if (existing !== toWrite) {
                        tsSystem.writeFile(hiddenFile, toWrite);
                        // TS doesn't throw an error if the file wasn't written
                        if (!tsSystem.fileExists(hiddenFile)) {
                            throw new Error(`Could not write file: ${hiddenFile}`);
                        }
                    }
                    newFiles.push(hiddenFile);
                }
                svelteTsxFiles = newFiles;
            }
        }
        catch (e) { }
    }
    if (svelteHtmlPath) {
        svelteTsxFiles.push(tsSystem.resolvePath(resolve(typesPath, svelteHtmlPath)));
    }
    return svelteTsxFiles;
}

/**
 * Finds the top level const/let/function exports of a source file.
 */
function findExports(ts, source, isTsFile) {
    var _a, _b, _c, _d;
    const exports = new Map();
    // TODO handle indirect exports?
    for (const statement of source.statements) {
        if (ts.isFunctionDeclaration(statement) &&
            statement.name &&
            ((_b = (_a = ts.getModifiers(statement)) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.kind) === ts.SyntaxKind.ExportKeyword) {
            // export function x ...
            exports.set(statement.name.text, {
                type: 'function',
                node: statement,
                hasTypeDefinition: hasTypedParameter(ts, statement, isTsFile)
            });
        }
        if (ts.isVariableStatement(statement) &&
            statement.declarationList.declarations.length === 1 &&
            ((_d = (_c = ts.getModifiers(statement)) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.kind) === ts.SyntaxKind.ExportKeyword) {
            // export const x = ...
            const declaration = statement.declarationList.declarations[0];
            const hasTypeDefinition = !!declaration.type ||
                (!isTsFile && !!ts.getJSDocType(declaration)) ||
                (!!declaration.initializer && ts.isSatisfiesExpression(declaration.initializer));
            if (declaration.initializer &&
                (ts.isFunctionExpression(declaration.initializer) ||
                    ts.isArrowFunction(declaration.initializer) ||
                    (ts.isSatisfiesExpression(declaration.initializer) &&
                        ts.isParenthesizedExpression(declaration.initializer.expression) &&
                        (ts.isFunctionExpression(declaration.initializer.expression.expression) ||
                            ts.isArrowFunction(declaration.initializer.expression.expression))) ||
                    (ts.isParenthesizedExpression(declaration.initializer) &&
                        (ts.isFunctionExpression(declaration.initializer.expression) ||
                            ts.isArrowFunction(declaration.initializer.expression))))) {
                const node = ts.isSatisfiesExpression(declaration.initializer)
                    ? declaration.initializer.expression
                        .expression
                    : ts.isParenthesizedExpression(declaration.initializer)
                        ? declaration.initializer.expression
                        : declaration.initializer;
                exports.set(declaration.name.getText(), {
                    type: 'function',
                    node,
                    hasTypeDefinition: hasTypeDefinition || hasTypedParameter(ts, node, isTsFile)
                });
            }
            else if (ts.isIdentifier(declaration.name)) {
                // TODO support `export const { x, y } = ...` ?
                exports.set(declaration.name.getText(), {
                    type: 'var',
                    node: declaration,
                    hasTypeDefinition
                });
            }
        }
    }
    return exports;
}
function hasTypedParameter(ts, node, isTsFile) {
    var _a;
    return (!!((_a = node.parameters[0]) === null || _a === void 0 ? void 0 : _a.type) ||
        (!isTsFile &&
            (!!ts.getJSDocType(node) ||
                (node.parameters[0] && !!ts.getJSDocParameterTags(node.parameters[0]).length))));
}

const kitPageFiles = new Set(['+page', '+layout', '+page.server', '+layout.server', '+server']);
/**
 * Determines whether or not a given file is a SvelteKit-specific file (route file, hooks file, or params file)
 */
function isKitFile(fileName, options) {
    const basename = path__default.basename(fileName);
    return (isKitRouteFile(basename) ||
        isHooksFile(fileName, basename, options.serverHooksPath) ||
        isHooksFile(fileName, basename, options.clientHooksPath) ||
        isHooksFile(fileName, basename, options.universalHooksPath) ||
        isParamsFile(fileName, basename, options.paramsPath));
}
/**
 * Determines whether or not a given file is a SvelteKit-specific route file
 */
function isKitRouteFile(basename) {
    if (basename.includes('@')) {
        // +page@foo -> +page
        basename = basename.split('@')[0];
    }
    else {
        basename = basename.slice(0, -path__default.extname(basename).length);
    }
    return kitPageFiles.has(basename);
}
/**
 * Determines whether or not a given file is a SvelteKit-specific hooks file
 */
function isHooksFile(fileName, basename, hooksPath) {
    return (((basename === 'index.ts' || basename === 'index.js') &&
        fileName.slice(0, -basename.length - 1).endsWith(hooksPath)) ||
        fileName.slice(0, -path__default.extname(basename).length).endsWith(hooksPath));
}
/**
 * Determines whether or not a given file is a SvelteKit-specific params file
 */
function isParamsFile(fileName, basename, paramsPath) {
    return (fileName.slice(0, -basename.length - 1).endsWith(paramsPath) &&
        !basename.includes('.test') &&
        !basename.includes('.spec'));
}
function upsertKitFile(ts, fileName, kitFilesSettings, getSource, surround = (text) => text) {
    var _a, _b, _c, _d;
    let basename = path__default.basename(fileName);
    const result = (_d = (_c = (_b = (_a = upsertKitRouteFile(ts, basename, getSource, surround)) !== null && _a !== void 0 ? _a : upsertKitServerHooksFile(ts, fileName, basename, kitFilesSettings.serverHooksPath, getSource, surround)) !== null && _b !== void 0 ? _b : upsertKitClientHooksFile(ts, fileName, basename, kitFilesSettings.clientHooksPath, getSource, surround)) !== null && _c !== void 0 ? _c : upsertKitUniversalHooksFile(ts, fileName, basename, kitFilesSettings.universalHooksPath, getSource, surround)) !== null && _d !== void 0 ? _d : upsertKitParamsFile(ts, fileName, basename, kitFilesSettings.paramsPath, getSource, surround);
    if (!result) {
        return;
    }
    // construct generated text from internal text and addedCode array
    const { originalText, addedCode } = result;
    let pos = 0;
    let text = '';
    for (const added of addedCode) {
        text += originalText.slice(pos, added.originalPos) + added.inserted;
        pos = added.originalPos;
    }
    text += originalText.slice(pos);
    return { text, addedCode };
}
function upsertKitRouteFile(ts, basename, getSource, surround) {
    if (!isKitRouteFile(basename))
        return;
    const source = getSource();
    if (!source)
        return;
    const addedCode = [];
    const insert = (pos, inserted) => {
        insertCode(addedCode, pos, inserted);
    };
    const isTsFile = basename.endsWith('.ts');
    const exports = findExports(ts, source, isTsFile);
    // add type to load function if not explicitly typed
    const load = exports.get('load');
    if ((load === null || load === void 0 ? void 0 : load.type) === 'function' && load.node.parameters.length === 1 && !load.hasTypeDefinition) {
        const pos = load.node.parameters[0].getEnd();
        const inserted = surround(`: import('./$types.js').${basename.includes('layout') ? 'Layout' : 'Page'}${basename.includes('server') ? 'Server' : ''}LoadEvent`);
        insert(pos, inserted);
    }
    else if ((load === null || load === void 0 ? void 0 : load.type) === 'var' && !load.hasTypeDefinition) {
        // "const load = ..." will be transformed into
        // "const load = (...) satisfies PageLoad"
        insert(load.node.initializer.getStart(), surround('('));
        insert(load.node.initializer.getEnd(), surround(`) satisfies import('./$types.js').${basename.includes('layout') ? 'Layout' : 'Page'}${basename.includes('server') ? 'Server' : ''}Load`));
    }
    // add type to entries function if not explicitly typed
    const entries = exports.get('entries');
    if ((entries === null || entries === void 0 ? void 0 : entries.type) === 'function' &&
        entries.node.parameters.length === 0 &&
        !entries.hasTypeDefinition &&
        !basename.includes('layout')) {
        if (!entries.node.type && entries.node.body) {
            const returnPos = ts.isArrowFunction(entries.node)
                ? entries.node.equalsGreaterThanToken.getStart()
                : entries.node.body.getStart();
            const returnInsertion = surround(`: ReturnType<import('./$types.js').EntryGenerator> `);
            insert(returnPos, returnInsertion);
        }
    }
    // add type to actions variable if not explicitly typed
    const actions = exports.get('actions');
    if ((actions === null || actions === void 0 ? void 0 : actions.type) === 'var' && !actions.hasTypeDefinition && actions.node.initializer) {
        const pos = actions.node.initializer.getEnd();
        const inserted = surround(` satisfies import('./$types.js').Actions`);
        insert(pos, inserted);
    }
    addTypeToVariable(exports, surround, insert, 'prerender', `boolean | 'auto'`);
    addTypeToVariable(exports, surround, insert, 'trailingSlash', `'never' | 'always' | 'ignore'`);
    addTypeToVariable(exports, surround, insert, 'ssr', `boolean`);
    addTypeToVariable(exports, surround, insert, 'csr', `boolean`);
    // add types to GET/PUT/POST/PATCH/DELETE/OPTIONS/HEAD if not explicitly typed
    const insertApiMethod = (name) => {
        addTypeToFunction(ts, exports, surround, insert, name, `import('./$types.js').RequestEvent`, `Response | Promise<Response>`);
    };
    insertApiMethod('GET');
    insertApiMethod('PUT');
    insertApiMethod('POST');
    insertApiMethod('PATCH');
    insertApiMethod('DELETE');
    insertApiMethod('OPTIONS');
    insertApiMethod('HEAD');
    insertApiMethod('fallback');
    return { addedCode, originalText: source.getFullText() };
}
function upsertKitParamsFile(ts, fileName, basename, paramsPath, getSource, surround) {
    if (!isParamsFile(fileName, basename, paramsPath)) {
        return;
    }
    const source = getSource();
    if (!source)
        return;
    const addedCode = [];
    const insert = (pos, inserted) => {
        insertCode(addedCode, pos, inserted);
    };
    const isTsFile = basename.endsWith('.ts');
    const exports = findExports(ts, source, isTsFile);
    addTypeToFunction(ts, exports, surround, insert, 'match', 'string', 'boolean');
    return { addedCode, originalText: source.getFullText() };
}
function upsertKitClientHooksFile(ts, fileName, basename, clientHooksPath, getSource, surround) {
    if (!isHooksFile(fileName, basename, clientHooksPath)) {
        return;
    }
    const source = getSource();
    if (!source)
        return;
    const addedCode = [];
    const insert = (pos, inserted) => {
        insertCode(addedCode, pos, inserted);
    };
    const isTsFile = basename.endsWith('.ts');
    const exports = findExports(ts, source, isTsFile);
    addTypeToFunction(ts, exports, surround, insert, 'handleError', `import('@sveltejs/kit').HandleClientError`);
    return { addedCode, originalText: source.getFullText() };
}
function upsertKitServerHooksFile(ts, fileName, basename, serverHooksPath, getSource, surround) {
    if (!isHooksFile(fileName, basename, serverHooksPath)) {
        return;
    }
    const source = getSource();
    if (!source)
        return;
    const addedCode = [];
    const insert = (pos, inserted) => {
        insertCode(addedCode, pos, inserted);
    };
    const isTsFile = basename.endsWith('.ts');
    const exports = findExports(ts, source, isTsFile);
    const addType = (name, type) => {
        addTypeToFunction(ts, exports, surround, insert, name, type);
    };
    addType('handleError', `import('@sveltejs/kit').HandleServerError`);
    addType('handle', `import('@sveltejs/kit').Handle`);
    addType('handleFetch', `import('@sveltejs/kit').HandleFetch`);
    return { addedCode, originalText: source.getFullText() };
}
function upsertKitUniversalHooksFile(ts, fileName, basename, universalHooksPath, getSource, surround) {
    if (!isHooksFile(fileName, basename, universalHooksPath)) {
        return;
    }
    const source = getSource();
    if (!source)
        return;
    const addedCode = [];
    const insert = (pos, inserted) => {
        insertCode(addedCode, pos, inserted);
    };
    const isTsFile = basename.endsWith('.ts');
    const exports = findExports(ts, source, isTsFile);
    addTypeToFunction(ts, exports, surround, insert, 'reroute', `import('@sveltejs/kit').Reroute`);
    return { addedCode, originalText: source.getFullText() };
}
function addTypeToVariable(exports, surround, insert, name, type) {
    const variable = exports.get(name);
    if ((variable === null || variable === void 0 ? void 0 : variable.type) === 'var' && !variable.hasTypeDefinition && variable.node.initializer) {
        const pos = variable.node.name.getEnd();
        const inserted = surround(` : ${type}`);
        insert(pos, inserted);
    }
}
function addTypeToFunction(ts, exports, surround, insert, name, type, returnType) {
    const fn = exports.get(name);
    if ((fn === null || fn === void 0 ? void 0 : fn.type) === 'function' && fn.node.parameters.length === 1 && !fn.hasTypeDefinition) {
        const paramPos = fn.node.parameters[0].getEnd();
        const paramInsertion = surround(!returnType ? `: Parameters<${type}>[0]` : `: ${type}`);
        insert(paramPos, paramInsertion);
        if (!fn.node.type && fn.node.body) {
            const returnPos = ts.isArrowFunction(fn.node)
                ? fn.node.equalsGreaterThanToken.getStart()
                : fn.node.body.getStart();
            const returnInsertion = surround(!returnType ? `: ReturnType<${type}> ` : `: ${returnType} `);
            insert(returnPos, returnInsertion);
        }
    }
}
function insertCode(addedCode, pos, inserted) {
    var _a, _b, _c, _d;
    const insertionIdx = addedCode.findIndex((c) => c.originalPos > pos);
    if (insertionIdx >= 0) {
        for (let i = insertionIdx; i < addedCode.length; i++) {
            addedCode[i].generatedPos += inserted.length;
            addedCode[i].total += inserted.length;
        }
        const prevTotal = (_b = (_a = addedCode[insertionIdx - 1]) === null || _a === void 0 ? void 0 : _a.total) !== null && _b !== void 0 ? _b : 0;
        addedCode.splice(insertionIdx, 0, {
            generatedPos: pos + prevTotal,
            originalPos: pos,
            length: inserted.length,
            inserted,
            total: prevTotal + inserted.length
        });
    }
    else {
        const prevTotal = (_d = (_c = addedCode[addedCode.length - 1]) === null || _c === void 0 ? void 0 : _c.total) !== null && _d !== void 0 ? _d : 0;
        addedCode.push({
            generatedPos: pos + prevTotal,
            originalPos: pos,
            length: inserted.length,
            inserted,
            total: prevTotal + inserted.length
        });
    }
}
function toVirtualPos(pos, addedCode) {
    let total = 0;
    for (const added of addedCode) {
        if (pos < added.originalPos)
            break;
        total += added.length;
    }
    return pos + total;
}
function toOriginalPos(pos, addedCode) {
    let total = 0;
    let idx = 0;
    for (; idx < addedCode.length; idx++) {
        const added = addedCode[idx];
        if (pos < added.generatedPos)
            break;
        total += added.length;
    }
    if (idx > 0) {
        const prev = addedCode[idx - 1];
        // If pos is in the middle of an added range, return the start of the addition
        if (pos > prev.generatedPos && pos < prev.generatedPos + prev.length) {
            return { pos: prev.originalPos, inGenerated: true };
        }
    }
    return { pos: pos - total, inGenerated: false };
}

/**
 * ## Internal, do not use! This is subject to change at any time.
 *
 * Implementation notice: If one of the methods use a TypeScript function which is not from the
 * static top level `ts` namespace, it must be passed as a parameter.
 */
const internalHelpers = {
    isKitFile,
    isKitRouteFile,
    isHooksFile,
    isParamsFile,
    upsertKitFile,
    toVirtualPos,
    toOriginalPos,
    findExports,
    get_global_types,
    renderName: '$$render'
};

/**
 * A component class name suffix is necessary to prevent class name clashes
 * like reported in https://github.com/sveltejs/language-tools/issues/294
 */
const COMPONENT_SUFFIX = '__SvelteComponent_';
function addComponentExport(params) {
    if (params.generics.has()) {
        addGenericsComponentExport(params);
    }
    else {
        addSimpleComponentExport(params);
    }
}
function addGenericsComponentExport({ events, canHaveAnyProp, exportedNames, componentDocumentation, fileName, mode, usesAccessors, str, generics, usesSlots, isSvelte5, noSvelteComponentTyped, hasTopLevelAwait }) {
    const genericsDef = generics.toDefinitionString();
    const genericsRef = generics.toReferencesString();
    const doc = componentDocumentation.getFormatted();
    const className = fileName && classNameFromFilename(fileName, mode !== 'dts');
    function returnType(forPart) {
        return `ReturnType<__sveltets_Render${genericsRef}['${forPart}']>`;
    }
    const renderCall = hasTopLevelAwait
        ? `(await ${internalHelpers.renderName}${genericsRef}())`
        : `${internalHelpers.renderName}${genericsRef}()`;
    // TODO once Svelte 4 compatibility is dropped, we can simplify this, because since TS 4.7 it is possible to use generics
    // like this: `typeof render<T>` - which wasn't possibly before, hence the class + methods workaround.
    let statement = `
class __sveltets_Render${genericsDef} {
    props() {
        return ${props(true, canHaveAnyProp, exportedNames, renderCall)}.props;
    }
    events() {
        return ${_events(events.hasStrictEvents() || exportedNames.isRunesMode(), renderCall)}.events;
    }
    slots() {
        return ${renderCall}.slots;
    }
`;
    // For Svelte 5+ we assume TS > 4.7
    if (isSvelte5 && exportedNames.isRunesMode()) {
        const renderType = hasTopLevelAwait
            ? `Awaited<ReturnType<typeof ${internalHelpers.renderName}${genericsRef}>>`
            : `ReturnType<typeof ${internalHelpers.renderName}${genericsRef}>`;
        statement = `
class __sveltets_Render${genericsDef} {
    props(): ${renderType}['props'] { return null as any; }
    events(): ${renderType}['events'] { return null as any; }
    slots(): ${renderType}['slots'] { return null as any; }
`;
    }
    statement += isSvelte5
        ? `    bindings() { return ${exportedNames.createBindingsStr()}; }
    ${hasTopLevelAwait ? 'async ' : ''}exports() { return ${exportedNames.hasExports() ? `${renderCall}.exports` : '{}'}; }
}\n`
        : '}\n';
    const svelteComponentClass = noSvelteComponentTyped
        ? 'SvelteComponent'
        : 'SvelteComponentTyped';
    const [PropsName] = addTypeExport(str, className, 'Props');
    const [EventsName] = addTypeExport(str, className, 'Events');
    const [SlotsName] = addTypeExport(str, className, 'Slots');
    if (isSvelte5) {
        // Don't add props/events/slots type exports in dts mode for now, maybe someone asks for it to be back,
        // but it's safer to not do it for now to have more flexibility in the future.
        let eventsSlotsType = [];
        if (events.hasEvents() || !exportedNames.isRunesMode()) {
            eventsSlotsType.push(`$$events?: ${returnType('events')}`);
        }
        if (usesSlots) {
            eventsSlotsType.push(`$$slots?: ${returnType('slots')}`);
            eventsSlotsType.push(`children?: any`);
        }
        const propsType = !canHaveAnyProp && exportedNames.hasNoProps()
            ? `{${eventsSlotsType.join(', ')}}`
            : `${returnType('props')} & {${eventsSlotsType.join(', ')}}`;
        const bindingsType = `ReturnType<__sveltets_Render${generics.toReferencesAnyString()}['bindings']>`;
        // Sadly, due to a combination of requirements and TypeScript limitations, we need to always create both a legacy class component and function component type.
        // - Constraints: Need to support Svelte 4 class component types, therefore we need to use __sveltets_2_ensureComponent to transform function components to classes
        // - Limitations: TypeScript is not able to preserve generics during said transformation (i.e. there's no way to express keeping the generic etc)
        // TODO Svelte 6/7: Switch this around and not use new Component in svelte2tsx anymore, which means we can remove the legacy class component. We need something like _ensureFnComponent then.
        statement +=
            `\ninterface $$IsomorphicComponent {\n` +
                `    new ${genericsDef}(options: import('svelte').ComponentConstructorOptions<${returnType('props') + (usesSlots ? '& {children?: any}' : '')}>): import('svelte').SvelteComponent<${returnType('props')}, ${returnType('events')}, ${returnType('slots')}> & { $$bindings?: ${returnType('bindings')} } & ${returnType('exports')};\n` +
                `    ${genericsDef}(internal: unknown, props: ${propsType}): ${returnType('exports')};\n` +
                `    z_$$bindings?: ${bindingsType};\n` +
                `}\n` +
                `${doc}const ${className || '$$Component'}: $$IsomorphicComponent = null as any;\n` +
                surroundWithIgnoreComments(`type ${className || '$$Component'}${genericsDef} = InstanceType<typeof ${className || '$$Component'}${genericsRef}>;\n`) +
                `export default ${className || '$$Component'};`;
    }
    else if (mode === 'dts') {
        statement +=
            `export type ${PropsName}${genericsDef} = ${returnType('props')};\n` +
                `export type ${EventsName}${genericsDef} = ${returnType('events')};\n` +
                `export type ${SlotsName}${genericsDef} = ${returnType('slots')};\n` +
                `\n${doc}export default class${className ? ` ${className}` : ''}${genericsDef} extends ${svelteComponentClass}<${PropsName}${genericsRef}, ${EventsName}${genericsRef}, ${SlotsName}${genericsRef}> {` +
                exportedNames.createClassGetters(genericsRef) +
                (usesAccessors ? exportedNames.createClassAccessors() : '') +
                '\n}';
    }
    else {
        statement +=
            `\n\nimport { ${svelteComponentClass} as __SvelteComponentTyped__ } from "svelte" \n` +
                `${doc}export default class${className ? ` ${className}` : ''}${genericsDef} extends __SvelteComponentTyped__<${returnType('props')}, ${returnType('events')}, ${returnType('slots')}> {` +
                exportedNames.createClassGetters(genericsRef) +
                (usesAccessors ? exportedNames.createClassAccessors() : '') +
                '\n}';
    }
    str.append(statement);
}
function addSimpleComponentExport({ events, isTsFile, canHaveAnyProp, exportedNames, componentDocumentation, fileName, mode, usesAccessors, str, usesSlots, noSvelteComponentTyped, isSvelte5, hasTopLevelAwait }) {
    const renderCall = hasTopLevelAwait
        ? `$${internalHelpers.renderName}`
        : `${internalHelpers.renderName}()`;
    const awaitDeclaration = hasTopLevelAwait
        ? // tsconfig could disallow top-level await, so we need to wrap it in ignore
            surroundWithIgnoreComments(`const $${internalHelpers.renderName} = await ${internalHelpers.renderName}();`) + '\n'
        : '';
    const propDef = props(isTsFile, canHaveAnyProp, exportedNames, _events(events.hasStrictEvents(), renderCall));
    const doc = componentDocumentation.getFormatted();
    const className = fileName && classNameFromFilename(fileName, mode !== 'dts');
    const componentName = className || '$$Component';
    let statement;
    if (mode === 'dts') {
        if (isSvelte5 && exportedNames.isRunesMode() && !usesSlots && !events.hasEvents()) {
            statement =
                `\n${awaitDeclaration}${doc}const ${componentName} = __sveltets_2_fn_component(${renderCall});\n` +
                    `type ${componentName} = ReturnType<typeof ${componentName}>;\n` +
                    `export default ${componentName};`;
        }
        else if (isSvelte5) {
            // Inline definitions from Svelte shims; else dts files will reference the globals which will be unresolved
            statement =
                `\ninterface $$__sveltets_2_IsomorphicComponent<Props extends Record<string, any> = any, Events extends Record<string, any> = any, Slots extends Record<string, any> = any, Exports = {}, Bindings = string> {
    new (options: import('svelte').ComponentConstructorOptions<Props>): import('svelte').SvelteComponent<Props, Events, Slots> & { $$bindings?: Bindings } & Exports;
    (internal: unknown, props: ${!canHaveAnyProp && exportedNames.hasNoProps() ? '{$$events?: Events, $$slots?: Slots}' : 'Props & {$$events?: Events, $$slots?: Slots}'}): Exports & { $set?: any, $on?: any };
    z_$$bindings?: Bindings;
}\n` +
                    (usesSlots
                        ? `type $$__sveltets_2_PropsWithChildren<Props, Slots> = Props &
    (Slots extends { default: any }
        ? Props extends Record<string, never>
        ? any
        : { children?: any }
        : {});
        declare function $$__sveltets_2_isomorphic_component_slots<
            Props extends Record<string, any>, Events extends Record<string, any>, Slots extends Record<string, any>, Exports extends Record<string, any>, Bindings extends string
        >(klass: {props: Props, events: Events, slots: Slots, exports?: Exports, bindings?: Bindings }): $$__sveltets_2_IsomorphicComponent<$$__sveltets_2_PropsWithChildren<Props, Slots>, Events, Slots, Exports, Bindings>;\n`
                        : `
declare function $$__sveltets_2_isomorphic_component<
    Props extends Record<string, any>, Events extends Record<string, any>, Slots extends Record<string, any>, Exports extends Record<string, any>, Bindings extends string
>(klass: {props: Props, events: Events, slots: Slots, exports?: Exports, bindings?: Bindings }): $$__sveltets_2_IsomorphicComponent<Props, Events, Slots, Exports, Bindings>;\n`) +
                    `${awaitDeclaration}${doc}const ${componentName} = $$__sveltets_2_isomorphic_component${usesSlots ? '_slots' : ''}(${propDef});\n` +
                    surroundWithIgnoreComments(`type ${componentName} = InstanceType<typeof ${componentName}>;\n`) +
                    `export default ${componentName};`;
        }
        else if (isTsFile) {
            const svelteComponentClass = noSvelteComponentTyped
                ? 'SvelteComponent'
                : 'SvelteComponentTyped';
            const [PropsName, PropsExport] = addTypeExport(str, className, 'Props');
            const [EventsName, EventsExport] = addTypeExport(str, className, 'Events');
            const [SlotsName, SlotsExport] = addTypeExport(str, className, 'Slots');
            statement =
                `\nconst __propDef = ${propDef};\n` +
                    PropsExport +
                    EventsExport +
                    SlotsExport +
                    `\n${doc}export default class${className ? ` ${className}` : ''} extends ${svelteComponentClass}<${PropsName}, ${EventsName}, ${SlotsName}> {` +
                    exportedNames.createClassGetters() +
                    (usesAccessors ? exportedNames.createClassAccessors() : '') +
                    '\n}';
        }
        else {
            statement =
                `\nconst __propDef = ${propDef};\n` +
                    `/** @typedef {typeof __propDef.props}  ${className}Props */\n` +
                    `/** @typedef {typeof __propDef.events}  ${className}Events */\n` +
                    `/** @typedef {typeof __propDef.slots}  ${className}Slots */\n` +
                    `\n${doc}export default class${className ? ` ${className}` : ''} extends __sveltets_2_createSvelte2TsxComponent(${propDef}) {` +
                    exportedNames.createClassGetters() +
                    (usesAccessors ? exportedNames.createClassAccessors() : '') +
                    '\n}';
        }
    }
    else {
        if (isSvelte5) {
            if (exportedNames.isRunesMode() && !usesSlots && !events.hasEvents()) {
                statement =
                    `\n${awaitDeclaration}${doc}const ${componentName} = __sveltets_2_fn_component(${renderCall});\n` +
                        // Surround the type with ignore comments so it is filtered out from go-to-definition etc,
                        // which for some editors can cause duplicates
                        surroundWithIgnoreComments(`type ${componentName} = ReturnType<typeof ${componentName}>;\n`) +
                        `export default ${componentName};`;
            }
            else {
                statement =
                    `\n${awaitDeclaration}${doc}const ${componentName} = __sveltets_2_isomorphic_component${usesSlots ? '_slots' : ''}(${propDef});\n` +
                        surroundWithIgnoreComments(`type ${componentName} = InstanceType<typeof ${componentName}>;\n`) +
                        `export default ${componentName};`;
            }
        }
        else {
            statement =
                `\n\n${doc}export default class${className ? ` ${className}` : ''} extends __sveltets_2_createSvelte2TsxComponent(${propDef}) {` +
                    exportedNames.createClassGetters() +
                    (usesAccessors ? exportedNames.createClassAccessors() : '') +
                    '\n}';
        }
    }
    str.append(statement);
}
function addTypeExport(str, className, type) {
    const exportName = className + type;
    if (!new RegExp(`\\W${exportName}\\W`).test(str.original)) {
        return [
            exportName,
            `export type ${exportName} = typeof __propDef.${type.toLowerCase()};\n`
        ];
    }
    let replacement = exportName + '_';
    while (str.original.includes(replacement)) {
        replacement += '_';
    }
    if (
    // Check if there's already an export with the same name
    !new RegExp(`export ((const|let|var|class|interface|type) ${exportName}\\W|{[^}]*?${exportName}(}|\\W.*?}))`).test(str.original)) {
        return [
            replacement,
            `type ${replacement} = typeof __propDef.${type.toLowerCase()};\nexport { ${replacement} as ${exportName} };\n`
        ];
    }
    else {
        return [
            replacement,
            // we assume that the author explicitly named the type the same and don't export the generated type (which has an unstable name)
            `type ${replacement} = typeof __propDef.${type.toLowerCase()};\n`
        ];
    }
}
function _events(strictEvents, renderStr) {
    return strictEvents ? renderStr : `__sveltets_2_with_any_event(${renderStr})`;
}
function props(isTsFile, canHaveAnyProp, exportedNames, renderStr) {
    if (exportedNames.isRunesMode()) {
        return renderStr;
    }
    else if (isTsFile) {
        return canHaveAnyProp ? `__sveltets_2_with_any(${renderStr})` : renderStr;
    }
    else {
        const optionalProps = exportedNames.createOptionalPropsArray();
        const partial = `__sveltets_2_partial${canHaveAnyProp ? '_with_any' : ''}`;
        return optionalProps.length > 0
            ? `${partial}([${optionalProps.join(',')}], ${renderStr})`
            : `${partial}(${renderStr})`;
    }
}
/**
 * Returns a Svelte-compatible component name from a filename. Svelte
 * components must use capitalized tags, so we try to transform the filename.
 *
 * https://svelte.dev/docs#Tags
 */
function classNameFromFilename(filename, appendSuffix) {
    var _a;
    try {
        const withoutExtensions = (_a = path__default.parse(filename).name) === null || _a === void 0 ? void 0 : _a.split('.')[0];
        const withoutInvalidCharacters = withoutExtensions
            .split('')
            // Although "-" is invalid, we leave it in, pascal-case-handling will throw it out later
            .filter((char) => /[A-Za-z_\d-]/.test(char))
            .join('');
        const firstValidCharIdx = withoutInvalidCharacters
            .split('')
            // Although _ and $ are valid first characters for classes, they are invalid first characters
            // for tag names. For a better import autocompletion experience, we therefore throw them out.
            .findIndex((char) => /[A-Za-z]/.test(char));
        const withoutLeadingInvalidCharacters = withoutInvalidCharacters.substr(firstValidCharIdx);
        const inPascalCase = pascalCase(withoutLeadingInvalidCharacters);
        const finalName = firstValidCharIdx === -1 ? `A${inPascalCase}` : inPascalCase;
        return `${finalName}${appendSuffix ? COMPONENT_SUFFIX : ''}`;
    }
    catch (error) {
        console.warn(`Failed to create a name for the component class from filename ${filename}`);
        return undefined;
    }
}

function createRenderFunction({ str, scriptTag, scriptDestination, slots, events, exportedNames, uses$$props, uses$$restProps, uses$$slots, uses$$SlotsInterface, generics, hasTopLevelAwait, isTsFile, mode }) {
    const htmlx = str.original;
    let propsDecl = '';
    if (uses$$props) {
        propsDecl += ' let $$props = __sveltets_2_allPropsType();';
    }
    if (uses$$restProps) {
        propsDecl += ' let $$restProps = __sveltets_2_restPropsType();';
    }
    if (uses$$slots) {
        propsDecl +=
            ' let $$slots = __sveltets_2_slotsType({' +
                Array.from(slots.keys())
                    .map((name) => `'${name}': ''`)
                    .join(', ') +
                '});';
    }
    const slotsDeclaration = slots.size > 0 && mode !== 'dts'
        ? '\n' +
            surroundWithIgnoreComments(';const __sveltets_createSlot = __sveltets_2_createCreateSlot' +
                (uses$$SlotsInterface ? '<$$Slots>' : '') +
                '();')
        : '';
    if (scriptTag) {
        //I couldn't get magicstring to let me put the script before the <> we prepend during conversion of the template to jsx, so we just close it instead
        const scriptTagEnd = htmlx.lastIndexOf('>', scriptTag.content.start) + 1;
        str.overwrite(scriptTag.start, scriptTag.start + 1, ';');
        if (generics.genericsAttr) {
            let start = generics.genericsAttr.value[0].start;
            let end = generics.genericsAttr.value[0].end;
            if (htmlx.charAt(start) === '"' || htmlx.charAt(start) === "'") {
                start++;
                end--;
            }
            str.overwrite(scriptTag.start + 1, start - 1, `${hasTopLevelAwait ? 'async ' : ''}function ${internalHelpers.renderName}`);
            str.overwrite(start - 1, start, isTsFile ? '<' : `<${IGNORE_START_COMMENT}`); // if the generics are unused, only this char is colored opaque
            str.overwrite(end, scriptTagEnd, `>${isTsFile ? '' : IGNORE_END_COMMENT}() {${propsDecl}\n`);
        }
        else {
            str.overwrite(scriptTag.start + 1, scriptTagEnd, `${hasTopLevelAwait ? 'async ' : ''}function ${internalHelpers.renderName}${generics.toDefinitionString(true)}() {${propsDecl}\n`);
        }
        const scriptEndTagStart = htmlx.lastIndexOf('<', scriptTag.end - 1);
        // wrap template with callback
        str.overwrite(scriptEndTagStart, scriptTag.end, `${slotsDeclaration};\nasync () => {`, {
            contentOnly: true
        });
    }
    else {
        str.prependRight(scriptDestination, `;${hasTopLevelAwait ? 'async ' : ''}function ${internalHelpers.renderName}() {` +
            `${propsDecl}${slotsDeclaration}\nasync () => {`);
    }
    const slotsAsDef = uses$$SlotsInterface
        ? '{} as unknown as $$Slots'
        : '{' +
            Array.from(slots.entries())
                .map(([name, attrs]) => {
                return `'${name}': {${slotAttributesToString(attrs)}}`;
            })
                .join(', ') +
            '}';
    const returnString = `\nreturn { props: ${exportedNames.createPropsStr(uses$$props || uses$$restProps)}` +
        exportedNames.createExportsStr() +
        `, slots: ${slotsAsDef}` +
        `, events: ${events.toDefString()} }}`;
    // wrap template with callback
    str.append('};');
    str.append(returnString);
}
function slotAttributesToString(attrs) {
    return Array.from(attrs.entries())
        .map(([exportName, expr]) => exportName.startsWith('__spread__') ? `...${expr}` : `${exportName}:${expr}`)
        .join(', ');
}

/**
 * Prepends a string at the given index in a way that the source map maps the appended string
 * to the given character, not the previous character (as MagicString's other methods would).
 */
function preprendStr(str, index, toAppend, removeExisting) {
    const prepends = updatePrepends(str, index, toAppend, removeExisting);
    toAppend = prepends.join('');
    str.overwrite(index, index + 1, toAppend + str.original.charAt(index), { contentOnly: true });
    return str;
}
/**
 * Overwrites a string at the given range but also keeps the other preprends from `prependStr`
 * if not explicitly told otherwise.
 */
function overwriteStr(str, start, end, toOverwrite, removeExisting) {
    const prepends = updatePrepends(str, start, toOverwrite, removeExisting);
    toOverwrite = prepends.join('');
    str.overwrite(start, end, toOverwrite, { contentOnly: true });
    return str;
}
function updatePrepends(str, index, toAppend, removeExisting) {
    str.__prepends__ = str.__prepends__ || new Map();
    const prepends = removeExisting ? [] : str.__prepends__.get(index) || [];
    prepends.push(toAppend);
    str.__prepends__.set(index, prepends);
    return prepends;
}
/**
 * Returns the prepends that were added at the given index (if any).
 */
function getCurrentPrepends(str, index) {
    var _a;
    return ((_a = str.__prepends__) === null || _a === void 0 ? void 0 : _a.get(index)) || [];
}

/**
 * Collects all imports and module-level declarations to then find out which interfaces/types are hoistable.
 */
class HoistableInterfaces {
    constructor() {
        this.module_types = new Set();
        this.disallowed_types = new Set();
        this.disallowed_values = new Set();
        this.interface_map = new Map();
        this.props_interface = {
            name: '',
            node: null,
            type_deps: new Set(),
            value_deps: new Set()
        };
    }
    analyzeSnippets(rootSnippets) {
        let prev_disallowed_values_size;
        // we need to recalculate the disallowed values until they are stable because
        // one snippet might depend on another snippet which was previously hoistable
        while (prev_disallowed_values_size == null ||
            this.disallowed_values.size !== prev_disallowed_values_size) {
            prev_disallowed_values_size = this.disallowed_values.size;
            for (const [, , globals, name] of rootSnippets) {
                const hoist_to_module = globals.size === 0 ||
                    [...globals.keys()].every((id) => this.isAllowedReference(id));
                if (!hoist_to_module) {
                    this.disallowed_values.add(name);
                }
            }
        }
    }
    /** should be called before analyzeInstanceScriptNode */
    analyzeModuleScriptNode(node) {
        // Handle Import Declarations
        if (ts.isImportDeclaration(node) && node.importClause) {
            const is_type_only = node.importClause.isTypeOnly;
            if (node.importClause.namedBindings &&
                ts.isNamedImports(node.importClause.namedBindings)) {
                node.importClause.namedBindings.elements.forEach((element) => {
                    const import_name = element.name.text;
                    if (is_type_only || element.isTypeOnly) {
                        this.module_types.add(import_name);
                    }
                });
            }
            // Handle default imports
            if (node.importClause.name) {
                const default_import = node.importClause.name.text;
                if (is_type_only) {
                    this.module_types.add(default_import);
                }
            }
            // Handle namespace imports
            if (node.importClause.namedBindings &&
                ts.isNamespaceImport(node.importClause.namedBindings)) {
                const namespace_import = node.importClause.namedBindings.name.text;
                if (is_type_only) {
                    this.module_types.add(namespace_import);
                }
            }
        }
        if (ts.isTypeAliasDeclaration(node)) {
            this.module_types.add(node.name.text);
        }
        if (ts.isInterfaceDeclaration(node)) {
            this.module_types.add(node.name.text);
        }
        if (ts.isEnumDeclaration(node)) {
            this.module_types.add(node.name.text);
        }
        if (ts.isModuleDeclaration(node) && ts.isIdentifier(node.name)) {
            this.module_types.add(node.name.text);
        }
    }
    analyzeInstanceScriptNode(node) {
        var _a, _b, _c, _d, _e;
        // Handle Import Declarations
        if (ts.isImportDeclaration(node) && node.importClause) {
            const is_type_only = node.importClause.isTypeOnly;
            if (node.importClause.namedBindings &&
                ts.isNamedImports(node.importClause.namedBindings)) {
                node.importClause.namedBindings.elements.forEach((element) => {
                    const import_name = element.name.text;
                    if (is_type_only) {
                        this.module_types.add(import_name);
                    }
                });
            }
            // Handle default imports
            if (node.importClause.name) {
                const default_import = node.importClause.name.text;
                if (is_type_only) {
                    this.module_types.add(default_import);
                }
            }
            // Handle namespace imports
            if (node.importClause.namedBindings &&
                ts.isNamespaceImport(node.importClause.namedBindings)) {
                const namespace_import = node.importClause.namedBindings.name.text;
                if (is_type_only) {
                    this.module_types.add(namespace_import);
                }
            }
        }
        // Handle Interface Declarations
        if (ts.isInterfaceDeclaration(node)) {
            const interface_name = node.name.text;
            const type_dependencies = new Set();
            const value_dependencies = new Set();
            const generics = (_b = (_a = node.typeParameters) === null || _a === void 0 ? void 0 : _a.map((param) => param.name.text)) !== null && _b !== void 0 ? _b : [];
            node.members.forEach((member) => {
                if (ts.isPropertySignature(member) && member.type) {
                    this.collectTypeDependencies(member.type, type_dependencies, value_dependencies, generics);
                }
                else if (ts.isIndexSignatureDeclaration(member)) {
                    this.collectTypeDependencies(member.type, type_dependencies, value_dependencies, generics);
                    member.parameters.forEach((param) => {
                        this.collectTypeDependencies(param.type, type_dependencies, value_dependencies, generics);
                    });
                }
            });
            (_c = node.heritageClauses) === null || _c === void 0 ? void 0 : _c.forEach((clause) => {
                clause.types.forEach((type) => {
                    if (ts.isIdentifier(type.expression)) {
                        const type_name = type.expression.text;
                        if (!generics.includes(type_name)) {
                            type_dependencies.add(type_name);
                        }
                    }
                    this.collectTypeDependencies(type, type_dependencies, value_dependencies, generics);
                });
            });
            if (this.module_types.has(interface_name)) {
                // shadowed; we can't hoist
                this.disallowed_types.add(interface_name);
            }
            else {
                this.interface_map.set(interface_name, {
                    type_deps: type_dependencies,
                    value_deps: value_dependencies,
                    node
                });
            }
        }
        // Handle Type Alias Declarations
        if (ts.isTypeAliasDeclaration(node)) {
            const alias_name = node.name.text;
            const type_dependencies = new Set();
            const value_dependencies = new Set();
            const generics = (_e = (_d = node.typeParameters) === null || _d === void 0 ? void 0 : _d.map((param) => param.name.text)) !== null && _e !== void 0 ? _e : [];
            this.collectTypeDependencies(node.type, type_dependencies, value_dependencies, generics);
            if (this.module_types.has(alias_name)) {
                // shadowed; we can't hoist
                this.disallowed_types.add(alias_name);
            }
            else {
                this.interface_map.set(alias_name, {
                    type_deps: type_dependencies,
                    value_deps: value_dependencies,
                    node
                });
            }
        }
        // Handle top-level declarations: They could shadow module declarations; delete them from the set of allowed import values
        if (ts.isVariableStatement(node)) {
            node.declarationList.declarations.forEach((declaration) => {
                if (ts.isIdentifier(declaration.name)) {
                    this.disallowed_values.add(declaration.name.text);
                }
                else {
                    const walk = (node) => {
                        if (ts.isIdentifier(node) &&
                            ts.isBindingElement(node.parent) &&
                            node.parent.name === node) {
                            this.disallowed_values.add(node.text);
                        }
                        ts.forEachChild(node, walk);
                    };
                    walk(declaration.name);
                }
            });
        }
        if (ts.isFunctionDeclaration(node) && node.name) {
            this.disallowed_values.add(node.name.text);
        }
        if (ts.isClassDeclaration(node) && node.name) {
            this.disallowed_values.add(node.name.text);
        }
        if (ts.isEnumDeclaration(node)) {
            this.disallowed_values.add(node.name.text);
        }
        // namespace declaration should not be in the instance script.
        // Only adding the top-level name to the disallowed list,
        // so that at least there won't a confusing error message of "can't find namespace Foo"
        if (ts.isModuleDeclaration(node) && ts.isIdentifier(node.name)) {
            this.disallowed_types.add(node.name.text);
            this.disallowed_values.add(node.name.text);
        }
    }
    analyze$propsRune(node) {
        var _a, _b;
        if (((_a = node.initializer.typeArguments) === null || _a === void 0 ? void 0 : _a.length) > 0 || node.type) {
            const generic_arg = ((_b = node.initializer.typeArguments) === null || _b === void 0 ? void 0 : _b[0]) || node.type;
            if (ts.isTypeReferenceNode(generic_arg)) {
                const name = this.getEntityNameRoot(generic_arg.typeName);
                const interface_node = this.interface_map.get(name);
                if (interface_node) {
                    this.props_interface.name = name;
                    this.props_interface.type_deps = interface_node.type_deps;
                    this.props_interface.value_deps = interface_node.value_deps;
                }
            }
            else {
                this.props_interface.name = '$$ComponentProps';
                this.props_interface.node = generic_arg;
                this.collectTypeDependencies(generic_arg, this.props_interface.type_deps, this.props_interface.value_deps, []);
            }
        }
    }
    /**
     * Traverses the AST to collect import statements and top-level interfaces,
     * then determines which interfaces can be hoisted.
     * @param source_file The TypeScript source file to analyze.
     * @returns An object containing sets of value imports, type imports, and hoistable interfaces.
     */
    determineHoistableInterfaces() {
        const hoistable_interfaces = new Map();
        let progress = true;
        while (progress) {
            progress = false;
            for (const [interface_name, deps] of this.interface_map.entries()) {
                if (hoistable_interfaces.has(interface_name)) {
                    continue;
                }
                let can_hoist = true;
                for (const dep of deps.type_deps) {
                    if (this.disallowed_types.has(dep)) {
                        this.disallowed_types.add(interface_name);
                        can_hoist = false;
                        break;
                    }
                    if (this.interface_map.has(dep) && !hoistable_interfaces.has(dep)) {
                        can_hoist = false;
                    }
                }
                for (const dep of deps.value_deps) {
                    if (!this.isAllowedReference(dep)) {
                        this.disallowed_types.add(interface_name);
                        can_hoist = false;
                        break;
                    }
                }
                if (can_hoist) {
                    hoistable_interfaces.set(interface_name, deps.node);
                    progress = true;
                }
            }
        }
        if (this.props_interface.name === '$$ComponentProps') {
            const can_hoist = [
                ...this.props_interface.type_deps,
                ...this.props_interface.value_deps
            ].every((dep) => {
                return !this.disallowed_types.has(dep) && this.isAllowedReference(dep);
            });
            if (can_hoist) {
                hoistable_interfaces.set(this.props_interface.name, this.props_interface.node);
            }
        }
        return hoistable_interfaces;
    }
    /**
     * Moves all interfaces that can be hoisted to the top of the script, if the $props rune's type is hoistable.
     */
    moveHoistableInterfaces(str, astOffset, scriptStart, generics) {
        if (!this.props_interface.name)
            return;
        for (const generic of generics) {
            this.disallowed_types.add(generic);
        }
        const hoistable = this.determineHoistableInterfaces();
        if (hoistable.has(this.props_interface.name)) {
            for (const [name, node] of hoistable) {
                let pos = node.pos + astOffset;
                if (name === '$$ComponentProps') {
                    // So that organize imports doesn't mess with the types
                    str.prependRight(pos, '\n');
                }
                else {
                    // node.pos includes preceeding whitespace, which could mean we accidentally also move stuff appended to a previous node
                    if (str.original[pos] === '\r') {
                        pos++;
                    }
                    if (/\s/.test(str.original[pos])) {
                        pos++;
                    }
                    // jsdoc comments would be ignored if they are on the same line as the ;, so we add a newline, too.
                    // Also helps with organize imports not messing with the types
                    str.prependRight(pos, ';\n');
                    str.appendLeft(node.end + astOffset, ';');
                }
                str.move(pos, node.end + astOffset, scriptStart);
            }
            return hoistable;
        }
    }
    isAllowedReference(reference) {
        return !(this.disallowed_values.has(reference) ||
            reference === '$$props' ||
            reference === '$$restProps' ||
            reference === '$$slots' ||
            // could be a $store reference
            (reference[0] === '$' &&
                reference[1] !== '$' &&
                this.disallowed_values.has(reference.slice(1))));
    }
    /**
     * Collects type and value dependencies from a given TypeNode.
     * @param type_node The TypeNode to analyze.
     * @param type_dependencies The set to collect type dependencies into.
     * @param value_dependencies The set to collect value dependencies into.
     */
    collectTypeDependencies(type_node, type_dependencies, value_dependencies, generics) {
        const walk = (node) => {
            if (ts.isTypeReferenceNode(node)) {
                const type_name = this.getEntityNameRoot(node.typeName);
                if (!generics.includes(type_name)) {
                    type_dependencies.add(type_name);
                }
            }
            else if (ts.isTypeQueryNode(node)) {
                // Handle 'typeof' expressions: e.g., foo: typeof bar
                value_dependencies.add(this.getEntityNameRoot(node.exprName));
            }
            ts.forEachChild(node, walk);
        };
        walk(type_node);
    }
    /**
     * Retrieves the top-level variable/namespace of an EntityName (handles nested names).
     * ex: `foo.bar.baz` -> `foo`
     * @param entity_name The EntityName to extract text from.
     * @returns The top-level name as a string.
     */
    getEntityNameRoot(entity_name) {
        if (ts.isIdentifier(entity_name)) {
            return entity_name.text;
        }
        else {
            return this.getEntityNameRoot(entity_name.left);
        }
    }
}

function is$$PropsDeclaration(node) {
    return isInterfaceOrTypeDeclaration(node) && node.name.text === '$$Props';
}
class ExportedNames {
    constructor(str, astOffset, basename, isTsFile, isSvelte5Plus, isRunes) {
        this.str = str;
        this.astOffset = astOffset;
        this.basename = basename;
        this.isTsFile = isTsFile;
        this.isSvelte5Plus = isSvelte5Plus;
        this.isRunes = isRunes;
        this.hoistableInterfaces = new HoistableInterfaces();
        this.usesAccessors = false;
        /**
         * Uses the `$$Props` type
         */
        this.uses$$Props = false;
        /**
         * Component contains globals that have a rune name
         */
        this.hasRunesGlobals = false;
        /**
         * The `$props()` rune's type info as a string, if it exists.
         * If using TS, this returns the generic string, if using JS, returns the `@type {..}` string.
         */
        this.$props = {
            /** The JSDoc type; not set when TS type exists */
            comment: '',
            /** The TS type */
            type: '',
            bindings: []
        };
        /** Map of all props and exports. Exposing it publicly is no longer necessary for runes mode */
        this.exports = new Map();
        this.possibleExports = new Map();
        this.doneDeclarationTransformation = new Set();
        this.getters = new Set();
    }
    handleVariableStatement(node, parent) {
        const exportModifier = findExportKeyword(node);
        if (exportModifier) {
            const isLet = node.declarationList.flags === ts.NodeFlags.Let;
            const isConst = node.declarationList.flags === ts.NodeFlags.Const;
            this.handleExportedVariableDeclarationList(node.declarationList, (_, ...args) => this.addExportForBindingPattern(...args));
            if (isLet) {
                this.propTypeAssertToUserDefined(node.declarationList);
            }
            else if (isConst) {
                node.declarationList.forEachChild((n) => {
                    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name)) {
                        this.addGetter(n.name);
                        const type = n.type || ts.getJSDocType(n);
                        const isKitExport = internalHelpers.isKitRouteFile(this.basename) &&
                            n.name.getText() === 'snapshot';
                        // TS types are not allowed in JS files, but TS will still pick it up and the ignore comment will filter out the error
                        const kitType = isKitExport && !type ? `: import('./$types.js').Snapshot` : '';
                        const nameEnd = n.name.end + this.astOffset;
                        if (kitType) {
                            preprendStr(this.str, nameEnd, surroundWithIgnoreComments(kitType));
                        }
                    }
                });
            }
            this.removeExport(exportModifier.getStart(), exportModifier.end);
        }
        else if (ts.isSourceFile(parent)) {
            this.handleExportedVariableDeclarationList(node.declarationList, this.addPossibleExport.bind(this));
            for (const declaration of node.declarationList.declarations) {
                if (declaration.initializer !== undefined &&
                    ts.isCallExpression(declaration.initializer) &&
                    declaration.initializer.expression.getText() === '$props') {
                    // @ts-expect-error TS is too stupid to narrow this properly
                    this.handle$propsRune(declaration);
                    break;
                }
            }
        }
    }
    handleExportFunctionOrClass(node) {
        const exportModifier = findExportKeyword(node);
        if (!exportModifier) {
            return;
        }
        this.removeExport(exportModifier.getStart(), exportModifier.end);
        this.addGetter(node.name);
        // Can't export default here
        if (node.name) {
            this.addExport(node.name, false);
        }
    }
    handleExportDeclaration(node) {
        const { exportClause } = node;
        if (ts.isNamedExports(exportClause)) {
            for (const ne of exportClause.elements) {
                if (ne.propertyName) {
                    this.addExport(ne.propertyName, false, ne.name, undefined, undefined, true);
                }
                else {
                    this.addExport(ne.name, false, undefined, undefined, undefined, true);
                }
            }
            //we can remove entire statement
            this.removeExport(node.getStart(), node.end);
        }
    }
    handle$propsRune(node) {
        var _a, _b;
        // Check if the $props() rune uses $bindable()
        if (ts.isObjectBindingPattern(node.name)) {
            for (const element of node.name.elements) {
                if (ts.isIdentifier(element.name) &&
                    (!element.propertyName || ts.isIdentifier(element.propertyName)) &&
                    !element.dotDotDotToken) {
                    const name = element.propertyName
                        ? element.propertyName.text
                        : element.name.text;
                    if (element.initializer) {
                        let call = element.initializer;
                        // if it's an as expression we need to check wether the as
                        // expression expression is a call
                        if (ts.isAsExpression(call)) {
                            call = call.expression;
                        }
                        if (ts.isCallExpression(call) && ts.isIdentifier(call.expression)) {
                            if (call.expression.text === '$bindable') {
                                this.$props.bindings.push(name);
                            }
                        }
                    }
                }
            }
        }
        if (this.$props.bindings.length > 0) {
            this.str.appendLeft(node.end + this.astOffset, surroundWithIgnoreComments(';' + this.$props.bindings.map((prop) => prop + ';').join('')));
        }
        // Easy mode: User uses TypeScript and typed the $props() rune
        if (((_a = node.initializer.typeArguments) === null || _a === void 0 ? void 0 : _a.length) > 0 || node.type) {
            this.hoistableInterfaces.analyze$propsRune(node);
            const generic_arg = ((_b = node.initializer.typeArguments) === null || _b === void 0 ? void 0 : _b[0]) || node.type;
            const generic = generic_arg.getText();
            if (ts.isTypeReferenceNode(generic_arg)) {
                this.$props.type = generic;
            }
            else {
                // Create a virtual type alias for the unnamed generic and reuse it for the props return type
                // so that rename, find references etc works seamlessly across components
                this.$props.type = '$$ComponentProps';
                preprendStr(this.str, generic_arg.pos + this.astOffset, `;type ${this.$props.type} = `);
                this.str.appendLeft(generic_arg.end + this.astOffset, ';');
                this.str.move(generic_arg.pos + this.astOffset, generic_arg.end + this.astOffset, node.parent.pos + this.astOffset);
                this.str.appendRight(generic_arg.end + this.astOffset, 
                // so that semantic tokens ignore it, preventing an overlap of tokens
                surroundWithIgnoreComments(this.$props.type));
            }
            return;
        }
        // Hard mode: User uses JSDoc or didn't type the $props() rune
        if (!this.isTsFile) {
            const text = node.getSourceFile().getFullText();
            let start = -1;
            let comment;
            // reverse because we want to look at the last comment before the node first
            for (const c of [...(ts.getLeadingCommentRanges(text, node.pos) || [])].reverse()) {
                const potential_match = text.substring(c.pos, c.end);
                if (/@type\b/.test(potential_match)) {
                    comment = potential_match;
                    start = c.pos + this.astOffset;
                    break;
                }
            }
            if (!comment) {
                for (const c of [
                    ...(ts.getLeadingCommentRanges(text, node.parent.pos) || []).reverse()
                ]) {
                    const potential_match = text.substring(c.pos, c.end);
                    if (/@type\b/.test(potential_match)) {
                        comment = potential_match;
                        start = c.pos + this.astOffset;
                        break;
                    }
                }
            }
            if (comment && /\/\*\*[^@]*?@type\s*{\s*{.*}\s*}\s*\*\//.test(comment)) {
                // Create a virtual type alias for the unnamed generic and reuse it for the props return type
                // so that rename, find references etc works seamlessly across components
                this.$props.comment = '/** @type {$$ComponentProps} */';
                const type_start = this.str.original.indexOf('@type', start);
                this.str.overwrite(type_start, type_start + 5, '@typedef');
                const end = this.str.original.indexOf('*/', start);
                this.str.overwrite(end, end + 2, ' $$ComponentProps */' + this.$props.comment);
            }
            else {
                // Complex comment or simple `@type {AType}` comment which we just use as-is.
                // For the former this means things like rename won't work properly across components.
                this.$props.comment = comment || '';
            }
        }
        if (this.$props.comment) {
            // User uses JsDoc
            return;
        }
        // Do a best-effort to extract the props from the object literal
        let propsStr = '';
        let withUnknown = false;
        let props = [];
        const isKitRouteFile = internalHelpers.isKitRouteFile(this.basename);
        const isKitLayoutFile = isKitRouteFile && this.basename.includes('layout');
        if (ts.isObjectBindingPattern(node.name)) {
            for (const element of node.name.elements) {
                if (!ts.isIdentifier(element.name) ||
                    (element.propertyName && !ts.isIdentifier(element.propertyName)) ||
                    !!element.dotDotDotToken) {
                    withUnknown = true;
                }
                else {
                    const name = element.propertyName
                        ? element.propertyName.text
                        : element.name.text;
                    if (isKitRouteFile) {
                        // TODO once we know we can assume SvelteKit 2.16+, simplify this to always using LayoutProps/PageProps
                        if (name === 'data') {
                            props.push(`data: import('./$types.js').${isKitLayoutFile ? 'LayoutData' : 'PageData'}`);
                        }
                        if (name === 'form' && !isKitLayoutFile) {
                            props.push(`form: import('./$types.js').ActionData`);
                        }
                        if (name === 'params') {
                            props.push(`params: import('./$types.js').${isKitLayoutFile ? 'LayoutProps' : 'PageProps'}['params']`);
                        }
                    }
                    else if (element.initializer) {
                        const initializer = ts.isCallExpression(element.initializer) &&
                            ts.isIdentifier(element.initializer.expression) &&
                            element.initializer.expression.text === '$bindable'
                            ? element.initializer.arguments[0]
                            : element.initializer;
                        const type = !initializer
                            ? 'any'
                            : ts.isAsExpression(initializer)
                                ? initializer.type.getText()
                                : ts.isStringLiteral(initializer)
                                    ? 'string'
                                    : ts.isNumericLiteral(initializer)
                                        ? 'number'
                                        : initializer.kind === ts.SyntaxKind.TrueKeyword ||
                                            initializer.kind === ts.SyntaxKind.FalseKeyword
                                            ? 'boolean'
                                            : ts.isIdentifier(initializer) &&
                                                initializer.text !== 'undefined'
                                                ? `typeof ${initializer.text}`
                                                : ts.isArrowFunction(initializer)
                                                    ? 'Function'
                                                    : ts.isObjectLiteralExpression(initializer)
                                                        ? 'Record<string, any>'
                                                        : ts.isArrayLiteralExpression(initializer)
                                                            ? 'any[]'
                                                            : 'any';
                        props.push(`${name}?: ${type}`);
                    }
                    else {
                        props.push(`${name}: any`);
                    }
                }
            }
            if (isKitLayoutFile) {
                props.push(`children: import('svelte').Snippet`);
            }
            if (props.length > 0) {
                propsStr =
                    `{ ${props.join(', ')} }` + (withUnknown ? ' & Record<string, any>' : '');
            }
            else if (withUnknown) {
                propsStr = 'Record<string, any>';
            }
            else {
                propsStr = 'Record<string, never>';
            }
        }
        else {
            propsStr = 'Record<string, any>';
        }
        // Create a virtual type alias for the unnamed generic and reuse it for the props return type
        // so that rename, find references etc works seamlessly across components
        if (this.isTsFile) {
            this.$props.type = '$$ComponentProps';
            if (props.length > 0 || withUnknown) {
                preprendStr(this.str, node.parent.pos + this.astOffset, surroundWithIgnoreComments(`;type $$ComponentProps = ${propsStr};`));
                preprendStr(this.str, node.name.end + this.astOffset, `: ${this.$props.type}`);
            }
        }
        else {
            this.$props.comment = '/** @type {$$ComponentProps} */';
            if (props.length > 0 || withUnknown) {
                preprendStr(this.str, node.pos + this.astOffset, `/** @typedef {${propsStr}} $$ComponentProps */${this.$props.comment}`);
            }
        }
    }
    removeExport(start, end) {
        const exportStart = this.str.original.indexOf('export', start + this.astOffset);
        const exportEnd = exportStart + (end - start);
        this.str.remove(exportStart, exportEnd);
    }
    /**
     * Appends `prop = __sveltets_2_any(prop)`  to given declaration in order to
     * trick TS into widening the type. Else for example `let foo: string | undefined = undefined`
     * is narrowed to `undefined` by TS.
     */
    propTypeAssertToUserDefined(node) {
        if (this.doneDeclarationTransformation.has(node)) {
            return;
        }
        const handleTypeAssertion = (declaration) => {
            const identifier = declaration.name;
            const tsType = declaration.type;
            const jsDocType = ts.getJSDocType(declaration);
            const type = tsType || jsDocType;
            const name = identifier.getText();
            const isKitExport = internalHelpers.isKitRouteFile(this.basename) &&
                (name === 'data' || name === 'form' || name === 'snapshot');
            // TS types are not allowed in JS files, but TS will still pick it up and the ignore comment will filter out the error
            const kitType = isKitExport && !type
                ? `: import('./$types.js').${name === 'data'
                    ? this.basename.includes('layout')
                        ? 'LayoutData'
                        : 'PageData'
                    : name === 'form'
                        ? 'ActionData'
                        : 'Snapshot'}`
                : '';
            const nameEnd = identifier.end + this.astOffset;
            const end = declaration.end + this.astOffset;
            if (ts.isIdentifier(identifier) &&
                // Ensure initialization for proper control flow and to avoid "possibly undefined" type errors.
                // Also ensure prop is typed as any with a type annotation in TS strict mode
                (!declaration.initializer ||
                    // Widen the type, else it's narrowed to the initializer
                    type ||
                    // Edge case: TS infers `export let bla = false` to type `false`.
                    // prevent that by adding the any-wrap in this case, too.
                    (!type &&
                        [ts.SyntaxKind.FalseKeyword, ts.SyntaxKind.TrueKeyword].includes(declaration.initializer.kind)))) {
                const name = identifier.getText();
                if (nameEnd === end) {
                    preprendStr(this.str, end, surroundWithIgnoreComments(`${kitType};${name} = __sveltets_2_any(${name});`));
                }
                else {
                    if (kitType) {
                        preprendStr(this.str, nameEnd, surroundWithIgnoreComments(kitType));
                    }
                    preprendStr(this.str, end, surroundWithIgnoreComments(`;${name} = __sveltets_2_any(${name});`));
                }
            }
            else if (kitType) {
                preprendStr(this.str, nameEnd, surroundWithIgnoreComments(kitType));
            }
        };
        const findComma = (target) => target.getChildren().filter((child) => child.kind === ts.SyntaxKind.CommaToken);
        const splitDeclaration = () => {
            const commas = node
                .getChildren()
                .filter((child) => child.kind === ts.SyntaxKind.SyntaxList)
                .map(findComma)
                .reduce((current, previous) => [...current, ...previous], []);
            commas.forEach((comma) => {
                const start = comma.getStart() + this.astOffset;
                const end = comma.getEnd() + this.astOffset;
                overwriteStr(this.str, start, end, ';let ');
            });
        };
        for (const declaration of node.declarations) {
            handleTypeAssertion(declaration);
        }
        // need to be append after the type assert treatment
        splitDeclaration();
        this.doneDeclarationTransformation.add(node);
    }
    handleExportedVariableDeclarationList(list, add) {
        const isLet = list.flags === ts.NodeFlags.Let;
        ts.forEachChild(list, (node) => {
            if (ts.isVariableDeclaration(node)) {
                if (ts.isIdentifier(node.name)) {
                    add(list, node.name, isLet, node.name, node.type, !node.initializer);
                }
                else if (ts.isObjectBindingPattern(node.name) ||
                    ts.isArrayBindingPattern(node.name)) {
                    ts.forEachChild(node.name, (element) => {
                        if (ts.isBindingElement(element)) {
                            add(list, element.name, isLet);
                        }
                    });
                }
            }
        });
    }
    addGetter(node) {
        if (!node) {
            return;
        }
        this.getters.add(node.text);
    }
    createClassGetters(generics = '') {
        if (this.isRunesMode()) {
            // In runes mode, exports are no longer part of props
            return Array.from(this.getters)
                .map((name) => `\n    get ${name}() { return ${internalHelpers.renderName}${generics}().exports.${name} }`)
                .join('');
        }
        else {
            return Array.from(this.getters)
                .map((name) => 
            // getters are const/classes/functions, which are always defined.
            // We have to remove the `| undefined` from the type here because it was necessary to
            // be added in a previous step so people are not expected to provide these as props.
            `\n    get ${name}() { return __sveltets_2_nonNullable(this.$$prop_def.${name}) }`)
                .join('');
        }
    }
    createClassAccessors() {
        const accessors = [];
        for (const value of this.exports.values()) {
            if (this.getters.has(value.identifierText)) {
                continue;
            }
            accessors.push(value.identifierText);
        }
        return accessors
            .map((name) => `\n    get ${name}() { return this.$$prop_def.${name} }` +
            `\n    /**accessor*/\n    set ${name}(_) {}`)
            .join('');
    }
    /**
     * Marks a top level declaration as a possible export
     * which could be exported through `export { .. }` later.
     */
    addPossibleExport(declaration, name, isLet, target = null, type = null, required = false) {
        if (!ts.isIdentifier(name)) {
            return;
        }
        if (target && ts.isIdentifier(target)) {
            this.possibleExports.set(name.text, {
                declaration,
                isLet,
                type: type === null || type === void 0 ? void 0 : type.getText(),
                identifierText: target.text,
                required,
                doc: this.getDoc(target)
            });
        }
        else {
            this.possibleExports.set(name.text, {
                declaration,
                isLet
            });
        }
    }
    /**
     * Adds export to map
     */
    addExport(name, isLet, target = null, type = null, required = false, isNamedExport = false) {
        const existingDeclaration = this.possibleExports.get(name.text);
        if (target) {
            this.exports.set(name.text, {
                isLet: isLet || (existingDeclaration === null || existingDeclaration === void 0 ? void 0 : existingDeclaration.isLet),
                type: (type === null || type === void 0 ? void 0 : type.getText()) || (existingDeclaration === null || existingDeclaration === void 0 ? void 0 : existingDeclaration.type),
                identifierText: target.text,
                required: required || (existingDeclaration === null || existingDeclaration === void 0 ? void 0 : existingDeclaration.required),
                doc: this.getDoc(target) || (existingDeclaration === null || existingDeclaration === void 0 ? void 0 : existingDeclaration.doc),
                isNamedExport
            });
        }
        else {
            this.exports.set(name.text, {
                isLet: isLet || (existingDeclaration === null || existingDeclaration === void 0 ? void 0 : existingDeclaration.isLet),
                type: existingDeclaration === null || existingDeclaration === void 0 ? void 0 : existingDeclaration.type,
                required: existingDeclaration === null || existingDeclaration === void 0 ? void 0 : existingDeclaration.required,
                doc: existingDeclaration === null || existingDeclaration === void 0 ? void 0 : existingDeclaration.doc,
                isNamedExport
            });
        }
        if (existingDeclaration === null || existingDeclaration === void 0 ? void 0 : existingDeclaration.isLet) {
            this.propTypeAssertToUserDefined(existingDeclaration.declaration);
        }
    }
    addExportForBindingPattern(name, isLet, target = null, type = null, required = false) {
        if (ts.isIdentifier(name)) {
            if (!target || ts.isIdentifier(target)) {
                this.addExport(name, isLet, target, type, required);
            }
            return;
        }
        name.elements.forEach((child) => {
            this.addExportForBindingPattern(child.name, isLet, undefined, type, required);
        });
    }
    getDoc(target) {
        var _a, _b;
        let doc = undefined;
        // Traverse `a` one up. If the declaration is part of a declaration list,
        // the comment is at this point already
        const variableDeclaration = target === null || target === void 0 ? void 0 : target.parent;
        // Traverse `a` up to `export let a`
        const exportExpr = (_b = (_a = target === null || target === void 0 ? void 0 : target.parent) === null || _a === void 0 ? void 0 : _a.parent) === null || _b === void 0 ? void 0 : _b.parent;
        if (variableDeclaration) {
            doc = getLastLeadingDoc(variableDeclaration);
        }
        if (exportExpr && !doc) {
            doc = getLastLeadingDoc(exportExpr);
        }
        return doc;
    }
    /**
     * Creates a string from the collected props
     *
     * @param uses$$propsOr$$restProps whether the file references the $$props or $$restProps variable
     */
    createPropsStr(uses$$propsOr$$restProps) {
        const names = Array.from(this.exports.entries());
        if (this.isRunesMode()) {
            if (this.$props.type) {
                return '{} as any as ' + this.$props.type;
            }
            if (this.$props.comment) {
                return this.$props.comment + '({})';
            }
            // Necessary, because {} roughly equals to any
            return this.isTsFile
                ? '{} as Record<string, never>'
                : '/** @type {Record<string, never>} */ ({})';
        }
        if (this.uses$$Props) {
            const lets = names.filter(([, { isLet }]) => isLet);
            const others = names.filter(([, { isLet }]) => !isLet);
            // - The check if $$Props is assignable to exports is necessary to make sure no extraneous props
            //   are defined and that no props are required that should be optional
            // - The check if exports are assignable to $$Props is not done because a component should be allowed
            //   to use less props than defined (it just ignores them)
            // - __sveltets_2_ensureRightProps needs to be declared in a way that doesn't affect the type result of props
            return ('{ ...__sveltets_2_ensureRightProps<{' +
                this.createReturnElementsType(lets).join(',') +
                '}>(__sveltets_2_any("") as $$Props)} as ' +
                // We add other exports of classes and functions here because
                // they need to appear in the props object in order to properly
                // type bind:xx but they are not needed to be part of $$Props
                (others.length
                    ? '{' + this.createReturnElementsType(others).join(',') + '} & '
                    : '') +
                '$$Props');
        }
        if (names.length === 0 && !uses$$propsOr$$restProps) {
            // Necessary, because {} roughly equals to any
            return this.isTsFile
                ? '{} as Record<string, never>'
                : '/** @type {Record<string, never>} */ ({})';
        }
        const dontAddTypeDef = !this.isTsFile || names.every(([_, value]) => !value.type && value.required);
        const returnElements = this.createReturnElements(names, dontAddTypeDef);
        if (dontAddTypeDef) {
            // Only `typeof` exports -> omit the `as {...}` completely.
            // If not TS, omit the types to not have a "cannot use types in jsx" error.
            return `{${returnElements.join(' , ')}}`;
        }
        const returnElementsType = this.createReturnElementsType(names);
        return `{${returnElements.join(' , ')}} as {${returnElementsType.join(', ')}}`;
    }
    hasNoProps() {
        if (this.isRunesMode()) {
            return !this.$props.type && !this.$props.comment;
        }
        const names = Array.from(this.exports.entries());
        return names.length === 0;
    }
    createBindingsStr() {
        if (this.isRunesMode()) {
            // will be just the empty strings for zero bindings, which is impossible to create a binding for, so it works out fine
            return `__sveltets_$$bindings('${this.$props.bindings.join("', '")}')`;
        }
        else {
            return '""';
        }
    }
    /**
     * In runes mode, exports are no longer part of props because you cannot `bind:` to them,
     * which is why we need a separate return type for them. In Svelte 5, the isomorphic component
     * needs them separate, too.
     */
    createExportsStr() {
        const names = Array.from(this.exports.entries());
        const others = names.filter(([, { isLet, isNamedExport }]) => !isLet || (this.isRunesMode() && isNamedExport));
        const needsAccessors = this.usesAccessors && names.length > 0 && !this.isRunesMode(); // runes mode doesn't support accessors
        if (this.isSvelte5Plus) {
            let str = '';
            if (others.length > 0 || this.isRunesMode() || needsAccessors) {
                const exports = needsAccessors ? names : others;
                if (others.length > 0 || needsAccessors) {
                    if (this.isTsFile) {
                        str +=
                            // Reference imports that have a type, else they are marked as unused if nothing in the component references them
                            `, exports: {${this.createReturnElements(this.isRunesMode() ? others : [], false, true)}} as any as { ` +
                                this.createReturnElementsType(exports, undefined, true).join(',') +
                                ' }';
                    }
                    else {
                        str += `, exports: /** @type {{${this.createReturnElementsType(exports, false, true)}}} */ ({})`;
                    }
                }
                else {
                    // Always add that, in TS5.5+ the type for Exports is infered to never when this is not present, which breaks types.
                    // Don't cast to `Record<string, never>` because that will break the union type we use elsewhere
                    str += ', exports: {}';
                }
                str += `, bindings: ${this.createBindingsStr()}`;
            }
            else {
                // always add that, in TS5.5+ the type for Exports is infered to never when this is not present, which breaks types
                str += `, exports: {}, bindings: ${this.createBindingsStr()}`;
            }
            return str;
        }
        return '';
    }
    createReturnElements(names, dontAddTypeDef, onlyTyped = false) {
        return names
            .map(([key, value]) => {
            if (onlyTyped && !value.type)
                return;
            // Important to not use shorthand props for rename functionality
            return `${dontAddTypeDef && value.doc ? `\n${value.doc}` : ''}${value.identifierText || key}: ${key}`;
        })
            .filter(Boolean);
    }
    createReturnElementsType(names, addDoc = true, forceRequired = false) {
        return names.map(([key, value]) => {
            const identifier = `${value.doc && addDoc ? `\n${value.doc}` : ''}${value.identifierText || key}${value.required || forceRequired ? '' : '?'}`;
            if (!value.type) {
                return `${identifier}: typeof ${key}`;
            }
            return `${identifier}: ${value.type}`;
        });
    }
    createOptionalPropsArray() {
        if (this.isRunesMode()) {
            return [];
        }
        else {
            return Array.from(this.exports.entries())
                .filter(([_, entry]) => !entry.required)
                .map(([name, entry]) => `'${entry.identifierText || name}'`);
        }
    }
    getExportsMap() {
        return this.exports;
    }
    hasExports() {
        const names = Array.from(this.exports.entries());
        return this.usesAccessors ? names.length > 0 : names.some(([, { isLet }]) => !isLet);
    }
    hasPropsRune() {
        return this.isSvelte5Plus && !!(this.$props.type || this.$props.comment);
    }
    checkGlobalsForRunes(globals) {
        const runes = ['$state', '$derived', '$effect']; // no need to check for props, already handled through other means in here
        this.hasRunesGlobals =
            this.isSvelte5Plus && globals.some((global) => runes.includes(global));
    }
    enterRunesMode() {
        this.isRunes = true;
    }
    /**
     * True if uses runes or top level await or await in template expressions
     */
    isRunesMode() {
        return this.hasRunesGlobals || this.hasPropsRune() || this.isRunes;
    }
}

/**
 * Throw an error with start/end pos like the Svelte compiler does
 */
function throwError(start, end, message, code) {
    const error = new Error(message);
    error.start = positionAt(start, code);
    error.end = positionAt(end, code);
    throw error;
}
/**
 * Get the line (1-offset) and character (0-offset) based on the offset
 * @param offset The index of the position
 * @param text The text for which the position should be retrived
 */
function positionAt(offset, text) {
    offset = clamp(offset, 0, text.length);
    const lineOffsets = getLineOffsets(text);
    let low = 0;
    let high = lineOffsets.length;
    if (high === 0) {
        return { line: 1, column: offset };
    }
    while (low < high) {
        const mid = Math.floor((low + high) / 2);
        if (lineOffsets[mid] > offset) {
            high = mid;
        }
        else {
            low = mid + 1;
        }
    }
    // low is the least x for which the line offset is larger than the current offset
    // or array.length if no line offset is larger than the current offset
    return { line: low, column: offset - lineOffsets[low - 1] };
}
function clamp(num, min, max) {
    return Math.max(min, Math.min(max, num));
}
function getLineOffsets(text) {
    const lineOffsets = [];
    let isLineStart = true;
    for (let i = 0; i < text.length; i++) {
        if (isLineStart) {
            lineOffsets.push(i);
            isLineStart = false;
        }
        const ch = text.charAt(i);
        isLineStart = ch === '\r' || ch === '\n';
        if (ch === '\r' && i + 1 < text.length && text.charAt(i + 1) === '\n') {
            i++;
        }
    }
    if (isLineStart && text.length > 0) {
        lineOffsets.push(text.length);
    }
    return lineOffsets;
}

class Generics {
    constructor(str, astOffset, script) {
        var _a, _b, _c, _d;
        this.str = str;
        this.astOffset = astOffset;
        /** The whole `T extends boolean` */
        this.definitions = [];
        this.typeReferences = [];
        /** The `T` in `T extends boolean` */
        this.references = [];
        this.genericsAttr = script.attributes.find((attr) => attr.name === 'generics');
        const generics = (_b = (_a = this.genericsAttr) === null || _a === void 0 ? void 0 : _a.value[0]) === null || _b === void 0 ? void 0 : _b.raw;
        if (generics) {
            const typeParameters = this.getGenericTypeParameters(generics);
            this.definitions = (_c = typeParameters === null || typeParameters === void 0 ? void 0 : typeParameters.map((param) => param.getText())) !== null && _c !== void 0 ? _c : [];
            this.references = (_d = typeParameters === null || typeParameters === void 0 ? void 0 : typeParameters.map((param) => param.name.getText())) !== null && _d !== void 0 ? _d : [];
        }
        else {
            this.genericsAttr = undefined;
        }
    }
    getGenericTypeParameters(rawGenericsAttr) {
        const sourceFile = ts.createSourceFile('index.ts', `<${rawGenericsAttr}>() => {}`, ts.ScriptTarget.Latest, true);
        const firstStatement = sourceFile.statements[0];
        if (!firstStatement || !ts.isExpressionStatement(firstStatement)) {
            return;
        }
        const arrowFunction = firstStatement.expression;
        if (!ts.isArrowFunction(arrowFunction)) {
            return;
        }
        return arrowFunction.typeParameters;
    }
    addIfIsGeneric(node) {
        var _a, _b;
        if (ts.isTypeAliasDeclaration(node) && this.is$$GenericType(node.type)) {
            if (this.genericsAttr) {
                throw new Error('Invalid $$Generic declaration: $$Generic definitions are not allowed when the generics attribute is present on the script tag');
            }
            if (((_a = node.type.typeArguments) === null || _a === void 0 ? void 0 : _a.length) > 1) {
                throw new Error('Invalid $$Generic declaration: Only one type argument allowed');
            }
            if (((_b = node.type.typeArguments) === null || _b === void 0 ? void 0 : _b.length) === 1) {
                const typeReference = node.type.typeArguments[0].getText();
                this.typeReferences.push(typeReference);
                this.definitions.push(`${node.name.text} extends ${typeReference}`);
            }
            else {
                this.definitions.push(node.name.text);
            }
            this.references.push(node.name.text);
            this.str.remove(this.astOffset + node.getStart(), this.astOffset + node.getEnd());
        }
    }
    throwIfIsGeneric(node) {
        if (ts.isTypeAliasDeclaration(node) && this.is$$GenericType(node.type)) {
            throwError(this.astOffset + node.getStart(), this.astOffset + node.getEnd(), '$$Generic declarations are only allowed in the instance script', this.str.original);
        }
    }
    is$$GenericType(node) {
        return (ts.isTypeReferenceNode(node) &&
            ts.isIdentifier(node.typeName) &&
            node.typeName.text === '$$Generic');
    }
    getTypeReferences() {
        return this.typeReferences;
    }
    getReferences() {
        return this.references;
    }
    toDefinitionString(addIgnore = false) {
        const surround = addIgnore ? surroundWithIgnoreComments : (str) => str;
        return this.definitions.length ? surround(`<${this.definitions.join(',')}>`) : '';
    }
    toReferencesString() {
        return this.references.length ? `<${this.references.join(',')}>` : '';
    }
    toReferencesAnyString() {
        return this.references.length ? `<${this.references.map(() => 'any').join(',')}>` : '';
    }
    has() {
        return this.definitions.length > 0;
    }
}

/**
 * Tracks all store-usages as well as all variable declarations and imports in the component.
 *
 * In the modification-step at the end, all variable declarations and imports which
 * were used as stores are appended with `let $xx = __sveltets_2_store_get(xx)` to create the store variables.
 */
class ImplicitStoreValues {
    constructor(storesResolvedInTemplate = [], renderFunctionStart, isSvelte5Plus, storeFromImportsWrapper = (input) => input) {
        this.renderFunctionStart = renderFunctionStart;
        this.isSvelte5Plus = isSvelte5Plus;
        this.storeFromImportsWrapper = storeFromImportsWrapper;
        this.accessedStores = new Set();
        this.variableDeclarations = [];
        this.reactiveDeclarations = [];
        this.importStatements = [];
        this.addStoreAcess = this.accessedStores.add.bind(this.accessedStores);
        this.addVariableDeclaration = this.variableDeclarations.push.bind(this.variableDeclarations);
        this.addReactiveDeclaration = this.reactiveDeclarations.push.bind(this.reactiveDeclarations);
        this.addImportStatement = this.importStatements.push.bind(this.importStatements);
        storesResolvedInTemplate.forEach(this.addStoreAcess);
    }
    /**
     * All variable declartaions and imports which
     * were used as stores are appended with `let $xx = __sveltets_2_store_get(xx)` to create the store variables.
     */
    modifyCode(astOffset, str) {
        this.variableDeclarations.forEach((node) => this.attachStoreValueDeclarationToDecl(node, astOffset, str));
        this.reactiveDeclarations.forEach((node) => this.attachStoreValueDeclarationToReactiveAssignment(node, astOffset, str));
        this.attachStoreValueDeclarationOfImportsToRenderFn(str);
    }
    getAccessedStores() {
        return [...this.accessedStores.keys()];
    }
    getGlobals() {
        const globals = new Set(this.accessedStores);
        this.variableDeclarations.forEach((node) => extractIdentifiers(node.name).forEach((id) => globals.delete(id.text)));
        this.reactiveDeclarations.forEach((node) => getNamesFromLabeledStatement(node).forEach((name) => globals.delete(name)));
        this.importStatements.forEach(({ name }) => name && globals.delete(name.getText()));
        return [...globals].map((name) => `$${name}`);
    }
    attachStoreValueDeclarationToDecl(node, astOffset, str) {
        const storeNames = extractIdentifiers(node.name)
            .map((id) => id.text)
            .filter((name) => this.accessedStores.has(name));
        if (!storeNames.length) {
            return;
        }
        const storeDeclarations = surroundWithIgnoreComments(this.createStoreDeclarations(storeNames));
        const nodeEnd = ts.isVariableDeclarationList(node.parent) && node.parent.declarations.length > 1
            ? node.parent.declarations[node.parent.declarations.length - 1].getEnd()
            : node.getEnd();
        // Quick-fixing https://github.com/sveltejs/language-tools/issues/1950
        // TODO think about a SourceMap-wrapper that does these things for us,
        // or investigate altering the inner workings of SourceMap, or investigate
        // if we can always use prependStr here (and elsewhere, too)
        if (getCurrentPrepends(str, nodeEnd + astOffset).length) {
            preprendStr(str, nodeEnd + astOffset, storeDeclarations);
        }
        else {
            str.appendRight(nodeEnd + astOffset, storeDeclarations);
        }
    }
    attachStoreValueDeclarationToReactiveAssignment(node, astOffset, str) {
        const storeNames = getNamesFromLabeledStatement(node).filter((name) => this.accessedStores.has(name));
        if (!storeNames.length) {
            return;
        }
        const storeDeclarations = surroundWithIgnoreComments(this.createStoreDeclarations(storeNames));
        const endPos = node.getEnd() + astOffset;
        // Quick-fixing https://github.com/sveltejs/language-tools/issues/1097
        // TODO think about a SourceMap-wrapper that does these things for us,
        // or investigate altering the inner workings of SourceMap, or investigate
        // if we can always use prependStr here (and elsewhere, too)
        if (str.original.charAt(endPos - 1) !== ';') {
            preprendStr(str, endPos, storeDeclarations);
        }
        else {
            str.appendRight(endPos, storeDeclarations);
        }
    }
    attachStoreValueDeclarationOfImportsToRenderFn(str) {
        const storeNames = this.importStatements
            .filter((declaration) => declaration.name &&
            (!this.isSvelte5Plus || !this.isSvelteStoreDerivedImport(declaration)) &&
            this.accessedStores.has(declaration.name.getText()))
            .map(({ name }) => name.getText());
        if (!storeNames.length) {
            return;
        }
        const storeDeclarations = this.storeFromImportsWrapper(surroundWithIgnoreComments(this.createStoreDeclarations(storeNames)));
        str.appendRight(this.renderFunctionStart, storeDeclarations);
    }
    isSvelteStoreDerivedImport(declaration) {
        // named import of 'derived' from 'svelte/store'
        if (!ts.isImportSpecifier(declaration) || declaration.name.text !== 'derived') {
            return false;
        }
        const importDeclaration = declaration.parent.parent.parent;
        return (ts.isImportDeclaration(importDeclaration) &&
            importDeclaration.moduleSpecifier &&
            ts.isStringLiteral(importDeclaration.moduleSpecifier) &&
            importDeclaration.moduleSpecifier.text === 'svelte/store');
    }
    createStoreDeclarations(storeNames) {
        let declarations = '';
        for (let i = 0; i < storeNames.length; i++) {
            declarations += this.createStoreDeclaration(storeNames[i]);
        }
        return declarations;
    }
    createStoreDeclaration(storeName) {
        return `;let $${storeName} = __sveltets_2_store_get(${storeName});`;
    }
}

class ImplicitTopLevelNames {
    constructor(str, astOffset) {
        this.str = str;
        this.astOffset = astOffset;
        this.map = new Set();
    }
    add(node) {
        this.map.add(node);
    }
    handleReactiveStatement(node, binaryExpression) {
        if (binaryExpression) {
            this.wrapExpressionWithInvalidate(binaryExpression.right);
        }
        else {
            const start = node.getStart() + this.astOffset;
            const end = node.getEnd() + this.astOffset;
            this.str.prependLeft(start, ';() => {');
            preprendStr(this.str, end, '}');
        }
    }
    wrapExpressionWithInvalidate(expression) {
        if (!expression) {
            return;
        }
        const start = expression.getStart() + this.astOffset;
        const end = expression.getEnd() + this.astOffset;
        // $: a = { .. }..  /  $: a = .. as ..  =>   () => ( .. )
        if (ts.isObjectLiteralExpression(expression) ||
            (expression.getText().startsWith('{') &&
                this.isNodeStartsWithObjectLiteral(expression)) ||
            ts.isAsExpression(expression)) {
            this.str.appendLeft(start, '(');
            this.str.appendRight(end, ')');
        }
        this.str.prependLeft(start, '__sveltets_2_invalidate(() => ');
        preprendStr(this.str, end, ')');
        // Not adding ';' at the end because right now this function is only invoked
        // in situations where there is a line break of ; guaranteed to be present (else the code is invalid)
    }
    isNodeStartsWithObjectLiteral(node) {
        if (ts.isObjectLiteralExpression(node)) {
            return true;
        }
        if (ts.isElementAccessExpression(node)) {
            return this.isNodeStartsWithObjectLiteral(node.expression);
        }
        if (ts.isBinaryExpression(node)) {
            return this.isNodeStartsWithObjectLiteral(node.left);
        }
        if (ts.isConditionalExpression(node)) {
            return this.isNodeStartsWithObjectLiteral(node.condition);
        }
        return node
            .getChildren()
            .filter((e) => e.pos === node.pos)
            .some((child) => this.isNodeStartsWithObjectLiteral(child));
    }
    modifyCode(rootVariables) {
        for (const node of this.map.values()) {
            const names = getNamesFromLabeledStatement(node);
            if (names.length === 0) {
                continue;
            }
            const implicitTopLevelNames = names.filter((name) => !rootVariables.has(name));
            const pos = node.label.getStart();
            if (this.hasOnlyImplicitTopLevelNames(names, implicitTopLevelNames)) {
                // remove '$:' label
                this.str.remove(pos + this.astOffset, pos + this.astOffset + 2);
                this.str.prependRight(pos + this.astOffset, 'let ');
                this.removeBracesFromParenthizedExpression(node);
            }
            else {
                implicitTopLevelNames.forEach((name) => {
                    this.str.prependRight(pos + this.astOffset, `let ${name};\n`);
                });
            }
        }
    }
    hasOnlyImplicitTopLevelNames(names, implicitTopLevelNames) {
        return names.length === implicitTopLevelNames.length;
    }
    removeBracesFromParenthizedExpression(node) {
        // If expression is of type `$: ({a} = b);`,
        // remove the surrounding braces so that the transformation
        // to `let {a} = b;` produces valid code.
        if (ts.isExpressionStatement(node.statement) &&
            isParenthesizedObjectOrArrayLiteralExpression(node.statement.expression)) {
            const parenthesizedExpression = node.statement.expression;
            const parenthesisStart = parenthesizedExpression.getStart() + this.astOffset;
            const expressionStart = parenthesizedExpression.expression.getStart() + this.astOffset;
            this.str.overwrite(parenthesisStart, expressionStart, '', { contentOnly: true });
            const parenthesisEnd = parenthesizedExpression.getEnd() + this.astOffset;
            const expressionEnd = parenthesizedExpression.expression.getEnd() + this.astOffset;
            // We need to keep the `)` of the "wrap with invalidate" expression above.
            // We overwrite the same range so it's needed.
            overwriteStr(this.str, expressionEnd, parenthesisEnd, ')', true);
        }
    }
}

/**
 * Transform type assertion to as expression: <Type>a => a as Type
 */
function handleTypeAssertion(str, assertion, astOffset) {
    const { expression, type } = assertion;
    const assertionStart = assertion.getStart() + astOffset;
    const typeStart = type.getStart() + astOffset;
    const typeEnd = type.getEnd() + astOffset;
    const expressionStart = expression.getStart() + astOffset;
    const expressionEnd = expression.getEnd() + astOffset;
    str.appendLeft(expressionEnd, ' as ');
    // move 'HTMLElement' to the end of expression
    str.move(assertionStart, typeEnd, expressionEnd);
    str.remove(assertionStart, typeStart);
    // remove '>'
    str.remove(typeEnd, expressionStart);
}

/**
 * move imports to top of script so they appear outside our render function
 */
function handleImportDeclaration(node, str, astOffset, scriptStart, sourceFile) {
    return moveNode(node, str, astOffset, scriptStart, sourceFile);
}
/**
 * ensure it's in a newline.
 * if file has module script ensure an empty line to separate imports
 */
function handleFirstInstanceImport(tsAst, astOffset, hasModuleScript, str) {
    var _a;
    const imports = getTopLevelImports(tsAst);
    const firstImport = imports[0];
    if (!firstImport) {
        return;
    }
    const firstComment = Array.from((_a = ts.getLeadingCommentRanges(firstImport.getFullText(), 0)) !== null && _a !== void 0 ? _a : []).sort((a, b) => a.pos - b.pos)[0];
    const start = firstComment && firstComment.kind === ts.SyntaxKind.MultiLineCommentTrivia
        ? firstComment.pos + firstImport.getFullStart()
        : firstImport.getStart();
    str.appendRight(start + astOffset, '\n' + (hasModuleScript ? '\n' : ''));
    // Add a semi-colon to the last import if it doesn't have one, to prevent auto completion
    // and imports from being added at the wrong position
    const lastImport = imports[imports.length - 1];
    const end = lastImport.end + astOffset - 1;
    if (str.original[end] !== ';') {
        str.overwrite(end, lastImport.end + astOffset, str.original[end] + ';\n');
    }
}

function flatten(arr) {
    return arr.reduce((acc, val) => acc.concat(val), []);
}

class InterfacesAndTypes {
    constructor() {
        this.node = null;
        this.all = [];
        this.references = new Map();
    }
    add(node) {
        this.all.push(node);
    }
    getNodesWithNames(names) {
        return this.all.filter((node) => names.includes(node.name.text));
    }
    // The following could be used to create a informative error message in case
    // someone has an interface that both references a generic and is used by one:
    addReference(reference) {
        if (!this.node) {
            return;
        }
        const references = this.references.get(this.node) || [];
        references.push(reference);
        this.references.set(this.node, references);
    }
    getNodesThatReferenceType(name) {
        const nodes = [];
        for (const [node, references] of this.references) {
            if (references.some((r) => r.typeName.getText() === name)) {
                nodes.push(node);
            }
        }
        return nodes;
    }
    getNodesThatRecursivelyReferenceType(name) {
        let types = [name];
        const nodes = new Set();
        while (types.length !== 0) {
            const newTypes = flatten(types.map((type) => this.getNodesThatReferenceType(type))).filter((t) => !nodes.has(t));
            newTypes.forEach((t) => nodes.add(t));
            types = newTypes.map((t) => t.name.text);
        }
        return [...nodes.values()];
    }
    getNodesThatRecursivelyReferenceTypes(names) {
        return flatten(names.map((name) => this.getNodesThatRecursivelyReferenceType(name)));
    }
}

function processInstanceScriptContent(str, script, events, implicitStoreValues, mode, moduleAst, isTSFile, basename, isSvelte5Plus, isRunes) {
    const htmlx = str.original;
    const scriptContent = htmlx.substring(script.content.start, script.content.end);
    const tsAst = ts.createSourceFile('component.ts.svelte', scriptContent, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const astOffset = script.content.start;
    const exportedNames = new ExportedNames(str, astOffset, basename, isTSFile, isSvelte5Plus, isRunes);
    const generics = new Generics(str, astOffset, script);
    const interfacesAndTypes = new InterfacesAndTypes();
    if (moduleAst) {
        moduleAst.tsAst.forEachChild((n) => exportedNames.hoistableInterfaces.analyzeModuleScriptNode(n));
    }
    const implicitTopLevelNames = new ImplicitTopLevelNames(str, astOffset);
    let uses$$props = false;
    let uses$$restProps = false;
    let uses$$slots = false;
    let uses$$SlotsInterface = false;
    let hasTopLevelAwait = false;
    //track if we are in a declaration scope
    let isDeclaration = false;
    //track the variable declaration node
    let variableDeclarationNode = null;
    //track $store variables since we are only supposed to give top level scopes special treatment, and users can declare $blah variables at higher scopes
    //which prevents us just changing all instances of Identity that start with $
    let pendingStoreResolutions = [];
    let scope = new Scope$1();
    const rootScope = scope;
    //track is the variable declared as `props` comes from `$props()`
    let isPropsDeclarationRune = false;
    const pushScope = () => (scope = new Scope$1(scope));
    const popScope = () => (scope = scope.parent);
    const resolveStore = (pending) => {
        let { node, scope } = pending;
        const name = node.text;
        while (scope) {
            if (scope.declared.has(name)) {
                //we were manually declared, this isn't a store access.
                return;
            }
            scope = scope.parent;
        }
        const storename = node.getText().slice(1);
        implicitStoreValues.addStoreAcess(storename);
    };
    const handleIdentifier = (ident, parent) => {
        if (ident.text === '$$props') {
            uses$$props = true;
            return;
        }
        if (ident.text === '$$restProps') {
            uses$$restProps = true;
            return;
        }
        if (ident.text === '$$slots') {
            uses$$slots = true;
            return;
        }
        if (ts.isLabeledStatement(parent) && parent.label == ident) {
            return;
        }
        //if we are in a variable declaration and the identifier is `props` we check the initializer
        if (ident.text === 'props' &&
            variableDeclarationNode &&
            variableDeclarationNode.initializer &&
            ts.isCallExpression(variableDeclarationNode.initializer) &&
            variableDeclarationNode.initializer.getText() === '$props()') {
            isPropsDeclarationRune = true;
        }
        if (isDeclaration || ts.isParameter(parent)) {
            if (isNotPropertyNameOfImport(ident) &&
                (!ts.isBindingElement(ident.parent) || ident.parent.name == ident)) {
                // we are a key, not a name, so don't care
                if (ident.text.startsWith('$') || scope == rootScope) {
                    // track all top level declared identifiers and all $ prefixed identifiers
                    scope.declared.add(ident.text);
                }
            }
        }
        else {
            const text = ident.text;
            //track potential store usage to be resolved
            if (text.startsWith('$')) {
                if ((!ts.isPropertyAccessExpression(parent) || parent.expression == ident) &&
                    (!ts.isPropertyAssignment(parent) || parent.initializer == ident) &&
                    !ts.isPropertySignature(parent) &&
                    !ts.isPropertyDeclaration(parent) &&
                    !ts.isTypeReferenceNode(parent) &&
                    !ts.isTypeAliasDeclaration(parent) &&
                    !ts.isInterfaceDeclaration(parent)) {
                    let isPropsId = false;
                    if (text === '$props' &&
                        ts.isPropertyAccessExpression(parent) &&
                        parent.parent &&
                        ts.isCallExpression(parent.parent) &&
                        parent.parent.arguments.length === 0) {
                        const text = parent.getText();
                        isPropsId = text === '$props.id';
                    }
                    // Handle the const { ...props } = $props() case
                    const is_rune = (text === '$props' || text === '$derived' || text === '$state') &&
                        ts.isCallExpression(parent) &&
                        ts.isVariableDeclaration(parent.parent) &&
                        parent.parent.name.getText().includes(text.slice(1));
                    if (!is_rune) {
                        pendingStoreResolutions.push({ node: ident, parent, scope, isPropsId });
                    }
                }
            }
        }
    };
    const walk = (node, parent) => {
        var _a, _b, _c;
        const onLeaveCallbacks = [];
        if (parent === tsAst) {
            exportedNames.hoistableInterfaces.analyzeInstanceScriptNode(node);
        }
        generics.addIfIsGeneric(node);
        if (is$$EventsDeclaration(node)) {
            events.setComponentEventsInterface(node, astOffset);
        }
        if (is$$SlotsDeclaration(node)) {
            uses$$SlotsInterface = true;
        }
        if (is$$PropsDeclaration(node)) {
            exportedNames.uses$$Props = true;
        }
        if (ts.isVariableStatement(node)) {
            exportedNames.handleVariableStatement(node, parent);
        }
        if (ts.isFunctionDeclaration(node)) {
            exportedNames.handleExportFunctionOrClass(node);
        }
        if (ts.isClassDeclaration(node)) {
            exportedNames.handleExportFunctionOrClass(node);
        }
        if (ts.isBlock(node) || ts.isFunctionLike(node)) {
            pushScope();
            onLeaveCallbacks.push(() => popScope());
        }
        if (ts.isExportDeclaration(node)) {
            exportedNames.handleExportDeclaration(node);
        }
        if (ts.isImportDeclaration(node)) {
            handleImportDeclaration(node, str, astOffset, script.start, tsAst);
            // Check if import is the event dispatcher
            events.checkIfImportIsEventDispatcher(node);
        }
        // workaround for import statement completion
        if (ts.isImportEqualsDeclaration(node)) {
            const end = node.getEnd() + astOffset;
            if (str.original[end - 1] !== ';') {
                preprendStr(str, end, ';');
            }
        }
        if (ts.isVariableDeclaration(node)) {
            events.checkIfIsStringLiteralDeclaration(node);
            events.checkIfDeclarationInstantiatedEventDispatcher(node);
            // Only top level declarations can be stores
            if (((_b = (_a = node.parent) === null || _a === void 0 ? void 0 : _a.parent) === null || _b === void 0 ? void 0 : _b.parent) === tsAst) {
                implicitStoreValues.addVariableDeclaration(node);
            }
        }
        if (ts.isCallExpression(node)) {
            events.checkIfCallExpressionIsDispatch(node);
        }
        if (ts.isVariableDeclaration(parent) && parent.name == node) {
            isDeclaration = true;
            variableDeclarationNode = parent;
            onLeaveCallbacks.push(() => {
                isDeclaration = false;
                variableDeclarationNode = null;
            });
        }
        if (ts.isBindingElement(parent) && parent.name == node) {
            isDeclaration = true;
            onLeaveCallbacks.push(() => (isDeclaration = false));
        }
        if (ts.isImportClause(node)) {
            isDeclaration = true;
            onLeaveCallbacks.push(() => (isDeclaration = false));
            implicitStoreValues.addImportStatement(node);
        }
        if (ts.isImportSpecifier(node)) {
            implicitStoreValues.addImportStatement(node);
        }
        if (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) {
            interfacesAndTypes.node = node;
            interfacesAndTypes.add(node);
            onLeaveCallbacks.push(() => (interfacesAndTypes.node = null));
        }
        //handle stores etc
        if (ts.isIdentifier(node)) {
            handleIdentifier(node, parent);
        }
        //track implicit declarations in reactive blocks at the top level
        if (ts.isLabeledStatement(node) &&
            parent == tsAst && //top level
            node.label.text == '$' &&
            node.statement) {
            const binaryExpression = getBinaryAssignmentExpr(node);
            if (binaryExpression) {
                implicitTopLevelNames.add(node);
                implicitStoreValues.addReactiveDeclaration(node);
            }
            implicitTopLevelNames.handleReactiveStatement(node, binaryExpression);
        }
        // Check for top-level await expressions
        if (isSvelte5Plus && ts.isAwaitExpression(node) && scope === rootScope) {
            hasTopLevelAwait = true;
        }
        // Defensively call function (checking for undefined) because it got added only recently (TS 4.0)
        // and therefore might break people using older TS versions
        // Don't transform in ts mode because <type>value type assertions are valid in this case
        if (mode !== 'ts' && ((_c = ts.isTypeAssertionExpression) === null || _c === void 0 ? void 0 : _c.call(ts, node))) {
            handleTypeAssertion(str, node, astOffset);
        }
        //to save a bunch of condition checks on each node, we recurse into processChild which skips all the checks for top level items
        ts.forEachChild(node, (n) => walk(n, node));
        //fire off the on leave callbacks
        onLeaveCallbacks.map((c) => c());
    };
    //walk the ast and convert to tsx as we go
    tsAst.forEachChild((n) => walk(n, tsAst));
    //resolve stores
    if (isPropsDeclarationRune) {
        //we filter out every pendingStore resolution that `isPropsId` if the variable names `props` comes from `$props()`
        pendingStoreResolutions = pendingStoreResolutions.filter(({ isPropsId }) => !isPropsId);
    }
    pendingStoreResolutions.map(resolveStore);
    // declare implicit reactive variables we found in the script
    implicitTopLevelNames.modifyCode(rootScope.declared);
    implicitStoreValues.modifyCode(astOffset, str);
    handleFirstInstanceImport(tsAst, astOffset, !!moduleAst, str);
    // move interfaces and types out of the render function if they are referenced
    // by a $$Generic, otherwise it will be used before being defined after the transformation
    const nodesToMove = interfacesAndTypes.getNodesWithNames(generics.getTypeReferences());
    for (const node of nodesToMove) {
        moveNode(node, str, astOffset, script.start, tsAst);
    }
    const hoisted = exportedNames.hoistableInterfaces.moveHoistableInterfaces(str, astOffset, script.start + 1, // +1 because imports are also moved at that position, and we want to move interfaces after imports
    generics.getReferences());
    if (mode === 'dts') {
        // Transform interface declarations to type declarations because indirectly
        // using interfaces inside the return type of a function is forbidden.
        // This is not a problem for intellisense/type inference but it will
        // break dts generation (file will not be generated).
        if (hoisted) {
            transformInterfacesToTypes(tsAst, str, astOffset, [...hoisted.values()].concat(nodesToMove));
        }
        else {
            transformInterfacesToTypes(tsAst, str, astOffset, nodesToMove);
        }
    }
    return {
        exportedNames,
        events,
        uses$$props,
        uses$$restProps,
        uses$$slots,
        uses$$SlotsInterface,
        generics,
        hasTopLevelAwait
    };
}
function transformInterfacesToTypes(tsAst, str, astOffset, movedNodes) {
    tsAst.statements
        .filter(ts.isInterfaceDeclaration)
        .filter((i) => !movedNodes.includes(i))
        .forEach((node) => {
        var _a;
        str.overwrite(node.getStart() + astOffset, node.getStart() + astOffset + 'interface'.length, 'type');
        if ((_a = node.heritageClauses) === null || _a === void 0 ? void 0 : _a.length) {
            const extendsStart = node.heritageClauses[0].getStart() + astOffset;
            str.overwrite(extendsStart, extendsStart + 'extends'.length, '=');
            const extendsList = node.heritageClauses[0].types;
            let prev = extendsList[0];
            extendsList.slice(1).forEach((heritageClause) => {
                str.overwrite(prev.getEnd() + astOffset, heritageClause.getStart() + astOffset, ' & ');
                prev = heritageClause;
            });
            str.appendLeft(node.heritageClauses[0].getEnd() + astOffset, ' & ');
        }
        else {
            str.prependLeft(str.original.indexOf('{', node.getStart() + astOffset), '=');
        }
    });
}

function createModuleAst(str, script) {
    const htmlx = str.original;
    const scriptContent = htmlx.substring(script.content.start, script.content.end);
    const tsAst = ts.createSourceFile('component.module.ts.svelte', scriptContent, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const astOffset = script.content.start;
    return { htmlx, tsAst, astOffset };
}
function processModuleScriptTag(str, script, implicitStoreValues, moduleAst) {
    const { htmlx, tsAst, astOffset } = moduleAst;
    const generics = new Generics(str, astOffset, script);
    if (generics.genericsAttr) {
        const start = htmlx.indexOf('generics', script.start);
        throwError(start, start + 8, 'The generics attribute is only allowed on the instance script', str.original);
    }
    const walk = (node) => {
        resolveImplicitStoreValue(node, implicitStoreValues, str, astOffset);
        generics.throwIfIsGeneric(node);
        throwIfIs$$EventsDeclaration(node, str, astOffset);
        throwIfIs$$SlotsDeclaration(node, str, astOffset);
        throwIfIs$$PropsDeclaration(node, str, astOffset);
        ts.forEachChild(node, (n) => walk(n));
    };
    //walk the ast and convert to tsx as we go
    tsAst.forEachChild((n) => walk(n));
    // declare store declarations we found in the script
    implicitStoreValues.modifyCode(astOffset, str);
    const scriptStartTagEnd = htmlx.indexOf('>', script.start) + 1;
    const scriptEndTagStart = htmlx.lastIndexOf('<', script.end - 1);
    str.overwrite(script.start, scriptStartTagEnd, ';', {
        contentOnly: true
    });
    str.overwrite(scriptEndTagStart, script.end, ';', {
        contentOnly: true
    });
}
function resolveImplicitStoreValue(node, implicitStoreValues, str, astOffset) {
    var _a;
    if (ts.isVariableDeclaration(node)) {
        implicitStoreValues.addVariableDeclaration(node);
    }
    if (ts.isImportClause(node)) {
        implicitStoreValues.addImportStatement(node);
    }
    if (ts.isImportSpecifier(node)) {
        implicitStoreValues.addImportStatement(node);
    }
    if ((_a = ts.isTypeAssertionExpression) === null || _a === void 0 ? void 0 : _a.call(ts, node)) {
        handleTypeAssertion(str, node, astOffset);
    }
}
function throwIfIs$$EventsDeclaration(node, str, astOffset) {
    if (is$$EventsDeclaration(node)) {
        throw$$Error(node, str, astOffset, '$$Events');
    }
}
function throwIfIs$$SlotsDeclaration(node, str, astOffset) {
    if (is$$SlotsDeclaration(node)) {
        throw$$Error(node, str, astOffset, '$$Slots');
    }
}
function throwIfIs$$PropsDeclaration(node, str, astOffset) {
    if (is$$PropsDeclaration(node)) {
        throw$$Error(node, str, astOffset, '$$Props');
    }
}
function throw$$Error(node, str, astOffset, type) {
    throwError(node.getStart() + astOffset, node.getEnd() + astOffset, `${type} can only be declared in the instance script`, str.original);
}

function processSvelteTemplate(str, parse, options) {
    const { htmlxAst, tags } = parseHtmlx(str.original, parse, options);
    return convertHtmlxToJsx(str, htmlxAst, tags, options);
}
function svelte2tsx(svelte, options = { parse }) {
    options.mode = options.mode || 'ts';
    options.version = options.version || VERSION;
    const str = new MagicString(svelte);
    const basename = path__default.basename(options.filename || '');
    const svelte5Plus = Number(options.version[0]) > 4;
    const isTsFile = options === null || options === void 0 ? void 0 : options.isTsFile;
    // process the htmlx as a svelte template
    let { htmlAst, moduleScriptTag, scriptTag, rootSnippets, slots, uses$$props, uses$$slots, uses$$restProps, events, componentDocumentation, resolvedStores, usesAccessors, isRunes } = processSvelteTemplate(str, options.parse || parse, {
        ...options,
        svelte5Plus
    });
    /* Rearrange the script tags so that module is first, and instance second followed finally by the template
     * This is a bit convoluted due to some trouble I had with magic string. A simple str.move(start,end,0) for each script wasn't enough
     * since if the module script was already at 0, it wouldn't move (which is fine) but would mean the order would be swapped when the script tag tried to move to 0
     * In this case we instead have to move it to moduleScriptTag.end. We track the location for the script move in the MoveInstanceScriptTarget var
     */
    let instanceScriptTarget = 0;
    let moduleAst;
    if (moduleScriptTag) {
        moduleAst = createModuleAst(str, moduleScriptTag);
        if (moduleScriptTag.start != 0) {
            //move our module tag to the top
            str.move(moduleScriptTag.start, moduleScriptTag.end, 0);
        }
        else {
            //since our module script was already at position 0, we need to move our instance script tag to the end of it.
            instanceScriptTarget = moduleScriptTag.end;
        }
    }
    const renderFunctionStart = scriptTag
        ? str.original.lastIndexOf('>', scriptTag.content.start) + 1
        : instanceScriptTarget;
    const implicitStoreValues = new ImplicitStoreValues(resolvedStores, renderFunctionStart, svelte5Plus);
    //move the instance script and process the content
    let exportedNames = new ExportedNames(str, 0, basename, isTsFile, svelte5Plus, isRunes);
    let generics = new Generics(str, 0, { attributes: [] });
    let uses$$SlotsInterface = false;
    let hasTopLevelAwait = false;
    if (scriptTag) {
        //ensure it is between the module script and the rest of the template (the variables need to be declared before the jsx template)
        if (scriptTag.start != instanceScriptTarget) {
            str.move(scriptTag.start, scriptTag.end, instanceScriptTarget);
        }
        const res = processInstanceScriptContent(str, scriptTag, events, implicitStoreValues, options.mode, moduleAst, isTsFile, basename, svelte5Plus, isRunes);
        uses$$props = uses$$props || res.uses$$props;
        uses$$restProps = uses$$restProps || res.uses$$restProps;
        uses$$slots = uses$$slots || res.uses$$slots;
        ({ exportedNames, events, generics, uses$$SlotsInterface, hasTopLevelAwait } = res);
    }
    exportedNames.usesAccessors = usesAccessors;
    if (svelte5Plus) {
        exportedNames.checkGlobalsForRunes(implicitStoreValues.getGlobals());
        if (hasTopLevelAwait) {
            exportedNames.enterRunesMode();
        }
    }
    //wrap the script tag and template content in a function returning the slot and exports
    createRenderFunction({
        str,
        scriptTag,
        scriptDestination: instanceScriptTarget,
        slots,
        events,
        exportedNames,
        uses$$props,
        uses$$restProps,
        uses$$slots,
        uses$$SlotsInterface,
        generics,
        hasTopLevelAwait,
        svelte5Plus,
        isTsFile,
        mode: options.mode
    });
    // we need to process the module script after the instance script has moved otherwise we get warnings about moving edited items
    if (moduleScriptTag) {
        processModuleScriptTag(str, moduleScriptTag, new ImplicitStoreValues(implicitStoreValues.getAccessedStores(), renderFunctionStart, svelte5Plus, scriptTag || options.mode === 'ts' ? undefined : (input) => `</>;${input}<>`), moduleAst);
        if (!scriptTag) {
            moduleAst.tsAst.forEachChild((node) => exportedNames.hoistableInterfaces.analyzeModuleScriptNode(node));
        }
    }
    if (moduleScriptTag && rootSnippets.length > 0) {
        exportedNames.hoistableInterfaces.analyzeSnippets(rootSnippets);
    }
    if (moduleScriptTag || scriptTag) {
        let snippetHoistTargetForModule = 0;
        if (rootSnippets.length) {
            if (scriptTag) {
                snippetHoistTargetForModule = scriptTag.start + 1; // +1 because imports are also moved at that position, and we want to move interfaces after imports
            }
            else {
                const imports = getTopLevelImports(moduleAst.tsAst);
                const lastImport = imports[imports.length - 1];
                snippetHoistTargetForModule = lastImport
                    ? lastImport.end + moduleAst.astOffset
                    : moduleAst.astOffset;
                str.appendLeft(snippetHoistTargetForModule, '\n');
            }
        }
        for (const [start, end, globals] of rootSnippets) {
            const hoist_to_module = moduleScriptTag &&
                (globals.size === 0 ||
                    [...globals.keys()].every((id) => exportedNames.hoistableInterfaces.isAllowedReference(id)));
            if (hoist_to_module) {
                str.move(start, end, snippetHoistTargetForModule);
            }
            else if (scriptTag) {
                str.move(start, end, renderFunctionStart);
            }
        }
    }
    addComponentExport({
        str,
        canHaveAnyProp: !exportedNames.uses$$Props && (uses$$props || uses$$restProps),
        events,
        isTsFile,
        exportedNames,
        usesAccessors,
        usesSlots: slots.size > 0,
        fileName: options === null || options === void 0 ? void 0 : options.filename,
        componentDocumentation,
        mode: options.mode,
        generics,
        isSvelte5: svelte5Plus,
        hasTopLevelAwait,
        noSvelteComponentTyped: options.noSvelteComponentTyped
    });
    if (options.mode === 'dts') {
        // Prepend the import which is used for TS files
        // The other shims need to be provided by the user ambient-style,
        // for example through filenames.push(require.resolve('svelte2tsx/svelte-shims.d.ts'))
        // TODO replace with SvelteComponent for Svelte 5, keep old for backwards compatibility with Svelte 3
        if (options.noSvelteComponentTyped) {
            str.prepend('import { SvelteComponent } from "svelte"\n' + '\n');
        }
        else {
            str.prepend('import { SvelteComponentTyped } from "svelte"\n' + '\n');
        }
        let code = str.toString();
        // Remove all tsx occurences and the template part from the output
        code = code
            // prepended before each script block
            .replace('<></>;', '')
            .replace('<></>;', '')
            // tsx in render function
            .replace(/<>.*<\/>/s, '')
            .replace('\n() => ();', '');
        return {
            code
        };
    }
    else {
        str.prepend('///<reference types="svelte" />\n');
        return {
            code: str.toString(),
            map: str.generateMap({ hires: true, source: options === null || options === void 0 ? void 0 : options.filename }),
            exportedNames: exportedNames.getExportsMap(),
            events: events.createAPI(),
            // not part of the public API so people don't start using it
            htmlAst
        };
    }
}

async function emitDts(config) {
    const svelteMap = await createSvelteMap(config);
    const { options, filenames } = loadTsconfig(config, svelteMap);
    const host = await createTsCompilerHost(options, svelteMap);
    const program = ts.createProgram(filenames, options, host);
    const result = program.emit();
    const likely_failed_files = result.diagnostics.filter((diagnostic) => {
        // List of errors which hint at a failed d.ts generation
        // https://github.com/microsoft/TypeScript/blob/main/src/compiler/diagnosticMessages.json
        return (diagnostic.code === 2527 ||
            diagnostic.code === 5088 ||
            diagnostic.code === 2742 ||
            (diagnostic.code >= 9005 && diagnostic.code <= 9039) ||
            (diagnostic.code >= 4000 && diagnostic.code <= 4108));
    });
    if (likely_failed_files.length > 0) {
        const failed_by_file = new Map();
        likely_failed_files.forEach((diagnostic) => {
            var _a;
            const file = (_a = diagnostic.file) === null || _a === void 0 ? void 0 : _a.fileName;
            if (file) {
                const errors = failed_by_file.get(file) || [];
                errors.push(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
                failed_by_file.set(file, errors);
            }
        });
        console.warn('d.ts type declaration files for the following files were likely not generated due to the following errors:');
        console.warn([...failed_by_file.entries()]
            .map(([file, errors]) => {
            return `${file}\n${errors.map((error) => `  - ${error}`).join('\n')}`;
        })
            .join('\n'));
    }
}
function loadTsconfig(config, svelteMap) {
    var _a;
    const libRoot = config.libRoot || process.cwd();
    const jsconfigFile = ts.findConfigFile(libRoot, ts.sys.fileExists, 'jsconfig.json');
    let tsconfigFile = ts.findConfigFile(libRoot, ts.sys.fileExists, config.tsconfig);
    if (!tsconfigFile && !jsconfigFile) {
        throw new Error('Failed to locate tsconfig or jsconfig');
    }
    tsconfigFile = tsconfigFile || jsconfigFile;
    if (jsconfigFile && isSubpath(path.dirname(tsconfigFile), path.dirname(jsconfigFile))) {
        tsconfigFile = jsconfigFile;
    }
    tsconfigFile = path.isAbsolute(tsconfigFile) ? tsconfigFile : path.join(libRoot, tsconfigFile);
    const basepath = path.dirname(tsconfigFile);
    const { error, config: tsConfig } = ts.readConfigFile(tsconfigFile, ts.sys.readFile);
    if (error) {
        throw new Error('Malformed tsconfig\n' + JSON.stringify(error, null, 2));
    }
    // Rewire includes and files. This ensures that only the files inside the lib are traversed and
    // that the outputted types have the correct directory depth.
    // This is a little brittle because we then may include more than the user wants
    const libPathRelative = path.relative(basepath, libRoot).split(path.sep).join('/');
    if (libPathRelative) {
        tsConfig.include = [`${libPathRelative}/**/*`];
        tsConfig.files = [];
    }
    const { options, fileNames } = ts.parseJsonConfigFileContent(tsConfig, ts.sys, basepath, { sourceMap: false, rootDir: config.libRoot }, tsconfigFile, undefined, [{ extension: 'svelte', isMixedContent: true, scriptKind: ts.ScriptKind.Deferred }]);
    const filenames = fileNames.map((name) => {
        if (!isSvelteFilepath(name)) {
            return name;
        }
        // We need to trick TypeScript into thinking that Svelte files
        // are either TS or JS files in order to generate correct d.ts
        // definition files.
        const isTsFile = svelteMap.add(name);
        return name + (isTsFile ? '.ts' : '.js');
    });
    // Add ambient functions so TS knows how to resolve its invocations in the
    // code output of svelte2tsx.
    filenames.push(config.svelteShimsPath);
    return {
        options: {
            ...options,
            noEmit: false, // Set to true in case of jsconfig, force false, else nothing is emitted
            moduleResolution: options.moduleResolution &&
                options.moduleResolution !== ts.ModuleResolutionKind.Classic
                ? options.moduleResolution
                : // NodeJS: up to 4.9, Node10: since 5.0
                    ((_a = ts.ModuleResolutionKind.NodeJs) !== null && _a !== void 0 ? _a : ts.ModuleResolutionKind.Node10), // Classic if not set, which gives wrong results
            declaration: true, // Needed for d.ts file generation
            emitDeclarationOnly: true, // We only want d.ts file generation
            declarationDir: config.declarationDir, // Where to put the declarations
            allowNonTsExtensions: true
        },
        filenames
    };
}
async function createTsCompilerHost(options, svelteMap) {
    const host = ts.createCompilerHost(options);
    // TypeScript writes the files relative to the found tsconfig/jsconfig
    // which - at least in the case of the tests - is wrong. Therefore prefix
    // the output paths. See Typescript issue #25430 for more.
    const pathPrefix = path
        .relative(process.cwd(), path.dirname(options.configFilePath))
        .split(path.sep)
        .join('/');
    const svelteSys = {
        ...ts.sys,
        fileExists(originalPath) {
            let exists = ts.sys.fileExists(originalPath);
            if (exists) {
                return true;
            }
            const path = ensureRealSvelteFilepath(originalPath);
            if (path === originalPath) {
                return false;
            }
            exists = ts.sys.fileExists(path);
            if (exists && isSvelteFilepath(path)) {
                const isTsFile = svelteMap.add(path);
                if ((isTsFile && !isTsFilepath(originalPath)) ||
                    (!isTsFile && isTsFilepath(originalPath))) {
                    return false;
                }
            }
            return exists;
        },
        readFile(path, encoding = 'utf-8') {
            const sveltePath = ensureRealSvelteFilepath(path);
            if (path !== sveltePath || isSvelteFilepath(path)) {
                const result = svelteMap.get(sveltePath);
                if (result === undefined) {
                    return ts.sys.readFile(path, encoding);
                }
                else {
                    return result;
                }
            }
            else {
                return ts.sys.readFile(path, encoding);
            }
        },
        readDirectory(path, extensions, exclude, include, depth) {
            const extensionsWithSvelte = (extensions || []).concat('.svelte');
            return ts.sys.readDirectory(path, extensionsWithSvelte, exclude, include, depth);
        },
        writeFile(fileName, data, writeByteOrderMark) {
            fileName = pathPrefix ? path.join(pathPrefix, fileName) : fileName;
            if (fileName.endsWith('d.ts.map')) {
                data = data.replace(/"sources":\["(.+?)"\]/, (_, sourcePath) => {
                    // The inverse of the pathPrefix adjustment
                    sourcePath =
                        pathPrefix && sourcePath.includes(pathPrefix)
                            ? sourcePath.slice(0, sourcePath.indexOf(pathPrefix)) +
                                sourcePath.slice(sourcePath.indexOf(pathPrefix) + pathPrefix.length + 1)
                            : sourcePath;
                    // Due to our hack of treating .svelte files as .ts files, we need to adjust the extension
                    if (svelteMap.get(path.join(options.rootDir, toRealSvelteFilepath(sourcePath)))) {
                        sourcePath = toRealSvelteFilepath(sourcePath);
                    }
                    return `"sources":["${sourcePath}"]`;
                });
            }
            else if (fileName.endsWith('js.map')) {
                data = data.replace(/"sources":\["(.+?)"\]/, (_, sourcePath) => {
                    // The inverse of the pathPrefix adjustment
                    sourcePath =
                        pathPrefix && sourcePath.includes(pathPrefix)
                            ? sourcePath.slice(0, sourcePath.indexOf(pathPrefix)) +
                                sourcePath.slice(sourcePath.indexOf(pathPrefix) + pathPrefix.length + 1)
                            : sourcePath;
                    return `"sources":["${sourcePath}"]`;
                });
            }
            return ts.sys.writeFile(fileName, data, writeByteOrderMark);
        }
    };
    host.fileExists = svelteSys.fileExists;
    host.readFile = svelteSys.readFile;
    host.readDirectory = svelteSys.readDirectory;
    host.writeFile = svelteSys.writeFile;
    host.resolveModuleNames = (moduleNames, containingFile, _reusedNames, _redirectedReference, compilerOptions) => {
        return moduleNames.map((moduleName) => {
            return resolveModuleName(moduleName, containingFile, compilerOptions);
        });
    };
    host.resolveModuleNameLiterals = (moduleLiterals, containingFile, _redirectedReference, compilerOptions) => {
        return moduleLiterals.map((moduleLiteral) => {
            return {
                resolvedModule: resolveModuleName(moduleLiteral.text, containingFile, compilerOptions)
            };
        });
    };
    function resolveModuleName(name, containingFile, compilerOptions) {
        // Delegate to the TS resolver first.
        // If that does not bring up anything, try the Svelte Module loader
        // which is able to deal with .svelte files.
        const tsResolvedModule = ts.resolveModuleName(name, containingFile, compilerOptions, ts.sys).resolvedModule;
        if (tsResolvedModule && !isVirtualSvelteFilepath(tsResolvedModule.resolvedFileName)) {
            return tsResolvedModule;
        }
        return ts.resolveModuleName(name, containingFile, compilerOptions, svelteSys)
            .resolvedModule;
    }
    return host;
}
/**
 * Generates a map to which we add the transformed code of Svelte files
 * early on when we first need to look at the file contents and can read
 * those transformed source later on.
 */
async function createSvelteMap(config) {
    const svelteFiles = new Map();
    // TODO detect Svelte version in here and set shimsPath accordingly if not given from above
    const noSvelteComponentTyped = config.svelteShimsPath
        .replace(/\\/g, '/')
        .endsWith('svelte2tsx/svelte-shims-v4.d.ts');
    const version = noSvelteComponentTyped ? undefined : '3.42.0';
    function add(path) {
        const normalizedPath = path.replace(/\\/g, '/');
        if (svelteFiles.has(normalizedPath)) {
            return svelteFiles.get(normalizedPath).isTsFile;
        }
        const code = ts.sys.readFile(path, 'utf-8');
        const isTsFile = /<script\s+[^>]*?lang=('|")(ts|typescript)('|")/.test(code);
        const transformed = svelte2tsx(code, {
            filename: path,
            isTsFile,
            mode: 'dts',
            version,
            noSvelteComponentTyped: noSvelteComponentTyped
        }).code;
        svelteFiles.set(normalizedPath, { transformed, isTsFile });
        return isTsFile;
    }
    return {
        add,
        get: (key) => { var _a; return (_a = svelteFiles.get(key.replace(/\\/g, '/'))) === null || _a === void 0 ? void 0 : _a.transformed; }
    };
}
function isSvelteFilepath(filePath) {
    return filePath.endsWith('.svelte');
}
function isTsFilepath(filePath) {
    return filePath.endsWith('.ts');
}
function isVirtualSvelteFilepath(filePath) {
    return filePath.endsWith('.svelte.ts') || filePath.endsWith('svelte.js');
}
function toRealSvelteFilepath(filePath) {
    return filePath.slice(0, -3); // -'.js'.length || -'.ts'.length
}
function ensureRealSvelteFilepath(filePath) {
    return isVirtualSvelteFilepath(filePath) ? toRealSvelteFilepath(filePath) : filePath;
}
function isSubpath(maybeParent, maybeChild) {
    const relative = path.relative(maybeParent, maybeChild);
    return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
}

export { emitDts, internalHelpers, svelte2tsx };
