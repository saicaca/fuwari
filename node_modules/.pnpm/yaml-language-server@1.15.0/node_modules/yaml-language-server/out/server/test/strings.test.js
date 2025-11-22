"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const strings_1 = require("../src/languageservice/utils/strings");
const assert = require("assert");
const chai_1 = require("chai");
describe('String Tests', () => {
    describe('startsWith', function () {
        it('String with different lengths', () => {
            const one = 'hello';
            const other = 'goodbye';
            const result = (0, strings_1.startsWith)(one, other);
            assert.equal(result, false);
        });
        it('String with same length different first letter', () => {
            const one = 'hello';
            const other = 'jello';
            const result = (0, strings_1.startsWith)(one, other);
            assert.equal(result, false);
        });
        it('Same string', () => {
            const one = 'hello';
            const other = 'hello';
            const result = (0, strings_1.startsWith)(one, other);
            assert.equal(result, true);
        });
    });
    describe('endsWith', function () {
        it('String with different lengths', () => {
            const one = 'hello';
            const other = 'goodbye';
            const result = (0, strings_1.endsWith)(one, other);
            assert.equal(result, false);
        });
        it('Strings that are the same', () => {
            const one = 'hello';
            const other = 'hello';
            const result = (0, strings_1.endsWith)(one, other);
            assert.equal(result, true);
        });
        it('Other is smaller then one', () => {
            const one = 'hello';
            const other = 'hi';
            const result = (0, strings_1.endsWith)(one, other);
            assert.equal(result, false);
        });
    });
    describe('convertSimple2RegExp', function () {
        it('Test of convertRegexString2RegExp', () => {
            const result = (0, strings_1.convertSimple2RegExp)('/toc\\.yml/i').test('TOC.yml');
            assert.equal(result, true);
        });
        it('Test of convertGlobalPattern2RegExp', () => {
            let result = (0, strings_1.convertSimple2RegExp)('toc.yml').test('toc.yml');
            assert.equal(result, true);
            result = (0, strings_1.convertSimple2RegExp)('toc.yml').test('TOC.yml');
            assert.equal(result, false);
        });
    });
    describe('safeCreateUnicodeRegExp', () => {
        it('should create unicode RegExp for non unicode patterns', () => {
            const result = (0, strings_1.safeCreateUnicodeRegExp)(
            // eslint-disable-next-line prettier/prettier
            '^([2-9])\\.([0-9]+)\\.([0-9]+)(\\-[0-9a-z-]+(\\.[0-9a-z-]+)*)?(\\+[0-9A-Za-z-]+(\\.[0-9A-Za-z-]+)*)?$');
            (0, chai_1.expect)(result).is.not.undefined;
        });
        it('should create unicode RegExp for non unicode patterns2', () => {
            // eslint-disable-next-line prettier/prettier
            const result = (0, strings_1.safeCreateUnicodeRegExp)('^[^\\/~\\^\\: \\[\\]\\\\]+(\\/[^\\/~\\^\\: \\[\\]\\\\]+)*$');
            (0, chai_1.expect)(result).is.not.undefined;
        });
        it('should create unicode RegExp for non unicode patterns3', () => {
            // eslint-disable-next-line prettier/prettier
            const result = (0, strings_1.safeCreateUnicodeRegExp)('^(\\s?)+=[^\\=](.+)');
            (0, chai_1.expect)(result).is.not.undefined;
        });
        it('should create unicode RegExp for non unicode patterns4', () => {
            // eslint-disable-next-line prettier/prettier
            const result = (0, strings_1.safeCreateUnicodeRegExp)('^x-[\\w\\d\\.\\-\\_]+$');
            (0, chai_1.expect)(result).is.not.undefined;
        });
        it('should create unicode RegExp for non unicode patterns5', () => {
            // eslint-disable-next-line prettier/prettier
            const result = (0, strings_1.safeCreateUnicodeRegExp)('^[\\w\\-_]+$');
            (0, chai_1.expect)(result).is.not.undefined;
        });
    });
});
//# sourceMappingURL=strings.test.js.map