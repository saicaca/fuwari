"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const textBuffer_1 = require("../src/languageservice/utils/textBuffer");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const assert = require("assert");
describe('TextBuffer', () => {
    it('getLineLength should return actual line length', () => {
        const buffer = new textBuffer_1.TextBuffer(vscode_languageserver_textdocument_1.TextDocument.create('file://foo/bar', 'yaml', 1, 'Foo\nbar'));
        const length = buffer.getLineLength(0);
        assert.strictEqual(length, 4);
        const length2 = buffer.getLineLength(1);
        assert.strictEqual(length2, 3);
    });
    it('getLineLength should return actual line length, win style', () => {
        const buffer = new textBuffer_1.TextBuffer(vscode_languageserver_textdocument_1.TextDocument.create('file://foo/bar', 'yaml', 1, 'Foo\r\nbar'));
        const length = buffer.getLineLength(0);
        assert.strictEqual(length, 5);
        const length2 = buffer.getLineLength(1);
        assert.strictEqual(length2, 3);
    });
    it('getLineContent should return actual line content', () => {
        const buffer = new textBuffer_1.TextBuffer(vscode_languageserver_textdocument_1.TextDocument.create('file://foo/bar', 'yaml', 1, 'Foo\nbar\nfooBar\nsome'));
        const line = buffer.getLineContent(1);
        assert.strictEqual(line, 'bar\n');
    });
    it('getLineContent should return last line', () => {
        const buffer = new textBuffer_1.TextBuffer(vscode_languageserver_textdocument_1.TextDocument.create('file://foo/bar', 'yaml', 1, 'Foo\nbar\nfooBar\nsome'));
        const line = buffer.getLineContent(3);
        assert.strictEqual(line, 'some');
    });
    it('getLineCharCode should return charCode', () => {
        const buffer = new textBuffer_1.TextBuffer(vscode_languageserver_textdocument_1.TextDocument.create('file://foo/bar', 'yaml', 1, 'Foo\nbar\nfooBar\nsome'));
        const charCode = buffer.getLineCharCode(3, 3);
        assert.strictEqual(charCode, 'B'.charCodeAt(0));
    });
});
//# sourceMappingURL=textBuffer.test.js.map