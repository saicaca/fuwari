/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var path = require("path");
var nls = require("../main");
var root = path.join(__dirname, '..', '..', '..', 'src', 'node', 'test');
describe('Localize', function () {
    it('Simple call', function () {
        var localize = nls.config({ locale: 'de-DE' })();
        var message = 'Hello World';
        assert.strictEqual(localize('key', message), message);
    });
    it('Simple call with separate load', function () {
        nls.config({ locale: 'de-DE' });
        var localize = nls.loadMessageBundle();
        var message = 'Hello World';
        assert.strictEqual(localize('key', message), message);
    });
    it('With args', function () {
        var localize = nls.config({ locale: 'de-DE' })();
        var message = '{0} {1}';
        assert.strictEqual(localize('key', message, 'Hello', 'World'), 'Hello World');
    });
    it('Pseudo', function () {
        var localize = nls.config({ locale: 'pseudo' })();
        var message = 'Hello World';
        assert.strictEqual(localize('key', message), '\uFF3BHeelloo Woorld\uFF3D');
    });
    it('Pseudo with args', function () {
        var localize = nls.config({ locale: 'pseudo' })();
        var message = 'Hello {0} World';
        assert.strictEqual(localize('key', message, 'bright'), '\uFF3BHeelloo bright Woorld\uFF3D');
    });
    it('External Data German flat', function () {
        var localize = nls.config({ locale: 'de-DE', messageFormat: nls.MessageFormat.file })(path.join(root, 'data'));
        assert.strictEqual(localize(0, null), 'Guten Tag Welt');
    });
    it('External Data German flat with extension', function () {
        var localize = nls.config({ locale: 'de-DE', messageFormat: nls.MessageFormat.file })(path.join(root, 'data.js'));
        assert.strictEqual(localize(0, null), 'Guten Tag Welt');
    });
    it('External Data German flat with extension separate load', function () {
        nls.config({ locale: 'de-DE', messageFormat: nls.MessageFormat.file });
        var localize = nls.loadMessageBundle(path.join(root, 'data.js'));
        assert.strictEqual(localize(0, null), 'Guten Tag Welt');
    });
    it('External Data German structured', function () {
        var localize = nls.config({ locale: 'de-DE', messageFormat: nls.MessageFormat.file })(path.join(root, 'dataStructured'));
        assert.strictEqual(localize(0, null), 'Guten Tag Welt');
        assert.strictEqual(localize(1, null), 'Auf Wiedersehen Welt');
    });
    it('External Bundle', function () {
        var localize = nls.config({ locale: 'de-DE', messageFormat: nls.MessageFormat.bundle, bundleFormat: nls.BundleFormat.standalone })(path.join(root, 'localize.test.js'));
        assert.strictEqual(localize(0, null), 'Guten Tag Welt');
    });
    it('Default data file', function () {
        var localize = nls.config({ locale: 'zh-tw', messageFormat: nls.MessageFormat.file })(path.join(root, 'data'));
        assert.strictEqual(localize(0, null), 'Hello World');
    });
});
//# sourceMappingURL=localize.test.js.map