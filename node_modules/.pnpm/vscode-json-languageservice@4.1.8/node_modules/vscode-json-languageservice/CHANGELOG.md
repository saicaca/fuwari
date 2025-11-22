
4.1.6 / 2021-07-16
================
 * Replace minimatch with glob-to-regexp
 
4.1.0 / 2021-04-24
================
 * `SchemaConfiguration.fileMatch` now supports glob patterns (e.g. /foo/**/bar.json')

4.0.0 / 2020-12-14
================
 * Update to `vscode-languageserver-types@3.16`
 * Removed deprecated `findColorSymbols`

3.11.0 / 2020-11-30
================
 * new API `FormattingOptions.insertFinalNewline`

3.10.0 / 2020-11-03
================
 * new API `findLinks` return links for local `$ref` links. Replaces `findDefinition` which no longer returns results ( kept for API compatibility)

3.9.0 / 2020-09-28
=================
 * new API `DocumentLanguageSettings.schemaValidation`. The severity of problems from schema validation. If set to 'ignore', schema validation will be skipped. If not set, 'warning' is used.
 * new API `DocumentLanguageSettings.schemaRequest`. The severity of problems that occurred while resolving and loading schemas. If set to 'ignore', schema resolving problems are not reported. If not set, 'warning' is used. 

3.8.0 / 2020-08-02
=================
 * new API `LanguageService.getMatchingSchemas`. Matches a document against its schema and list all AST nodes along with the matching sub schemas. 

3.7.0 / 2020-06-04
==================
 * New API `JSONSchema.suggestSortText` to set the sort order of completion proposals (VS Code specific JSON schema extension)

3.6.0 / 2020-04-27
==================
 * New API `findDefinition` to find a definition of a `$ref` link

3.5.0 / 2020-02-20
==================
 * Support for exclusive file pattern starting with '!'. A file match consists of an array of patterns. A match succeeds when there is at least one pattern matching and last matching pattern does not start with '!'.

3.4.4 / 2019-11-04
==================
 * Using `vscode-languageserver-textdocument` for TextDocument

3.4.0 / 2019-10-28
==================
 * Added `DocumentSymbolsContext` and `ColorInformationContext` with `resultLimit` and `onResultLimitExceeded`. `onResultLimitExceeded` is called when the result was cropped.
 * Added commit characters for completion proposals (if supported by ClientCapabilities)
 * Warn when using draft-03 or draft-08 schemas

3.3.4 / 2019-09-20
==================
 * Renamed `schema.allowsTrailingCommas` -> `schema.allowTrailingCommas`

3.3.3 / 2019-08-29
==================
 * Schemas can configure whether comments and/or trailing commas are permitted.

3.3.0 / 2019-06-12
==================
 * New API `LanguageService.getSelectionRanges` to get semantic selection ranges.
 * Manage schema dependencies so that `resetSchema` also resets schemas that depend on the schema.

3.2.0 / 2018-09-27
==================
 * New API `LanguageServiceParams.ClientCapabilities` to define what LSP capabilities the client supports.
 * For the best experiences, clients should always use `LanguageServiceParams.ClientCapabilities.LATEST`, which has all the latest LSP capabilities enabled.
 * `LanguageServiceParams.ClientCapabilities` can allow `MarkupKind.Markdown` as valid documentationFormat (used by completions if schemas use `markdownDescription` or `markdownEnumDescriptions`).
 * Snippets can now provide the description also in markdown format.
 * Bundled draft-07-schema with descriptions.
 * Propose `examples` in code completions.

3.1.5 / 2018-08-14
==================
 * support for JSON schema draft-07
 * New API `LanguageService.findDocumentSymbols2` to get document symbols as `DocumentSymbol[]`

3.1.2 / 2018-07-25
==================
 * New API `LanguageService.getFoldingRanges`
 * doValidation can also be used with a given schema

3.1.0 / 2018-04-09
==================
 * new APIs: `newJSONDocument` to create a JSON document from a custom AST
 * new API types: ObjectASTNode, PropertyASTNode, ArrayASTNode, StringASTNode, NumberASTNode, BooleanASTNode, NullASTNode that allow creating a custom AST

3.0.9 / 2018-03-07
==================
  * Provide ems modules in lib/esm

3.0.2 / 2017-01-27
==================
  * Added document specific validation parameters: `DocumentLanguageSettings`
  * API to define the severity of reported comments and trailing commas (`DocumentLanguageSettings.comments`, `DocumentLanguageSettings.trailingCommas`)

3.0.0 / 2017-01-11
==================
  * Changed parameters of API `LanguageService.getColorPresentations` to separate color and range
.
2.0.19 / 2017-09-21
===================
  * New API `LanguageService.getColorPresentations` returning presentations for a given color. 
  * New API type `ColorPresentation` added.
  
2.0.15 / 2017-08-28
===================
  * New API `LanguageService.findDocumentColors` returning the location and value of all colors in a document. 
  * New API types `ColorInformation` and `Color` added.
  * Deprecated `LanguageService.findColorSymbols`. Use `LanguageService.findDocumentColors` instead.

2.0.8 / 2017-04-25
==================
  * error code for CommentsNotAllowed

2.0.5 / 2017-03-27
==================
  * Add new API findColorSymbols that returns all color values in a JSON document. To mark a value as a color, specify `"format": "color"` in the schema.

2.0.4 / 2017-02-27
==================
  * Support for custom schema property 'patternErrorMessage'. The message is used as error message if the object is of type string and has a 'pattern' property that does not match the object to validate.

2.0.1 / 2017-02-21
==================
  * Fixes for formatting content with errors

2.0.0 / 2017-02-17
==================
  * Updating to [language server type 3.0](https://github.com/Microsoft/vscode-languageserver-node/tree/master/types) API
