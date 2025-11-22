/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@vscode/l10n", "../htmlLanguageTypes"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createScanner = createScanner;
    const l10n = require("@vscode/l10n");
    const htmlLanguageTypes_1 = require("../htmlLanguageTypes");
    class MultiLineStream {
        constructor(source, position) {
            this.source = source;
            this.len = source.length;
            this.position = position;
        }
        eos() {
            return this.len <= this.position;
        }
        getSource() {
            return this.source;
        }
        pos() {
            return this.position;
        }
        goBackTo(pos) {
            this.position = pos;
        }
        goBack(n) {
            this.position -= n;
        }
        advance(n) {
            this.position += n;
        }
        goToEnd() {
            this.position = this.source.length;
        }
        nextChar() {
            return this.source.charCodeAt(this.position++) || 0;
        }
        peekChar(n = 0) {
            return this.source.charCodeAt(this.position + n) || 0;
        }
        advanceIfChar(ch) {
            if (ch === this.source.charCodeAt(this.position)) {
                this.position++;
                return true;
            }
            return false;
        }
        advanceIfChars(ch) {
            let i;
            if (this.position + ch.length > this.source.length) {
                return false;
            }
            for (i = 0; i < ch.length; i++) {
                if (this.source.charCodeAt(this.position + i) !== ch[i]) {
                    return false;
                }
            }
            this.advance(i);
            return true;
        }
        advanceIfRegExp(regex) {
            const str = this.source.substr(this.position);
            const match = str.match(regex);
            if (match) {
                this.position = this.position + match.index + match[0].length;
                return match[0];
            }
            return '';
        }
        advanceUntilRegExp(regex) {
            const str = this.source.substr(this.position);
            const match = str.match(regex);
            if (match) {
                this.position = this.position + match.index;
                return match[0];
            }
            else {
                this.goToEnd();
            }
            return '';
        }
        advanceUntilChar(ch) {
            while (this.position < this.source.length) {
                if (this.source.charCodeAt(this.position) === ch) {
                    return true;
                }
                this.advance(1);
            }
            return false;
        }
        advanceUntilChars(ch) {
            while (this.position + ch.length <= this.source.length) {
                let i = 0;
                for (; i < ch.length && this.source.charCodeAt(this.position + i) === ch[i]; i++) {
                }
                if (i === ch.length) {
                    return true;
                }
                this.advance(1);
            }
            this.goToEnd();
            return false;
        }
        skipWhitespace() {
            const n = this.advanceWhileChar(ch => {
                return ch === _WSP || ch === _TAB || ch === _NWL || ch === _LFD || ch === _CAR;
            });
            return n > 0;
        }
        advanceWhileChar(condition) {
            const posNow = this.position;
            while (this.position < this.len && condition(this.source.charCodeAt(this.position))) {
                this.position++;
            }
            return this.position - posNow;
        }
    }
    const _BNG = '!'.charCodeAt(0);
    const _MIN = '-'.charCodeAt(0);
    const _LAN = '<'.charCodeAt(0);
    const _RAN = '>'.charCodeAt(0);
    const _FSL = '/'.charCodeAt(0);
    const _EQS = '='.charCodeAt(0);
    const _DQO = '"'.charCodeAt(0);
    const _SQO = '\''.charCodeAt(0);
    const _NWL = '\n'.charCodeAt(0);
    const _CAR = '\r'.charCodeAt(0);
    const _LFD = '\f'.charCodeAt(0);
    const _WSP = ' '.charCodeAt(0);
    const _TAB = '\t'.charCodeAt(0);
    const htmlScriptContents = {
        'text/x-handlebars-template': true,
        // Fix for https://github.com/microsoft/vscode/issues/77977
        'text/html': true,
    };
    function createScanner(input, initialOffset = 0, initialState = htmlLanguageTypes_1.ScannerState.WithinContent, emitPseudoCloseTags = false) {
        const stream = new MultiLineStream(input, initialOffset);
        let state = initialState;
        let tokenOffset = 0;
        let tokenType = htmlLanguageTypes_1.TokenType.Unknown;
        let tokenError;
        let hasSpaceAfterTag;
        let lastTag;
        let lastAttributeName;
        let lastTypeValue;
        function nextElementName() {
            return stream.advanceIfRegExp(/^[_:\w][_:\w-.\d]*/).toLowerCase();
        }
        function nextAttributeName() {
            return stream.advanceIfRegExp(/^[^\s"'></=\x00-\x0F\x7F\x80-\x9F]*/).toLowerCase();
        }
        function finishToken(offset, type, errorMessage) {
            tokenType = type;
            tokenOffset = offset;
            tokenError = errorMessage;
            return type;
        }
        function scan() {
            const offset = stream.pos();
            const oldState = state;
            const token = internalScan();
            if (token !== htmlLanguageTypes_1.TokenType.EOS && offset === stream.pos() && !(emitPseudoCloseTags && (token === htmlLanguageTypes_1.TokenType.StartTagClose || token === htmlLanguageTypes_1.TokenType.EndTagClose))) {
                console.warn('Scanner.scan has not advanced at offset ' + offset + ', state before: ' + oldState + ' after: ' + state);
                stream.advance(1);
                return finishToken(offset, htmlLanguageTypes_1.TokenType.Unknown);
            }
            return token;
        }
        function internalScan() {
            const offset = stream.pos();
            if (stream.eos()) {
                return finishToken(offset, htmlLanguageTypes_1.TokenType.EOS);
            }
            let errorMessage;
            switch (state) {
                case htmlLanguageTypes_1.ScannerState.WithinComment:
                    if (stream.advanceIfChars([_MIN, _MIN, _RAN])) { // -->
                        state = htmlLanguageTypes_1.ScannerState.WithinContent;
                        return finishToken(offset, htmlLanguageTypes_1.TokenType.EndCommentTag);
                    }
                    stream.advanceUntilChars([_MIN, _MIN, _RAN]); // -->
                    return finishToken(offset, htmlLanguageTypes_1.TokenType.Comment);
                case htmlLanguageTypes_1.ScannerState.WithinDoctype:
                    if (stream.advanceIfChar(_RAN)) {
                        state = htmlLanguageTypes_1.ScannerState.WithinContent;
                        return finishToken(offset, htmlLanguageTypes_1.TokenType.EndDoctypeTag);
                    }
                    stream.advanceUntilChar(_RAN); // >
                    return finishToken(offset, htmlLanguageTypes_1.TokenType.Doctype);
                case htmlLanguageTypes_1.ScannerState.WithinContent:
                    if (stream.advanceIfChar(_LAN)) { // <
                        if (!stream.eos() && stream.peekChar() === _BNG) { // !
                            if (stream.advanceIfChars([_BNG, _MIN, _MIN])) { // <!--
                                state = htmlLanguageTypes_1.ScannerState.WithinComment;
                                return finishToken(offset, htmlLanguageTypes_1.TokenType.StartCommentTag);
                            }
                            if (stream.advanceIfRegExp(/^!doctype/i)) {
                                state = htmlLanguageTypes_1.ScannerState.WithinDoctype;
                                return finishToken(offset, htmlLanguageTypes_1.TokenType.StartDoctypeTag);
                            }
                        }
                        if (stream.advanceIfChar(_FSL)) { // /
                            state = htmlLanguageTypes_1.ScannerState.AfterOpeningEndTag;
                            return finishToken(offset, htmlLanguageTypes_1.TokenType.EndTagOpen);
                        }
                        state = htmlLanguageTypes_1.ScannerState.AfterOpeningStartTag;
                        return finishToken(offset, htmlLanguageTypes_1.TokenType.StartTagOpen);
                    }
                    stream.advanceUntilChar(_LAN);
                    return finishToken(offset, htmlLanguageTypes_1.TokenType.Content);
                case htmlLanguageTypes_1.ScannerState.AfterOpeningEndTag:
                    const tagName = nextElementName();
                    if (tagName.length > 0) {
                        state = htmlLanguageTypes_1.ScannerState.WithinEndTag;
                        return finishToken(offset, htmlLanguageTypes_1.TokenType.EndTag);
                    }
                    if (stream.skipWhitespace()) { // white space is not valid here
                        return finishToken(offset, htmlLanguageTypes_1.TokenType.Whitespace, l10n.t('Tag name must directly follow the open bracket.'));
                    }
                    state = htmlLanguageTypes_1.ScannerState.WithinEndTag;
                    stream.advanceUntilChar(_RAN);
                    if (offset < stream.pos()) {
                        return finishToken(offset, htmlLanguageTypes_1.TokenType.Unknown, l10n.t('End tag name expected.'));
                    }
                    return internalScan();
                case htmlLanguageTypes_1.ScannerState.WithinEndTag:
                    if (stream.skipWhitespace()) { // white space is valid here
                        return finishToken(offset, htmlLanguageTypes_1.TokenType.Whitespace);
                    }
                    if (stream.advanceIfChar(_RAN)) { // >
                        state = htmlLanguageTypes_1.ScannerState.WithinContent;
                        return finishToken(offset, htmlLanguageTypes_1.TokenType.EndTagClose);
                    }
                    if (emitPseudoCloseTags && stream.peekChar() === _LAN) { // <
                        state = htmlLanguageTypes_1.ScannerState.WithinContent;
                        return finishToken(offset, htmlLanguageTypes_1.TokenType.EndTagClose, l10n.t('Closing bracket missing.'));
                    }
                    errorMessage = l10n.t('Closing bracket expected.');
                    break;
                case htmlLanguageTypes_1.ScannerState.AfterOpeningStartTag:
                    lastTag = nextElementName();
                    lastTypeValue = void 0;
                    lastAttributeName = void 0;
                    if (lastTag.length > 0) {
                        hasSpaceAfterTag = false;
                        state = htmlLanguageTypes_1.ScannerState.WithinTag;
                        return finishToken(offset, htmlLanguageTypes_1.TokenType.StartTag);
                    }
                    if (stream.skipWhitespace()) { // white space is not valid here
                        return finishToken(offset, htmlLanguageTypes_1.TokenType.Whitespace, l10n.t('Tag name must directly follow the open bracket.'));
                    }
                    state = htmlLanguageTypes_1.ScannerState.WithinTag;
                    stream.advanceUntilChar(_RAN);
                    if (offset < stream.pos()) {
                        return finishToken(offset, htmlLanguageTypes_1.TokenType.Unknown, l10n.t('Start tag name expected.'));
                    }
                    return internalScan();
                case htmlLanguageTypes_1.ScannerState.WithinTag:
                    if (stream.skipWhitespace()) {
                        hasSpaceAfterTag = true; // remember that we have seen a whitespace
                        return finishToken(offset, htmlLanguageTypes_1.TokenType.Whitespace);
                    }
                    if (hasSpaceAfterTag) {
                        lastAttributeName = nextAttributeName();
                        if (lastAttributeName.length > 0) {
                            state = htmlLanguageTypes_1.ScannerState.AfterAttributeName;
                            hasSpaceAfterTag = false;
                            return finishToken(offset, htmlLanguageTypes_1.TokenType.AttributeName);
                        }
                    }
                    if (stream.advanceIfChars([_FSL, _RAN])) { // />
                        state = htmlLanguageTypes_1.ScannerState.WithinContent;
                        return finishToken(offset, htmlLanguageTypes_1.TokenType.StartTagSelfClose);
                    }
                    if (stream.advanceIfChar(_RAN)) { // >
                        if (lastTag === 'script') {
                            if (lastTypeValue && htmlScriptContents[lastTypeValue]) {
                                // stay in html
                                state = htmlLanguageTypes_1.ScannerState.WithinContent;
                            }
                            else {
                                state = htmlLanguageTypes_1.ScannerState.WithinScriptContent;
                            }
                        }
                        else if (lastTag === 'style') {
                            state = htmlLanguageTypes_1.ScannerState.WithinStyleContent;
                        }
                        else {
                            state = htmlLanguageTypes_1.ScannerState.WithinContent;
                        }
                        return finishToken(offset, htmlLanguageTypes_1.TokenType.StartTagClose);
                    }
                    if (emitPseudoCloseTags && stream.peekChar() === _LAN) { // <
                        state = htmlLanguageTypes_1.ScannerState.WithinContent;
                        return finishToken(offset, htmlLanguageTypes_1.TokenType.StartTagClose, l10n.t('Closing bracket missing.'));
                    }
                    stream.advance(1);
                    return finishToken(offset, htmlLanguageTypes_1.TokenType.Unknown, l10n.t('Unexpected character in tag.'));
                case htmlLanguageTypes_1.ScannerState.AfterAttributeName:
                    if (stream.skipWhitespace()) {
                        hasSpaceAfterTag = true;
                        return finishToken(offset, htmlLanguageTypes_1.TokenType.Whitespace);
                    }
                    if (stream.advanceIfChar(_EQS)) {
                        state = htmlLanguageTypes_1.ScannerState.BeforeAttributeValue;
                        return finishToken(offset, htmlLanguageTypes_1.TokenType.DelimiterAssign);
                    }
                    state = htmlLanguageTypes_1.ScannerState.WithinTag;
                    return internalScan(); // no advance yet - jump to WithinTag
                case htmlLanguageTypes_1.ScannerState.BeforeAttributeValue:
                    if (stream.skipWhitespace()) {
                        return finishToken(offset, htmlLanguageTypes_1.TokenType.Whitespace);
                    }
                    let attributeValue = stream.advanceIfRegExp(/^[^\s"'`=<>]+/);
                    if (attributeValue.length > 0) {
                        if (stream.peekChar() === _RAN && stream.peekChar(-1) === _FSL) { // <foo bar=http://foo/>
                            stream.goBack(1);
                            attributeValue = attributeValue.substring(0, attributeValue.length - 1);
                        }
                        if (lastAttributeName === 'type') {
                            lastTypeValue = attributeValue;
                        }
                        if (attributeValue.length > 0) {
                            state = htmlLanguageTypes_1.ScannerState.WithinTag;
                            hasSpaceAfterTag = false;
                            return finishToken(offset, htmlLanguageTypes_1.TokenType.AttributeValue);
                        }
                    }
                    const ch = stream.peekChar();
                    if (ch === _SQO || ch === _DQO) {
                        stream.advance(1); // consume quote
                        if (stream.advanceUntilChar(ch)) {
                            stream.advance(1); // consume quote
                        }
                        if (lastAttributeName === 'type') {
                            lastTypeValue = stream.getSource().substring(offset + 1, stream.pos() - 1);
                        }
                        state = htmlLanguageTypes_1.ScannerState.WithinTag;
                        hasSpaceAfterTag = false;
                        return finishToken(offset, htmlLanguageTypes_1.TokenType.AttributeValue);
                    }
                    state = htmlLanguageTypes_1.ScannerState.WithinTag;
                    hasSpaceAfterTag = false;
                    return internalScan(); // no advance yet - jump to WithinTag
                case htmlLanguageTypes_1.ScannerState.WithinScriptContent:
                    // see http://stackoverflow.com/questions/14574471/how-do-browsers-parse-a-script-tag-exactly
                    let sciptState = 1;
                    while (!stream.eos()) {
                        const match = stream.advanceIfRegExp(/<!--|-->|<\/?script\s*\/?>?/i);
                        if (match.length === 0) {
                            stream.goToEnd();
                            return finishToken(offset, htmlLanguageTypes_1.TokenType.Script);
                        }
                        else if (match === '<!--') {
                            if (sciptState === 1) {
                                sciptState = 2;
                            }
                        }
                        else if (match === '-->') {
                            sciptState = 1;
                        }
                        else if (match[1] !== '/') { // <script
                            if (sciptState === 2) {
                                sciptState = 3;
                            }
                        }
                        else { // </script
                            if (sciptState === 3) {
                                sciptState = 2;
                            }
                            else {
                                stream.goBack(match.length); // to the beginning of the closing tag
                                break;
                            }
                        }
                    }
                    state = htmlLanguageTypes_1.ScannerState.WithinContent;
                    if (offset < stream.pos()) {
                        return finishToken(offset, htmlLanguageTypes_1.TokenType.Script);
                    }
                    return internalScan(); // no advance yet - jump to content
                case htmlLanguageTypes_1.ScannerState.WithinStyleContent:
                    stream.advanceUntilRegExp(/<\/style/i);
                    state = htmlLanguageTypes_1.ScannerState.WithinContent;
                    if (offset < stream.pos()) {
                        return finishToken(offset, htmlLanguageTypes_1.TokenType.Styles);
                    }
                    return internalScan(); // no advance yet - jump to content
            }
            stream.advance(1);
            state = htmlLanguageTypes_1.ScannerState.WithinContent;
            return finishToken(offset, htmlLanguageTypes_1.TokenType.Unknown, errorMessage);
        }
        return {
            scan,
            getTokenType: () => tokenType,
            getTokenOffset: () => tokenOffset,
            getTokenLength: () => stream.pos() - tokenOffset,
            getTokenEnd: () => stream.pos(),
            getTokenText: () => stream.getSource().substring(tokenOffset, stream.pos()),
            getScannerState: () => state,
            getTokenError: () => tokenError
        };
    }
});
