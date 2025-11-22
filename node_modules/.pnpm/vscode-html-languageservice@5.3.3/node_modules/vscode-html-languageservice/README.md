# vscode-html-languageservice
HTML language service extracted from VSCode to be reused, e.g in the Monaco editor.

[![npm Package](https://img.shields.io/npm/v/vscode-html-languageservice.svg?style=flat-square)](https://www.npmjs.org/package/vscode-html-languageservice)
[![NPM Downloads](https://img.shields.io/npm/dm/vscode-html-languageservice.svg)](https://npmjs.org/package/vscode-html-languageservice)
[![Build Status](https://github.com/microsoft/vscode-html-languageservice/actions/workflows/node.js.yml/badge.svg)](https://github.com/microsoft/vscode-html-languageservice/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Why?
----

The _vscode-html-languageservice_ contains the language smarts behind the HTML editing experience of Visual Studio Code
and the Monaco editor.

 - *doComplete* / *doComplete2* (async) provide completion proposals for a given location.
 - *setCompletionParticipants* allows participant to provide suggestions for specific tokens.
 - *doHover* provides hover information at a given location.

 - *format* formats the code at the given range.
 - *findDocumentLinks* finds all links in the document.
 - *findDocumentSymbols* finds all the symbols in the document.
 - *getFoldingRanges* return folding ranges for the given document.
 - *getSelectionRanges* return the selection ranges for the given document.
 ...

 For the complete API see [htmlLanguageService.ts](./src/htmlLanguageService.ts) and [htmlLanguageTypes.ts](./src/htmlLanguageTypes.ts)

Installation
------------

    npm install --save vscode-html-languageservice

Development
-----------

- clone this repo, run `npm i``
- `npm test` to compile and run tests


How can I run and debug the service?

- open the folder in VSCode.
- set breakpoints, e.g. in `htmlCompletion.ts`
- run the Unit tests from the run viewlet and wait until a breakpoint is hit:
![image](https://user-images.githubusercontent.com/6461412/94239202-bdad4e80-ff11-11ea-99c3-cb9dbeb1c0b2.png)


How can I run and debug the service inside an instance of VSCode?

- run VSCode out of sources setup as described here: https://github.com/Microsoft/vscode/wiki/How-to-Contribute
- link the folder of the `vscode-html-languageservice` repo to `vscode/extensions/html-language-features/server` to run VSCode with the latest changes from that folder:
  - cd `vscode-html-languageservice`, `npm link`
  - cd `vscode/extensions/html-language-features/server`, `npm link vscode-html-languageservice`
- run VSCode out of source (`vscode/scripts/code.sh|bat`) and open a `.html` file
- in VSCode window that is open on the `vscode-html-languageservice` sources, run command `Debug: Attach to Node process` and pick the `code-oss` process with the `html-language-features` path
![image](https://user-images.githubusercontent.com/6461412/94239296-dfa6d100-ff11-11ea-8e30-6444cf5defb8.png)
- set breakpoints, e.g. in `htmlCompletion.ts`
- in the instance run from sources, invoke code completion in the `.html` file


License
-------

(MIT License)

Copyright 2016-2023, Microsoft

`src/languageFacts/data/webCustomData.ts` (shipped as `lib/esm/languageFacts/data/webCustomData.ts` and `lib/umd/languageFacts/data/webCustomData.ts`)
are built upon content from [Mozilla Developer Network](https://developer.mozilla.org/en-US/docs/Web) and distributed under CC BY-SA 2.5.
