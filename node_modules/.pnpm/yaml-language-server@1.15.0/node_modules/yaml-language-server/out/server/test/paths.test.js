"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const path_1 = require("path");
const paths_1 = require("../src/languageservice/utils/paths");
const vscode_uri_1 = require("vscode-uri");
class TestWorkspace {
    constructor(workspaceFolders, workspaceRoot) {
        this.folders = workspaceFolders;
        this.root = vscode_uri_1.URI.parse(workspaceRoot);
    }
    resolve(relPath) {
        return (0, paths_1.relativeToAbsolutePath)(this.folders, this.root, relPath);
    }
}
const ws1 = new TestWorkspace([
    {
        uri: 'file:///home/aFolder/',
        name: 'aFolder',
    },
], 'file:///home/aFolder/');
const ws2 = new TestWorkspace([
    {
        uri: 'file:///usr/testuser/projects/workspace/folder-1/',
        name: 'folder-1',
    },
    {
        uri: 'file:///usr/testuser/projects/workspace/folder-2/',
        name: 'folder-2',
    },
    {
        uri: 'file:///usr/testuser/projects/workspace/folder-3/',
        name: 'folder-3',
    },
], 'file:///usr/testuser/projects/workspace/');
const ws3 = new TestWorkspace([
    {
        uri: 'file:///c%3A/Users/testuser/dev/carrots',
        name: 'carrots',
    },
    {
        uri: 'file:///c%3A/Users/testuser/dev/potatoes',
        name: 'potatoes',
    },
], 'file:///c%3A/Users/testuser/dev/potatoes');
const ws4 = new TestWorkspace([
    {
        uri: 'file:///c%3A/Users/testuser/dev/test',
        name: 'test',
    },
    {
        uri: 'file:///c%3A/Users/testuser/dev/test2',
        name: 'test2',
    },
], 'file:///c%3A/Users/testuser/dev/test2');
const checkBadPath = (path) => {
    it('Rejects "' + path + '"', () => {
        assert(!(0, paths_1.isRelativePath)(path));
    });
};
const checkGoodPath = (path, expect1, expect2, expect3) => {
    describe('Relative path = "' + path + '"', () => {
        it('Recognises relative path', () => {
            assert((0, paths_1.isRelativePath)(path));
        });
        it('Resolves relative path in single-root workspace', () => {
            assert.equal(ws1.resolve(path), expect1);
        });
        it('Resolves relative path in multi-root workspace', () => {
            assert.equal(ws2.resolve(path), expect2);
        });
        it('Resolves relative path in multi-root nested workspace', () => {
            assert.equal(ws3.resolve(path), expect3);
        });
    });
};
describe('File path tests', () => {
    describe('Recognises not relative paths', () => {
        checkBadPath((0, path_1.join)('/', 'file.json'));
        checkBadPath((0, path_1.join)('/', 'absolutepath', 'file.json.'));
        checkBadPath((0, path_1.join)('//', 'notrelativepath', 'file.json'));
        checkBadPath((0, path_1.join)('C:', 'notrelativepath', 'file.json'));
        checkBadPath((0, path_1.join)('directory.json', '/'));
        checkBadPath((0, path_1.join)('.', 'dir', 'subdir', '/'));
    });
    describe('Recognises and correctly resolves relative paths', () => {
        checkGoodPath('file.json', 'file:///home/aFolder/file.json', 'file:///usr/testuser/projects/workspace/file.json', 'file:///c%3A/Users/testuser/dev/potatoes/file.json');
        checkGoodPath('file.long.extension.json', 'file:///home/aFolder/file.long.extension.json', 'file:///usr/testuser/projects/workspace/file.long.extension.json', 'file:///c%3A/Users/testuser/dev/potatoes/file.long.extension.json');
        checkGoodPath((0, path_1.join)('.', 'file.json'), 'file:///home/aFolder/file.json', 'file:///usr/testuser/projects/workspace/file.json', 'file:///c%3A/Users/testuser/dev/potatoes/file.json');
        checkGoodPath((0, path_1.join)('.', 'folder', 'file.json'), 'file:///home/aFolder/folder/file.json', 'file:///usr/testuser/projects/workspace/folder/file.json', 'file:///c%3A/Users/testuser/dev/potatoes/folder/file.json');
        checkGoodPath((0, path_1.join)('.', 'long', 'path', 'to', 'file.json'), 'file:///home/aFolder/long/path/to/file.json', 'file:///usr/testuser/projects/workspace/long/path/to/file.json', 'file:///c%3A/Users/testuser/dev/potatoes/long/path/to/file.json');
        checkGoodPath((0, path_1.join)('..', 'file.json'), 'file:///home/file.json', 'file:///usr/testuser/projects/file.json', 'file:///c%3A/Users/testuser/dev/file.json');
        checkGoodPath((0, path_1.join)('.', 'relativepath', '..', 'file.json'), 'file:///home/aFolder/file.json', 'file:///usr/testuser/projects/workspace/file.json', 'file:///c%3A/Users/testuser/dev/potatoes/file.json');
        checkGoodPath((0, path_1.join)('..', '..', 'relative', 'path', 'file.json'), 'file:///relative/path/file.json', 'file:///usr/testuser/relative/path/file.json', 'file:///c%3A/Users/testuser/relative/path/file.json');
        checkGoodPath((0, path_1.join)('..', '..', 'relative', '@path', 'file.json'), 'file:///relative/%40path/file.json', 'file:///usr/testuser/relative/%40path/file.json', 'file:///c%3A/Users/testuser/relative/%40path/file.json');
        describe('Relative path = a workspace folder', () => {
            const path1 = (0, path_1.join)('aFolder', 'file.json');
            const path2 = (0, path_1.join)('folder-2', 'file.json');
            const path3 = (0, path_1.join)('carrots', 'file.json');
            const path4 = (0, path_1.join)('test', 'test.json');
            it('Recognises relative path "' + path1 + '"', () => {
                assert((0, paths_1.isRelativePath)(path1));
            });
            it('Resolves "' + path1 + '" in single-root workspace', () => {
                assert.equal(ws1.resolve(path1), 'file:///home/aFolder/file.json');
            });
            it('Resolves "' + path2 + '" in multi-root workspace', () => {
                assert.equal(ws2.resolve(path2), 'file:///usr/testuser/projects/workspace/folder-2/file.json');
            });
            it('Resolves "' + path3 + '" in multi-root nested workspace', () => {
                assert.equal(ws3.resolve(path3), 'file:///c%3A/Users/testuser/dev/carrots/file.json');
            });
            it('Resolves "' + path4 + '" in multi-root nested workspace', () => {
                assert.equal(ws4.resolve(path4), 'file:///c%3A/Users/testuser/dev/test/test.json');
            });
        });
        describe('Path with mixed delimiters (Windows only)', () => {
            const path = 'some/strange\\but/functional\\path\\file.json';
            it('Recognises relative path "' + path + '"', function () {
                if (process.platform !== 'win32') {
                    this.skip();
                }
                else {
                    assert((0, paths_1.isRelativePath)(path));
                }
            });
            it('Resolves "' + path + '" in single-root workspace', function () {
                if (process.platform !== 'win32') {
                    this.skip();
                }
                else {
                    assert.equal(ws1.resolve(path), 'file:///home/aFolder/some/strange/but/functional/path/file.json');
                }
            });
            it('Resolves "' + path + '" in multi-root workspace', function () {
                if (process.platform !== 'win32') {
                    this.skip();
                }
                else {
                    assert.equal(ws2.resolve(path), 'file:///usr/testuser/projects/workspace/some/strange/but/functional/path/file.json');
                }
            });
            it('Resolves "' + path + '" in multi-root nested workspace', function () {
                if (process.platform !== 'win32') {
                    this.skip();
                }
                else {
                    assert.equal(ws3.resolve(path), 'file:///c%3A/Users/testuser/dev/potatoes/some/strange/but/functional/path/file.json');
                }
            });
        });
        describe('Tests for workspaceFoldersChanged', () => {
            it('workspaceFolders are added correctly', () => {
                const newWorkspaceFolders = (0, paths_1.workspaceFoldersChanged)(ws2.folders, {
                    added: [
                        {
                            name: 'folder-4',
                            uri: 'file:///usr/testuser/projects/workspace/folder-4/',
                        },
                    ],
                    removed: [],
                });
                assert.equal(newWorkspaceFolders.length, 4);
                assert.equal(newWorkspaceFolders[0].name, 'folder-1');
                assert.equal(newWorkspaceFolders[0].uri, 'file:///usr/testuser/projects/workspace/folder-1/');
                assert.equal(newWorkspaceFolders[1].name, 'folder-2');
                assert.equal(newWorkspaceFolders[1].uri, 'file:///usr/testuser/projects/workspace/folder-2/');
                assert.equal(newWorkspaceFolders[2].name, 'folder-3');
                assert.equal(newWorkspaceFolders[2].uri, 'file:///usr/testuser/projects/workspace/folder-3/');
                assert.equal(newWorkspaceFolders[3].name, 'folder-4');
                assert.equal(newWorkspaceFolders[3].uri, 'file:///usr/testuser/projects/workspace/folder-4/');
            });
            it('workspaceFolders are not added if duplicate uri', () => {
                const newWorkspaceFolders = (0, paths_1.workspaceFoldersChanged)(ws2.folders, {
                    added: [
                        {
                            name: 'folder-3',
                            uri: 'file:///usr/testuser/projects/workspace/folder-3/',
                        },
                    ],
                    removed: [],
                });
                assert.equal(newWorkspaceFolders.length, 3);
                assert.equal(newWorkspaceFolders[0].name, 'folder-1');
                assert.equal(newWorkspaceFolders[0].uri, 'file:///usr/testuser/projects/workspace/folder-1/');
                assert.equal(newWorkspaceFolders[1].name, 'folder-2');
                assert.equal(newWorkspaceFolders[1].uri, 'file:///usr/testuser/projects/workspace/folder-2/');
                assert.equal(newWorkspaceFolders[2].name, 'folder-3');
                assert.equal(newWorkspaceFolders[2].uri, 'file:///usr/testuser/projects/workspace/folder-3/');
            });
            it('workspaceFolders are removed correctly', () => {
                const newWorkspaceFolders = (0, paths_1.workspaceFoldersChanged)(ws2.folders, {
                    added: [],
                    removed: [
                        {
                            name: 'folder-3',
                            uri: 'file:///usr/testuser/projects/workspace/folder-3/',
                        },
                    ],
                });
                assert.equal(newWorkspaceFolders.length, 2);
                assert.equal(newWorkspaceFolders[0].name, 'folder-1');
                assert.equal(newWorkspaceFolders[0].uri, 'file:///usr/testuser/projects/workspace/folder-1/');
                assert.equal(newWorkspaceFolders[1].name, 'folder-2');
                assert.equal(newWorkspaceFolders[1].uri, 'file:///usr/testuser/projects/workspace/folder-2/');
            });
            it('workspaceFolders empty event does nothing', () => {
                const newWorkspaceFolders = (0, paths_1.workspaceFoldersChanged)(ws2.folders, {
                    added: [],
                    removed: [],
                });
                assert.equal(newWorkspaceFolders.length, 3);
                assert.equal(newWorkspaceFolders[0].name, 'folder-1');
                assert.equal(newWorkspaceFolders[0].uri, 'file:///usr/testuser/projects/workspace/folder-1/');
                assert.equal(newWorkspaceFolders[1].name, 'folder-2');
                assert.equal(newWorkspaceFolders[1].uri, 'file:///usr/testuser/projects/workspace/folder-2/');
                assert.equal(newWorkspaceFolders[2].name, 'folder-3');
                assert.equal(newWorkspaceFolders[2].uri, 'file:///usr/testuser/projects/workspace/folder-3/');
            });
        });
    });
});
//# sourceMappingURL=paths.test.js.map