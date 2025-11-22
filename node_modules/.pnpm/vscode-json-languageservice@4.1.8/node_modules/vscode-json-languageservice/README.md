# vscode-json-languageservice

JSON language service extracted from VSCode to be reused, e.g in the Monaco editor.

[![npm Package](https://img.shields.io/npm/v/vscode-json-languageservice.svg?style=flat-square)](https://www.npmjs.org/package/vscode-json-languageservice)
[![NPM Downloads](https://img.shields.io/npm/dm/vscode-json-languageservice.svg)](https://npmjs.org/package/vscode-json-languageservice)
[![Build Status](https://travis-ci.org/Microsoft/vscode-json-languageservice.svg?branch=master)](https://travis-ci.org/Microsoft/vscode-json-languageservice)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Why?

The _vscode-json-languageservice_ contains the language smarts behind the JSON editing experience of Visual Studio Code
and the Monaco editor.

- _doValidation_ analyses an input string and returns syntax and lint errors.
- _doComplete_ provides completion proposals for a given location.
- _doResolve_ resolves a completion proposals.
- _doHover_ provides a hover text for a given location.
- _findDocumentSymbols_ provides all symbols in the given document.
- _findDocumentColors_ provides all color symbols in the given document.
- _getColorPresentations_ returns available color formats for a color symbol.
- _format_ formats the code at the given range.
- _getFoldingRanges_ gets folding ranges for the given document.
- _getSelectionRanges_ gets selection ranges for a given location.
- _getMatchingSchemas_ matches a document against its schema and returns all AST nodes along with the matching sub schemas.
- _parseJSONDocument_ creates a JSON document from source code.
- _newJSONDocument_ creates a JSON document from an AST.

For the complete API see [jsonLanguageService.ts](./src/jsonLanguageService.ts) and [jsonLanguageTypes.ts](./src/jsonLanguageTypes.ts)

## Installation

    npm install --save vscode-json-languageservice

## Sample usage

See [sample.ts](./src/example/sample.ts) for an example on how to use the JSON language service.

To run the sample use `yarn sample`

## Development

    git clone https://github.com/microsoft/vscode-json-languageservice
    cd vscode-json-languageservice
    yarn

Use `yarn test` to compile and run tests


### How can I run and debug the service?

- open the folder in VSCode.
- set breakpoints, e.g. in `jsonCompletion.ts`
- run the Unit tests from the run viewlet and wait until a breakpoint is hit:
  ![image](https://user-images.githubusercontent.com/6461412/94239202-bdad4e80-ff11-11ea-99c3-cb9dbeb1c0b2.png)

### How can I run and debug the service inside an instance of VSCode?

- run VSCode out of sources setup as described here: https://github.com/Microsoft/vscode/wiki/How-to-Contribute
- use `yarn link vscode-json-languageservice` in `vscode/extensions/json-language-features/server` to run VSCode with the latest changes from `vscode-json-languageservice`
- run VSCode out of source (`vscode/scripts/code.sh|bat`) and open a `.json` file
- in VSCode window that is open on the `vscode-json-languageservice` sources, run command `Debug: Attach to Node process` and pick the `code-oss` process with the `json-language-features` path
  ![image](https://user-images.githubusercontent.com/6461412/94242925-061b3b00-ff17-11ea-8c17-8da15268f1a1.png)
- set breakpoints, e.g. in `jsonCompletion.ts`
- in the instance run from sources, invoke code completion in the `.json` file
