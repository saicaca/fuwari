# TypeSafe Path

This library is aim to explicitly annotate path format of the code, and throwing error when passing incorrect format paths.

The advantage is that we can avoid using `upath` to convert all paths to unix path, and ensure current code logic always correctly know the path format that should be processed.

Please note that you should only use it in your modules that are coupled to the filesystem.

## Usage

```ts
import * as path from 'typesafe-path';

/**
 * win32: __dirname is 'c:\\foo\\bar.js'
 * posix: __dirname is '/foo/bar.js'
 */
const osPath = __dirname as path.OsPath;
const win32Path = '..\\aaa\\bbb' as path.Win32Path;

/**
 * win32: 'c:\\foo\\aaa\\bbb' <-- good result
 * posix: '/foo/bar.js/..\\aaa\\bbb' <-- bad result
 */
path.resolve(osPath, win32Path);
//                   ^ Argument of type 'Win32Path' is not assignable to parameter of type 'OsPath | PosixPath'.

// Fixs
const posixPath = win32Path.replace(/\\/g, '/') as path.PosixPath;
path.resolve(osPath, posixPath); // no type error
```
