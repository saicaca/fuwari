### 1.15.0
- Fix: some small type issues [#918](https://github.com/redhat-developer/yaml-language-server/pull/918)
- Add: volar-service-yaml to clients [#920](https://github.com/redhat-developer/yaml-language-server/pull/920)
- Fix: Remove ide-yaml from known clients [#921](https://github.com/redhat-developer/yaml-language-server/pull/921)
- Fix: schema loading performance [#923](https://github.com/redhat-developer/yaml-language-server/pull/923)
- Fix: undefined error in mergingResult.problemArgs [#924](https://github.com/redhat-developer/yaml-language-server/pull/924)
- Add: unify string insert text for array and property [#934](https://github.com/redhat-developer/yaml-language-server/pull/934)
- Add: Improve some special cases for selection ranges [#939](https://github.com/redhat-developer/yaml-language-server/pull/939)
- Fix: show all enums on hover [#942](https://github.com/redhat-developer/yaml-language-server/pull/942)
- Fix: update README syntax highlighting [#945](https://github.com/redhat-developer/yaml-language-server/pull/945)
- Fix: render examples as yaml on hover [#947](https://github.com/redhat-developer/yaml-language-server/pull/947)
- Fix: snippets in additionalProperties [#951](https://github.com/redhat-developer/yaml-language-server/pull/951)
- Fix: crash when url is undefined [#954](https://github.com/redhat-developer/yaml-language-server/pull/954)
- Fix: Add null check for customTags [#955](https://github.com/redhat-developer/yaml-language-server/pull/955)

Thanks to [Remco Haszing](https://github.com/remcohaszing), [Petr Spacek](https://github.com/p-spacek), [Tony](https://github.com/Legend-Master), [Gustav Eikaas](https://github.com/GustavEikaas), [Skip Baney](https://github.com/twelvelabs) and [Pierre Prinetti](https://github.com/pierreprinetti) for your contributions.

### 1.14.0
- Fix: Request textDocument/hover failed with message: Invalid regular expression: /(?s).*/: Invalid group [#874](https://github.com/redhat-developer/yaml-language-server/issues/874)
- Fix: nested anyof const [#888](https://github.com/redhat-developer/yaml-language-server/pull/888)
- Fix: Parsing example object as plain string [#889](https://github.com/redhat-developer/yaml-language-server/issues/889)
- Fix: Improve smart select [#307](https://github.com/redhat-developer/vscode-yaml/issues/307)
- Fix: Local YAML schema applied to schema file itself [#894](https://github.com/redhat-developer/vscode-yaml/issues/894)
- Fix: Recursive anchors crash extension [#897](https://github.com/redhat-developer/yaml-language-server/issues/897)

Thanks to [Tony](https://github.com/Legend-Master),[Ace](https://github.com/AceTheCreator) and [PetrSpacek](https://github.com/p-spacek) for your contributions.

### 1.13.0
- Fix: The default value for keyorder [#859](https://github.com/redhat-developer/yaml-language-server/pull/859)
- Fix: older changelog heading levels [#861](https://github.com/redhat-developer/yaml-language-server/pull/861)
- Fix: hover behavior when indentation not set [#863](https://github.com/redhat-developer/yaml-language-server/pull/863)
- Add: Run sarif seperately [#866](https://github.com/redhat-developer/yaml-language-server/pull/866)
- Fix: Formatting YAML file inserts ternary operators [#255](https://github.com/redhat-developer/vscode-yaml/issues/255)
- Fix: Mark settings readonly [#868](https://github.com/redhat-developer/yaml-language-server/pull/868)

Thanks to [Kasama](https://github.com/Kasama)

### 1.12.0
- Fix: Completion Value with dash [#832](https://github.com/redhat-developer/yaml-language-server/pull/832)
- Add: Enforce alphabetical ordering of keys in mappings and provide codeaction to fix it. [#839](https://github.com/redhat-developer/yaml-language-server/pull/839)
- Fix: Value completion with trailing spaces [#834](https://github.com/redhat-developer/yaml-language-server/pull/834)
- Add: IPv4 and IPv6 validation [#843](https://github.com/redhat-developer/yaml-language-server/pull/843)
- Fix: Type errors inform wrong type when parent schema has keyword "title" [#845](https://github.com/redhat-developer/yaml-language-server/issues/845)
- Fix: Anchor diagnostics [#846](https://github.com/redhat-developer/yaml-language-server/pull/846)
- Fix: Underscore being escaped in description attribute when hovering over an attribute [#886](https://github.com/redhat-developer/vscode-yaml/issues/886)
- Add: OpenShift Toolkit extension recommendation [#892](https://github.com/redhat-developer/vscode-yaml/pull/892)

Thanks to Petr Spacek

### 1.11.0
- Fix: only the first choice is shown when hovering anyOf-typed properties [#784](https://github.com/redhat-developer/vscode-yaml/issues/784)
- Fix: Description in the schema root does not get displayed [#809](https://github.com/redhat-developer/vscode-yaml/issues/809)
- Fix: yaml.validation.error telemetry events are broken [#816](https://github.com/redhat-developer/vscode-yaml/issues/816)
- Add: add diagnostic data with missing properties [#775](https://github.com/redhat-developer/yaml-language-server/pull/775)
- Fix: Can't suggest object correctly with certain schema definition. [#769](https://github.com/redhat-developer/yaml-language-server/issues/769)
- Fix: Property shows up multiple times in completions [#829](https://github.com/redhat-developer/vscode-yaml/issues/829)
- Fix: oneOf validation of keys using "required" not working since 1.3.0 [#769](https://github.com/redhat-developer/vscode-yaml/issues/769)
- Fix: incorrect behavior of keys with quotes [#842](https://github.com/redhat-developer/vscode-yaml/issues/842)
- Fix: bad completion with array of objects [#793](https://github.com/redhat-developer/yaml-language-server/issues/793)
- Add: Modeline takes precendence over registerContributor API [#806](https://github.com/redhat-developer/yaml-language-server/pull/806)

Thanks to Petr Spacek,Josh Pinkney

### 1.10.0
- Fix: TypeError: i.startsWith is not a function [#747](https://github.com/redhat-developer/yaml-language-server/issues/747)
- Fix: fix: autocomplete indent on object within an array [#751](https://github.com/redhat-developer/yaml-language-server/pull/751)
- Add: Yaml style linting to forbid flow style [#753](https://github.com/redhat-developer/yaml-language-server/pull/753)
- Fix: enum validation [#803](https://github.com/redhat-developer/vscode-yaml/issues/803)
- Fix: autocompletion problem when value is null inside anyOf object [#684](https://github.com/redhat-developer/yaml-language-server/issues/684)
- Fix: indentation with extra spaces after cursor. [#764](https://github.com/redhat-developer/yaml-language-server/pull/764)

Thanks to Rickcowan

### 1.9.0
- Add: Publish pre-release extension on nightly CI build [#682](https://github.com/redhat-developer/vscode-yaml/issues/682)
- Add: Add title to extension configuration [#793](https://github.com/redhat-developer/vscode-yaml/pull/793)
- Fix: [object Object] with malformed type definition on hover [#788](https://github.com/redhat-developer/vscode-yaml/issues/788)
- Fix: Description not returned on hover when using yaml anchors [#737](https://github.com/redhat-developer/yaml-language-server/issues/737)
- Fix: Validation of enums that are numbers stopped working in 1.8.0 [#790](https://github.com/redhat-developer/vscode-yaml/issues/790)
- Fix: extra space after position [#732](https://github.com/redhat-developer/yaml-language-server/pull/732)
- Fix: zero-based index [#735](https://github.com/redhat-developer/yaml-language-server/pull/735)
- Fix: proper indenting of snippet within an array [#745](https://github.com/redhat-developer/yaml-language-server/pull/745)

Thanks to Whazor Nanne, Petr Spacek, Golergka and Rickcowan
### 1.8.0
- Fix: yaml-language-server fails for yaml version [#711](https://github.com/redhat-developer/yaml-language-server/issues/711)
- Fix: Missing Schema from catalog.json in ui [#747] (https://github.com/redhat-developer/vscode-yaml/issues/747)
- Fix: JSON Schema not applied for custom file extension [#701] (https://github.com/redhat-developer/vscode-yaml/issues/701)
- Add: Enable eslint import checks [#716] (https://github.com/redhat-developer/yaml-language-server/pull/716)
- Add: object with additional properties completion [#717] (https://github.com/redhat-developer/yaml-language-server/pull/717)
- Fix: Unable to get suggestions without typing a specific order of parameters [#705] (https://github.com/redhat-developer/vscode-yaml/issues/705)
- Add: add completion for additionalProperties propertyName [#720] (https://github.com/redhat-developer/yaml-language-server/pull/720)
- Fix: use virtual caret in tests [#722] (https://github.com/redhat-developer/yaml-language-server/pull/722)
- Add: Add nova-yaml to extension readme [#723] (https://github.com/redhat-developer/yaml-language-server/pull/723)

Thanks to Petr Spacek and Grant Dickinson

### 1.7.0
- Fix: merge simple property completion [#685](https://github.com/redhat-developer/yaml-language-server/pull/685)
- Fix: schemaStore.enable setting does not work as expected [#721](https://github.com/redhat-developer/vscode-yaml/issues/721)
- Fix: oneOf: misleading validation failures with Incorrect type. Expected "object" [#692](https://github.com/redhat-developer/vscode-yaml/issues/692)
- Fix: Yaml errors after updating to v1.5.0 [#708](https://github.com/redhat-developer/vscode-yaml/issues/708)
- Fix: Complex YAML generates many linting errors [#712](https://github.com/redhat-developer/vscode-yaml/issues/712)
- Chore: Upgrade `yaml` parser to `2.0.0-11` [#693](https://github.com/redhat-developer/yaml-language-server/pull/693)
- Fix: Subschema mappings wrongly assign the parent schema file [#694](https://github.com/redhat-developer/yaml-language-server/issues/694)
- Feat: Select parent skeleton first before other properties are suggested [#691](https://github.com/redhat-developer/yaml-language-server/pull/691)
- Fix: change completion that is invoked just after array symbol [#698](https://github.com/redhat-developer/yaml-language-server/pull/698)
- Fix: fix array completion in the middle of the empty text [#697](https://github.com/redhat-developer/yaml-language-server/pull/697)
- Fix: completion in the middle of the empty text [#696](https://github.com/redhat-developer/yaml-language-server/pull/696)
- Chore: Update mocha to 9.2.2 [#706](https://github.com/redhat-developer/yaml-language-server/pull/706)

Thanks to Petr Spacek

### 1.6.0
- Add: differentiate similar schemas on completion [#681](https://github.com/redhat-developer/yaml-language-server/pull/681)
- Fix: changed on specific to undefined check instead of null and undefined check [#678](https://github.com/redhat-developer/yaml-language-server/issues/665)
- Fix: array object completion - should not suggest const [#620](https://github.com/redhat-developer/yaml-language-server/pull/670)

Thanks to Petr Spacek

### 1.5.1
- Fix: Yaml errors after updating to v1.5.0 [#708](https://github.com/redhat-developer/vscode-yaml/issues/708)

### 1.5.0
- Fix: TypeError: Cannot create property 'url' on string [#652](https://github.com/redhat-developer/yaml-language-server/issues/652)
- Fix: suggestion item title [#659](https://github.com/redhat-developer/yaml-language-server/pull/659)
- Remove data from unused anchor diagnostics [#661](https://github.com/redhat-developer/yaml-language-server/pull/661)
- doc: add vim-easycomplete support for yaml-lsp [#662](https://github.com/redhat-developer/yaml-language-server/pull/662)
- Remove duplicate codelens entries [#667](https://github.com/redhat-developer/yaml-language-server/pull/667)
- Add: show examples on hover. [#660](https://github.com/redhat-developer/yaml-language-server/pull/660)
- Fix: oneOf: misleading validation failures with Incorrect type. Expected "object" [#692](https://github.com/redhat-developer/vscode-yaml/issues/692)
- Fix: typos in doc [#700](https://github.com/redhat-developer/vscode-yaml/pull/700)
- Fix: using inline schema reference (# yaml-language-server: $schema) seems to not support relative paths [#587](https://github.com/redhat-developer/vscode-yaml/issues/587)

Thanks to lijing00333, Remco Haszing, Petr Spacek and yassun4dev

### 1.4.0
- Feat: Report unused anchors [#587](https://github.com/redhat-developer/yaml-language-server/issues/587)
- Fix: Formatter does not respect `Editor: Detect Indentation = false` [#573](https://github.com/redhat-developer/vscode-yaml/issues/573)
- Fix: Flakiness in validator: Incorrect type. Expected "string" [#671](https://github.com/redhat-developer/vscode-yaml/issues/671)
- Fix: TypeError: Cannot read property 'filter' of undefined [#651](https://github.com/redhat-developer/vscode-yaml/issues/651)
- Fix: TypeError: Cannot create property 'url' on string 'array' [#653](https://github.com/redhat-developer/vscode-yaml/issues/653)
- Fix: Hover doesn't show up when a new line is behind nested prop with null value [#615](https://github.com/redhat-developer/yaml-language-server/issues/615)
- Fix: Error "Matches multiple schemas" is recognized in v1.2.2 but not in v1.3.0 [#683](https://github.com/redhat-developer/vscode-yaml/issues/683)
- Fix: Schema validation matches @bitnami as a uri-formatted string. [#586](https://github.com/redhat-developer/yaml-language-server/issues/586)

### 1.3.0
- Fix: Wrong hover information [#647](https://github.com/redhat-developer/vscode-yaml/issues/647)
- Fix: relative file paths with fragments [#603](https://github.com/redhat-developer/yaml-language-server/pull/603)
- Update K8S json schema version from 1.20.5 to 1.22.4 [#611](https://github.com/redhat-developer/yaml-language-server/pull/611)
- Feat: extend array documentation on completion [#608](https://github.com/redhat-developer/yaml-language-server/pull/608)
- Feat: add more detail into anyOf array completion [#607](https://github.com/redhat-developer/yaml-language-server/pull/607)
- Feat: trim end $1 from completion [#609](https://github.com/redhat-developer/yaml-language-server/pull/609)
- Fix: auto-complete is not working properly [#563](https://github.com/redhat-developer/yaml-language-server/issues/563)
- Fix: TypeError: Cannot read property 'type' of undefined [#652](https://github.com/redhat-developer/vscode-yaml/issues/652)
- Feat: Improve telemetry error logging [#602](https://github.com/redhat-developer/yaml-language-server/pull/602)
- Fix: completion invoke in three different scenarios [#617](https://github.com/redhat-developer/yaml-language-server/pull/617)
- Fix: DefaultSnippets quick suggestions don't show description if they overlap with const defined in if else [#642](https://github.com/redhat-developer/vscode-yaml/issues/642)
- Fix: If maxProperties is set, completion does not work for the last property [#612](https://github.com/redhat-developer/yaml-language-server/issues/612)
- Feat: Add convert to boolean code action [#622](https://github.com/redhat-developer/yaml-language-server/pull/622)
- Remove `getSchemas` method [#626](https://github.com/redhat-developer/yaml-language-server/pull/626)
- Lock `vscode-json-languageservice@4.1.8` [#637](https://github.com/redhat-developer/yaml-language-server/pull/637)
- Feat: disable default props [#606](https://github.com/redhat-developer/yaml-language-server/pull/606)
- Fix: Schema validation matches `@bitnami` as a uri-formatted string. [#586](https://github.com/redhat-developer/yaml-language-server/issues/586)
- Fix: Array indent doesn't work properly inside another array [#634](https://github.com/redhat-developer/yaml-language-server/pull/634)
- Fix: _PROXY environment and setting not honoured since 1.1.1 [#588](https://github.com/redhat-developer/yaml-language-server/issues/588)
- Fix: array indent on different index position [#635](https://github.com/redhat-developer/yaml-language-server/pull/635)
- Feat: parent completion [#628](https://github.com/redhat-developer/yaml-language-server/pull/628)

Thanks to tonypai, Martti Laine, Petr Spacek, sfalmo

### 1.2.2
- Fix: LSP triggeringregisterCapability despite dynamicRegistration set to false [#583](https://github.com/redhat-developer/yaml-language-server/issues/583)
- Add methods which allow client get schemas info [#556](https://github.com/redhat-developer/yaml-language-server/pull/556)
- Fix: links error reporting [#596](https://github.com/redhat-developer/yaml-language-server/pull/596)

### 1.2.1
- Fix: Can not load schema file when the URL is redirected. [#586](https://github.com/redhat-developer/vscode-yaml/issues/586)
- docs: fix typos [#592](https://github.com/redhat-developer/yaml-language-server/pull/592)
- Fix: Schema comment still not working properly in 1.1.0. [#629](https://github.com/redhat-developer/vscode-yaml/issues/629)
- Fix: document symbols, when key is not string [#594](https://github.com/redhat-developer/yaml-language-server/pull/594)

Thanks to Alexander Steppke and dundargoc

### 1.2.0

- Fix: Pattern (Regex) not parsed correctly, e.g. `^[\w\-_]+$` [#636](https://github.com/redhat-developer/vscode-yaml/issues/636)
- Fix: Autocomplete bug with nested objects in arrays in the 1.0.0 version [#621](https://github.com/redhat-developer/vscode-yaml/issues/621)
- Add: Implementation `Go to Definition` for alias nodes [#541](https://github.com/redhat-developer/yaml-language-server/issues/541)
- Provide completion for reachable schema [#560](https://github.com/redhat-developer/yaml-language-server/issues/560)
- Fix: very slow completion with aws cloudformation schema [#626](https://github.com/redhat-developer/vscode-yaml/issues/626)

Thanks to Aurélien Pupier

### 1.1.1

- Fix: Autocomplete should not escape colon without white-space following [#571](https://github.com/redhat-developer/yaml-language-server/issues/571)
- Fix: Unescape regexp string to be compatible with 'u' flag [#576](https://github.com/redhat-developer/yaml-language-server/pull/576)

### 1.1.0

- Add Web VSCode support [#594](https://github.com/redhat-developer/vscode-yaml/pull/594)
- schemas: Unicode support for pattern and patternProperties keywords [#554](https://github.com/redhat-developer/yaml-language-server/issues/554)
- Fix: IntelliSense broken with v1.0.0 [#616](https://github.com/redhat-developer/vscode-yaml/issues/616)
- Fix: Cannot read property '0' of undefined Code [#617](https://github.com/redhat-developer/vscode-yaml/issues/617)
- Fix: Completion of second level for Camel K files are no more working [#619](https://github.com/redhat-developer/vscode-yaml/issues/619)
- Provide completion for inlined schema syntax [#559](https://github.com/redhat-developer/yaml-language-server/issues/559)
- Fix: Schema comment ignored if it isn't the first line in the file. [#618](https://github.com/redhat-developer/vscode-yaml/issues/618)

Thanks to Johnny Graettinger, Martin Aeschlimann and Aurélien Pupier

### 1.0.0
- Use [eemeli/yaml](https://github.com/eemeli/yaml) as YAML parser [#421](https://github.com/redhat-developer/yaml-language-server/issues/421)
- Fix: Completion provider: t.replace is not a function [#547](https://github.com/redhat-developer/yaml-language-server/issues/547)

### 0.23.0
- Replace js-yaml with yaml [#526](https://github.com/redhat-developer/yaml-language-server/pull/526)
- Update monaco-yaml link in docs [#527](https://github.com/redhat-developer/yaml-language-server/pull/527)
- Update vscode-nls and vscode-uri dependencies [#531](https://github.com/redhat-developer/yaml-language-server/pull/531)
- Fix: error handling in hover and codelens [#534](https://github.com/redhat-developer/yaml-language-server/pull/534)
- Fix: 'label.replace is not a function' error [#544](https://github.com/redhat-developer/yaml-language-server/pull/544)
- Fix: Fragment resolution from #512 doesn't always work [#522](https://github.com/redhat-developer/yaml-language-server/issues/522)

Thanks to Remco Haszing

### 0.22.0

- Fix: fetching nested http settings [#511](https://github.com/redhat-developer/yaml-language-server/pull/511)
- Fix: Cannot create property 'url' on string 'en' [#556](https://github.com/redhat-developer/vscode-yaml/issues/556)
- Fix: Error on 'textDocument/codeLens' request [#497](https://github.com/redhat-developer/yaml-language-server/issues/497)
- Do not send `null` in to telemetry [#513](https://github.com/redhat-developer/yaml-language-server/pull/513)
- Fix: UnhandledPromiseRejectionWarning on jsonParser [#494](https://github.com/redhat-developer/yaml-language-server/issues/494)
- Fix: Schema URL fragments broken since 0.21.0 [#557](https://github.com/redhat-developer/vscode-yaml/issues/557)
- Fix: Unhandled Promise rejections with dynamicRegistration disabled [#498](https://github.com/redhat-developer/yaml-language-server/issues/498)


Thanks to Rob Anderson

### 0.21.1

- Fix: Unable to load remote schema with http protocol [#550](https://github.com/redhat-developer/vscode-yaml/issues/550)
- Log more errors in to telemetry [#508](https://github.com/redhat-developer/yaml-language-server/pull/508)

### 0.21.0

- Upgrade jsonc-parser to latest version [#492](https://github.com/redhat-developer/yaml-language-server/pull/492)
- Fix: Request textDocument/completion failed with message: label.replace is not a function [#536](https://github.com/redhat-developer/vscode-yaml/issues/536)
- Fix: `TypeError: customTags.filter is not a function` [#495](https://github.com/redhat-developer/yaml-language-server/pull/495)
- Support relative path in inline schema comment [#499](https://github.com/redhat-developer/yaml-language-server/pull/499)
- Improve hover to include title, description and source schema link [#480](https://github.com/redhat-developer/yaml-language-server/issues/480)

### 0.20.0

- Fix: Autocomplete not working when certain characters are in object property keys [#496](https://github.com/redhat-developer/vscode-yaml/issues/496) [#474](https://github.com/redhat-developer/yaml-language-server/issues/474)
- `workspace/configuration` request used to fetch preferences [#327](https://github.com/redhat-developer/yaml-language-server/issues/327)
- Now `main` branch used as default [#472](https://github.com/redhat-developer/yaml-language-server/issues/472)
- Fix: Schema link does not work when schema is a local file [#513](https://github.com/redhat-developer/vscode-yaml/issues/513)

### 0.19.2

- Remove fileMatch workaround, now glob patterns should work as expected [#467](https://github.com/redhat-developer/yaml-language-server/pull/467)

### 0.19.1

- Fix: "Billion Laughs" attack [#463](https://github.com/redhat-developer/yaml-language-server/issues/463)
- Added implementation of telemetry event [#439](https://github.com/redhat-developer/yaml-language-server/issues/439)
- Added option to specify custom schema store [#459](https://github.com/redhat-developer/yaml-language-server/pull/459)

Thanks to Ryan (hackercat)

### 0.19.0

- Fix: Inconsistent way to generate whole property snippet and value snippet, when it contains `\"` [#353](https://github.com/redhat-developer/yaml-language-server/issues/353)
- Upgrade to `4.1.0` version of `vscode-json-languageservice` which enables used of the extended glob patterns. [#448](https://github.com/redhat-developer/yaml-language-server/pull/448)
- Fix: Anchor on property which uses alias fails validation [#273](https://github.com/redhat-developer/yaml-language-server/issues/273)
- Update `js-yaml` to `4.1.0` [#454](https://github.com/redhat-developer/yaml-language-server/pull/454)
- Add monaco-yaml in the readme under clients [#455](https://github.com/redhat-developer/yaml-language-server/pull/455)
- Add support for `maxItemsComputed` for document symbols and folding ranges [#444](https://github.com/redhat-developer/yaml-language-server/pull/444)
- Add config parameter to disable additional properties [#452](https://github.com/redhat-developer/yaml-language-server/pull/452)
- add safety measure for preventing use of npm instead of yarn (engines version trick) [#458](https://github.com/redhat-developer/yaml-language-server/pull/458)

Thanks to Andrew Metcalf, Remco Haszing, Petr Spacek and Sorin Sbarnea

### 0.18.0

- Fix: additionalItems does not support $ref [#408](https://github.com/redhat-developer/yaml-language-server/issues/408)
- Fix: vscode/jsonschema markdownDescription support seems patchy [#417](https://github.com/redhat-developer/vscode-yaml/issues/417)
- Fix: Inconsistent way to generate whole property snippet and value snippet, when it contains `\"` [#353](https://github.com/redhat-developer/yaml-language-server/issues/353)
- Fix: Keys requiring quotation can bork the schema [#439](https://github.com/redhat-developer/vscode-yaml/issues/439)
- Fix: yaml.customTags not working in `0.17.0` [#461](https://github.com/redhat-developer/vscode-yaml/issues/461)
- Fix: unknown tag <tag:yaml.org,2002:str> [#173](https://github.com/redhat-developer/vscode-yaml/issues/173)

### 0.17.0

- Disable folding range provider [#400](https://github.com/redhat-developer/yaml-language-server/issues/400)
- Re-add schema priority levels [#418](https://github.com/redhat-developer/yaml-language-server/pull/418)
- Fix: No diagnostics reported on empty files [#413](https://github.com/redhat-developer/yaml-language-server/issues/413)
- Update kubernetes schema to 1.20.5 [#429](https://github.com/redhat-developer/yaml-language-server/pull/429)
- Add CodeLens with links to JSON Schema used [#424](https://github.com/redhat-developer/yaml-language-server/pull/424)
- Fix: Completion for existing property [#428](https://github.com/redhat-developer/yaml-language-server/pull/428)

### 0.16.0

- CodeAction to open json schema from yaml error [#395](https://github.com/redhat-developer/yaml-language-server/pull/395)
- Upgrade to `4.0.2` vscode-json-languageservice  [#405](https://github.com/redhat-developer/yaml-language-server/issues/405)
- feat: add ability to delete all schemas from cache [#397](https://github.com/redhat-developer/yaml-language-server/pull/397)
- feat: multiple schema distinction in validation [#410](https://github.com/redhat-developer/yaml-language-server/pull/410)
- Fix: Object autocompletion in arrays with custom indentation produces invalid output [#432](https://github.com/redhat-developer/vscode-yaml/issues/432)
- Fix: Auto completing an object underneath an array can produce the wrong indentation [#392](https://github.com/redhat-developer/yaml-language-server/issues/392)
- CodeAction to convert Tab characters to spaces [#416](https://github.com/redhat-developer/yaml-language-server/pull/416)
- Fix: Incorrect Matching Against Schema Store [#354](https://github.com/redhat-developer/vscode-yaml/issues/354)
- Fix: Uses the wrong schema, even when yaml.schemas is set [#397](https://github.com/redhat-developer/vscode-yaml/issues/397)
- feat: add new params to completion snippet [#388](https://github.com/redhat-developer/yaml-language-server/pull/388)

Thanks to Petr Spacek

### 0.15.0

- Fix: Array new line ending with no indent [#384](https://github.com/redhat-developer/yaml-language-server/pull/384)
- Fix: Code Completion with defaultSnippet and markdown [#385](https://github.com/redhat-developer/yaml-language-server/pull/385)
- Fix: Test yaml-schema package [#386](https://github.com/redhat-developer/yaml-language-server/pull/386)
- Fix: Completion with default snippet when node is array [#387](https://github.com/redhat-developer/yaml-language-server/pull/387)
- Auto formatting for list, with `onTypeFormatting` implementation [#179](https://github.com/redhat-developer/vscode-yaml/issues/179)
- Fix: Completion array anyOf [#390](https://github.com/redhat-developer/yaml-language-server/pull/390)
- Fix CodeCompletion with defaultSnippet and markdown [#393](https://github.com/redhat-developer/yaml-language-server/pull/393)
- Fix: Services initialization [#399](https://github.com/redhat-developer/yaml-language-server/pull/399)
- Update kubernetes schema to 1.18.1 [#401](https://github.com/redhat-developer/yaml-language-server/pull/401)
- Fix: Folding misbehaves in version 0.14.0 [#400](https://github.com/redhat-developer/yaml-language-server/issues/400)
- Use mocha bdd interface for all tests [#403](https://github.com/redhat-developer/yaml-language-server/pull/403)

Thanks to Petr Spacek and tonypai

### 0.14.0

- yaml-language-server use a non-standard LSP request to resolve schemas content on client [#359](https://github.com/redhat-developer/yaml-language-server/pull/359)
- Fix error on completion 'null' value [#360](https://github.com/redhat-developer/yaml-language-server/pull/360)
- Select schemas based off on their priority [#362](https://github.com/redhat-developer/yaml-language-server/pull/362)
- Keep space before word after inserting completion [#363](https://github.com/redhat-developer/yaml-language-server/pull/363)
- Update readme with example of an array of glob patterns for schema [#366](https://github.com/redhat-developer/yaml-language-server/pull/366)
- Add Dockerfile [#335](https://github.com/redhat-developer/yaml-language-server/issues/335)
- Fix: Code completion list empty on empty file [#349](https://github.com/redhat-developer/vscode-yaml/issues/349)
- Fix: Autocompletion missing space in value for default snippets when autocompleting on root node [#364](https://github.com/redhat-developer/yaml-language-server/issues/364)
- Check if dynamic registration is enabled before executing onDidChangeWorkspaceFolders [#378](https://github.com/redhat-developer/yaml-language-server/pull/378)
- Fix: Array indentation in autocomplete is broken after upgrade to 0.13 [#376](https://github.com/redhat-developer/yaml-language-server/issues/376)
- Added folding ranges provider implementation [#337](https://github.com/redhat-developer/yaml-language-server/issues/337)
- Fix: Hover doesn't work when there is now symbol after property [#382](https://github.com/redhat-developer/yaml-language-server/pull/382)
- Fix: Code completion array new line ending with no indent [#384](https://github.com/redhat-developer/yaml-language-server/pull/384)
- Fix: Code completion with defaultSnippet and makdown [#385](https://github.com/redhat-developer/yaml-language-server/pull/385)

### 0.13.0

- Improve 'hover' with complex k8s schemas [#347](https://github.com/redhat-developer/yaml-language-server/pull/347)
- Allow array for fileMatch in yamlValidation contribution, now this property complies with `contributes.jsonValidation` [#348](https://github.com/redhat-developer/yaml-language-server/pull/348)
- yaml-language-server now compatible with the newest version of vscode-json-languageservice. [#350](https://github.com/redhat-developer/yaml-language-server/pull/350)
- Code cleanup related to Promises usage [#351](https://github.com/redhat-developer/yaml-language-server/pull/351) and [#352](https://github.com/redhat-developer/yaml-language-server/pull/352)
- Fix: If blocks don't evaluate properties correctly [#393](https://github.com/redhat-developer/vscode-yaml/issues/393)

### 0.12.0

- Fix: Error when file has "Type" attribute [#317](https://github.com/redhat-developer/yaml-language-server/issues/317)
- Added all user settings in to README.md [#334](https://github.com/redhat-developer/yaml-language-server/pull/334)
- Added schema information (schema title or URL) to diagnostic [#310](https://github.com/redhat-developer/yaml-language-server/issues/310)
- Fix: autogenerated snippet for keys that contain an array of objects is badly indented [#329](https://github.com/redhat-developer/yaml-language-server/issues/329)
- Fix: example string of type integer gets pasted as int [#371](https://github.com/redhat-developer/vscode-yaml/issues/371)
- Fix: Auto completion can't suggest string enums correctly in Flow Style content. [#239](https://github.com/redhat-developer/yaml-language-server/issues/239)

### 0.11.1

- Fix: Latest version breaks auto-save formatting [#366](https://github.com/redhat-developer/vscode-yaml/issues/366)

### 0.11.0

- Make yaml-language-server available as ESM and UMD modules in the `/lib` directory [#305](https://github.com/redhat-developer/yaml-language-server/pull/305)
- Fix: `yaml.schemas` configuration doesn't work on windows with full path [#347](https://github.com/redhat-developer/vscode-yaml/issues/347)
- Completion text use space instead of tab for indentation [#283](https://github.com/redhat-developer/yaml-language-server/issues/283)
- YAML Schemas can now be used for validation [#318](https://github.com/redhat-developer/yaml-language-server/pull/318)

### 0.10.1

- Fix for cannot read property 'lineComments' of undefined Code: -32603 [redhat-developer/vscode-yaml#312](https://github.com/redhat-developer/vscode-yaml/issues/358)

### 0.10.0

- Allows to declare a schema inside the yaml file through modeline `# yaml-language-server: $schema=<urlOfTheSchema>` [#280](https://github.com/redhat-developer/yaml-language-server/pull/280)
- Insert empty string instead of 'null' for string array completion [#277](https://github.com/redhat-developer/yaml-language-server/pull/277)
- Handle workspace/workspaceFolders event for multi root workspaces [#281](https://github.com/redhat-developer/yaml-language-server/pull/281)
- Provide default object as completion snippet [#291] https://github.com/redhat-developer/yaml-language-server/pull/291
- Add validation of date and time formats [#292](https://github.com/redhat-developer/yaml-language-server/pull/292)
- Fix document symbols computation if yaml has complex mappings [#293](https://github.com/redhat-developer/yaml-language-server/pull/293)

### 0.9.0

- Improve Diagnostic positions [#260](https://github.com/redhat-developer/yaml-language-server/issues/260)
- Support `maxProperties` when providing completion [#269](https://github.com/redhat-developer/yaml-language-server/issues/269)
- Fix for required attributes are inserted with wrong level of indentation on first array item [redhat-developer/vscode-yaml#312](https://github.com/redhat-developer/vscode-yaml/issues/312)
- Use https endpoints for schemastore [#PR](https://github.com/redhat-developer/yaml-language-server/pull/264)

### 0.8.0

- Start using yarn for everything instead of npm
- Allow for partial configurations in onDidChangeConfiguration [#256](https://github.com/redhat-developer/yaml-language-server/issues/256)
- Support for textDocument/findDefinition [#PR](https://github.com/redhat-developer/yaml-language-server/pull/257)
- Fix kubernetes schema back to 1.17.0 [#PR](https://github.com/redhat-developer/yaml-language-server/pull/236)
- Fix for @ symbol in relative path [#PR](https://github.com/redhat-developer/yaml-language-server/pull/254)
- Fix for null literals [#118](https://github.com/redhat-developer/yaml-language-server/issues/118)
- Fix for autocompletion on default values [#281](https://github.com/redhat-developer/vscode-yaml/issues/281)

### 0.7.2

- Fix the way default snippets is handled when we have boolean values [#PR](https://github.com/redhat-developer/yaml-language-server/pull/234)

### 0.7.1

- Allow contributor API to contribute multiple schemas for the same file [#PR](https://github.com/redhat-developer/yaml-language-server/pull/227)
- Fix issue with arrays in default snippets [#PR](https://github.com/redhat-developer/yaml-language-server/pull/226)

### 0.7.0

- Updates kubernetes schema to 1.17.0 [#Commit](https://github.com/redhat-developer/yaml-language-server/commit/68d0f395ccc12abf9f180fa39ce49b77d52863ad)
- Added API for modifiying schemas in memory [#151](https://github.com/redhat-developer/yaml-language-server/issues/151)
- Updated yaml completion to use JSON 7 Parser [#150](https://github.com/redhat-developer/yaml-language-server/issues/150)
- Server side snippet support [#205](https://github.com/redhat-developer/yaml-language-server/issues/205)
- Fix issue with language server not issuing warnings on duplicate keys [#Commit](https://github.com/redhat-developer/yaml-language-server/commit/20a8b07cd8f054d1374cbab17ef479320ac5669c)
- Fix for collecting completion items if array contains objects [#PR](https://github.com/redhat-developer/yaml-language-server/pull/224)
- Fix for merge key error with JSON Schema [#PR](https://github.com/redhat-developer/yaml-language-server/pull/222)

### 0.6.1

- Fix for setting kubernetes in yaml.schemas gives error [#202](https://github.com/redhat-developer/yaml-language-server/issues/202)

### 0.6.0

- Fix for schema sequence custom property [#PR](https://github.com/redhat-developer/yaml-language-server/pull/197)
- Fix for obeying the initialization specification [#PR](https://github.com/redhat-developer/yaml-language-server/pull/193)

### 0.5.8

- Remove document range formatter registration [#PR](https://github.com/redhat-developer/yaml-language-server/pull/179)
- Catch errors that happen when schema store schemas cannot be grabbed [#PR](https://github.com/redhat-developer/yaml-language-server/pull/183)

### 0.5.7

- Fix for custom schema contributor API [#PR](https://github.com/redhat-developer/yaml-language-server/pull/177)
- Disable range formatter in initialize [#PR](https://github.com/redhat-developer/yaml-language-server/pull/178)

### 0.5.6

- Include the package-lock.json

### 0.5.5

- Fix for language server initialize erroring when rootURI is not set

### 0.5.4

- Fix for autocompletion not working when there are multiple enums available
- Fix for showing the correct validation when a key has an associated null value for kubernetes
- Add Eclipse Wild Web Developer as client
- Fix for Array item properties being created with the wrong indent
- Update of various dependencies

### 0.5.3

- Make prettier an optional dependency because of issues with webpack

### 0.5.2

- Adds in custom kubernetes schema comparator

### 0.5.1

- Adds in missing js-yaml dependency

### 0.5.0

- Fixed offset of undefined when hovering [#162](https://github.com/redhat-developer/yaml-language-server/issues/162)
- Fixed relative path schema loading [#154](https://github.com/redhat-developer/yaml-language-server/issues/154)
- Realigned features of YAML Language Server with JSON Language Server [#142](https://github.com/redhat-developer/yaml-language-server/issues/142)

### 0.4.1

- Updated the kubernetes schema to be an upstream one [#PR](https://github.com/redhat-developer/yaml-language-server/pull/108)

### 0.4.0

- Allow custom tags to have multiple types [#77](https://github.com/redhat-developer/yaml-language-server/issues/77)
- Made the formatter respect the yaml.format.enable setting [#PR](https://github.com/redhat-developer/yaml-language-server/pull/126)
- yaml-language-server command is now executable [#PR](https://github.com/redhat-developer/yaml-language-server/pull/130)

### 0.3.2

- Only set CompletionItem.textEdit if it encompasses a single line [#139](https://github.com/redhat-developer/vscode-yaml/issues/139)

### 0.3.1

- Fixed custom tags crashing the language server [#112](https://github.com/redhat-developer/yaml-language-server/commit/4bcd36d629ef2c64641dc6edc948dbd02f35c437)
- Added setting yaml.schemaStore.enable to enable/disable the schema store [#115](https://github.com/redhat-developer/yaml-language-server/commit/4aa28a7dacadcc68126bd26e3b5311e046348799)
- Use the language server tab size when formatting [#116](https://github.com/redhat-developer/yaml-language-server/commit/1458e25926c7189cefc383141f4fad1d14a568b8)

### 0.2.1

- Added fix for language server crashing when settings.yaml.format was not sent [#111](https://github.com/redhat-developer/yaml-language-server/issues/111)

### 0.2.0

- Added fix for bracket spacing option in formatter [#Commit](https://github.com/redhat-developer/yaml-language-server/commit/3b79ef397dbd215744c4577da9227298b3447bad)
- Added fix for boolean type [#Commit](https://github.com/redhat-developer/yaml-language-server/commit/9351ef54348e0a967a672e7c0f45b091ed53c533)

### 0.1.0

- Added a new formatter that uses prettier [#Commit](https://github.com/redhat-developer/yaml-language-server/commit/a5092e3d33a2e208bfea7941076518dedd2aba7b)
- Added a registration for custom schema provider extension [#Commit](https://github.com/redhat-developer/yaml-language-server/commit/c82830b2e1933fae6197d09e85b1e637b46b3896)
- Add ability to toggle hover and autocompletion [#Commit](https://github.com/redhat-developer/yaml-language-server/commit/0e4192cfacbbb5d442f817a7337d388ac3d01eff)

### 0.0.19

- Support intellisense default value [#86](https://github.com/redhat-developer/yaml-language-server/pull/86)
- Fix intellisense doesn't work for array item [#85](https://github.com/redhat-developer/yaml-language-server/pull/85)

### 0.0.18

- Fix handling scenario of multiple documents in single yaml file [#81](https://github.com/redhat-developer/yaml-language-server/commit/38da50092285aa499930d0e95fbbd7960b37b670)
- Support associate schemas with files in a regular expression [#Commit](https://github.com/redhat-developer/yaml-language-server/commit/d4a05e3dd72f55c53f1b0325c521a58f688839c9)

### 0.0.15

- Fixed dynamic registration of formatter [#74](https://github.com/redhat-developer/yaml-language-server/issues/74)

### 0.0.14

- Bumped to fix jenkins errors

### 0.0.13

- Show errors if schema cannot be grabbed [#73](https://github.com/redhat-developer/yaml-language-server/issues/73)
- The validator should support null values [#72](https://github.com/redhat-developer/yaml-language-server/issues/72)
- Server returning nothing on things such as completion errors Eclipse Che [#66](https://github.com/redhat-developer/yaml-language-server/issues/66)
- Return promises that resolve to null [#PR-71](https://github.com/redhat-developer/yaml-language-server/pull/71)
- Remove unused dependency to deep-equal [#PR-70](https://github.com/redhat-developer/yaml-language-server/pull/70)
- Added custom tags to autocompletion [#Commit](https://github.com/redhat-developer/yaml-language-server/commit/73c244a3efe09ec4250def78068c54af3acaed58)

### 0.0.12

- Support for custom tags [#59](https://github.com/redhat-developer/yaml-language-server/issues/59)
- Incorrect duplicate key registered when using YAML anchors [#82](https://github.com/redhat-developer/vscode-yaml/issues/82)
- Automatically insert colon on autocomplete [#78](https://github.com/redhat-developer/vscode-yaml/issues/78)

### 0.0.11

- Fix for completion helper if it contains \r [#37](https://github.com/redhat-developer/yaml-language-server/issues/37)

### 0.0.10

- Programmatically associate YAML files with schemas by other extensions [#61](https://github.com/redhat-developer/vscode-yaml/issues/61)
- Autocompletion not triggered while typing [#46](https://github.com/redhat-developer/vscode-yaml/issues/46)

### 0.0.9

- Remove console.log from jsonSchemaService [#49](https://github.com/redhat-developer/yaml-language-server/issues/49)
- Change "Property {\$property_name} is not allowed" error message [#42](https://github.com/redhat-developer/yaml-language-server/issues/42)
- New Kubernetes Schema + Updated support for Kubernetes [#40](https://github.com/redhat-developer/yaml-language-server/issues/40)

### 0.0.8

- Added Kedge back in as one of the default schemas
- Added file watch for json schema files in the workspace [#34](https://github.com/redhat-developer/yaml-language-server/issues/34)
- Multi root settings [#50](https://github.com/redhat-developer/vscode-yaml/issues/50)
- Fix for crashing yaml language server when !include is present [#52](https://github.com/redhat-developer/vscode-yaml/issues/52)
- Update tests to work on windows [#30](https://github.com/redhat-developer/yaml-language-server/issues/30)

### 0.0.7

- Added validation toggle in settings [#20](https://github.com/redhat-developer/yaml-language-server/issues/20)
- YAML Schemas are pulled from JSON Schema Store [#15](https://github.com/redhat-developer/yaml-language-server/issues/15)
- YAML Diagnostics throw on a single line instead of the entire file [#19](https://github.com/redhat-developer/yaml-language-server/issues/19)
- Fix for getNodeFromOffset [#18](https://github.com/redhat-developer/yaml-language-server/issues/18)

### 0.0.6

- Hotfix for making multiple schemas in the settings work again

### 0.0.5

- Fixed Schema validation reports errors in valid YAML document [#42](https://github.com/redhat-developer/vscode-yaml/issues/42)
- Fixed Support for multiple YAML documents in single file [#43](https://github.com/redhat-developer/vscode-yaml/issues/43)

### 0.0.4

- Fixed support for kubernetes files
- Fixed boolean notation for validation [#40](https://github.com/redhat-developer/vscode-yaml/issues/40)
- Fixed autocompletion for first new list item [#39](https://github.com/redhat-developer/vscode-yaml/issues/39)

### 0.0.3

- Added new autocompletion service which is better for json schemas
- Added yamlValidation contribution point [#37](https://github.com/redhat-developer/vscode-yaml/issues/37)

### 0.0.1

- Initial release with support for hover, document outlining, validation and auto completion
