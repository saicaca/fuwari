"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emmetSnippetField = exports.FileType = void 0;
exports.doComplete = doComplete;
exports.isStyleSheet = isStyleSheet;
exports.getSyntaxType = getSyntaxType;
exports.getDefaultSyntax = getDefaultSyntax;
exports.getDefaultSnippets = getDefaultSnippets;
exports.extractAbbreviation = extractAbbreviation;
exports.extractAbbreviationFromText = extractAbbreviationFromText;
exports.isAbbreviationValid = isAbbreviationValid;
exports.getExpandOptions = getExpandOptions;
exports.parseAbbreviation = parseAbbreviation;
exports.expandAbbreviation = expandAbbreviation;
exports.updateExtensionsPath = updateExtensionsPath;
exports.getEmmetMode = getEmmetMode;
const JSONC = __importStar(require("jsonc-parser"));
const util_1 = require("util");
const vscode_languageserver_types_1 = require("vscode-languageserver-types");
const vscode_uri_1 = require("vscode-uri");
const data_1 = require("./data");
const fileService_1 = require("./fileService");
Object.defineProperty(exports, "FileType", { enumerable: true, get: function () { return fileService_1.FileType; } });
const emmet_1 = __importStar(require("emmet"));
const configCompat_1 = require("./configCompat");
let l10n;
try {
    l10n = require('vscode').l10n;
}
catch (_a) {
    // Fallback to the identity function.
    l10n = {
        t: (message) => message
    };
}
const snippetKeyCache = new Map();
let markupSnippetKeys;
const stylesheetCustomSnippetsKeyCache = new Map();
const htmlAbbreviationStartRegex = /^[a-z,A-Z,!,(,[,#,\.\{]/;
// take off { for jsx because it interferes with the language
const jsxAbbreviationStartRegex = /^[a-z,A-Z,!,(,[,#,\.]/;
const cssAbbreviationRegex = /^-?[a-z,A-Z,!,@,#]/;
const htmlAbbreviationRegex = /[a-z,A-Z\.]/;
const commonlyUsedTags = [...data_1.htmlData.tags, 'lorem'];
const bemFilterSuffix = 'bem';
const filterDelimitor = '|';
const trimFilterSuffix = 't';
const commentFilterSuffix = 'c';
const maxFilters = 3;
/**
 * Returns all applicable emmet expansions for abbreviation at given position in a CompletionList
 * @param document TextDocument in which completions are requested
 * @param position Position in the document at which completions are requested
 * @param syntax Emmet supported language
 * @param emmetConfig Emmet Configurations as derived from VS Code
 */
function doComplete(document, position, syntax, emmetConfig) {
    var _a, _b;
    if (emmetConfig.showExpandedAbbreviation === 'never' || !getEmmetMode(syntax, emmetConfig.excludeLanguages)) {
        return;
    }
    const isStyleSheetRes = isStyleSheet(syntax);
    // Fetch markupSnippets so that we can provide possible abbreviation completions
    // For example, when text at position is `a`, completions should return `a:blank`, `a:link`, `acr` etc.
    if (!isStyleSheetRes) {
        if (!snippetKeyCache.has(syntax)) {
            const registry = Object.assign(Object.assign({}, getDefaultSnippets(syntax)), customSnippetsRegistry[syntax]);
            snippetKeyCache.set(syntax, Object.keys(registry));
        }
        markupSnippetKeys = (_a = snippetKeyCache.get(syntax)) !== null && _a !== void 0 ? _a : [];
    }
    const extractOptions = { lookAhead: !isStyleSheetRes, type: isStyleSheetRes ? 'stylesheet' : 'markup' };
    const extractedValue = extractAbbreviation(document, position, extractOptions);
    if (!extractedValue) {
        return;
    }
    const { abbreviationRange, abbreviation, filter } = extractedValue;
    const currentLineTillPosition = getCurrentLine(document, position).substr(0, position.character);
    const currentWord = getCurrentWord(currentLineTillPosition);
    // Don't attempt to expand open tags
    if (currentWord === abbreviation
        && currentLineTillPosition.endsWith(`<${abbreviation}`)
        && configCompat_1.syntaxes.markup.includes(syntax)) {
        return;
    }
    const expandOptions = getExpandOptions(syntax, emmetConfig, filter);
    let expandedText = "";
    let expandedAbbr;
    let completionItems = [];
    // Create completion item after expanding given abbreviation
    // if abbreviation is valid and expanded value is not noise
    const createExpandedAbbr = (syntax, abbr) => {
        if (!isAbbreviationValid(syntax, abbreviation)) {
            return;
        }
        try {
            expandedText = (0, emmet_1.default)(abbr, expandOptions);
            // manually patch https://github.com/microsoft/vscode/issues/120245 for now
            if (isStyleSheetRes && '!important'.startsWith(abbr)) {
                expandedText = '!important';
            }
        }
        catch (e) {
        }
        if (!expandedText || isExpandedTextNoise(syntax, abbr, expandedText, expandOptions.options)) {
            return;
        }
        expandedAbbr = vscode_languageserver_types_1.CompletionItem.create(abbr);
        expandedAbbr.textEdit = vscode_languageserver_types_1.TextEdit.replace(abbreviationRange, escapeNonTabStopDollar(addFinalTabStop(expandedText)));
        expandedAbbr.documentation = replaceTabStopsWithCursors(expandedText);
        expandedAbbr.insertTextFormat = vscode_languageserver_types_1.InsertTextFormat.Snippet;
        expandedAbbr.detail = l10n.t('Emmet Abbreviation');
        expandedAbbr.label = abbreviation;
        expandedAbbr.label += filter ? '|' + filter.replace(',', '|') : "";
        completionItems = [expandedAbbr];
    };
    if (isStyleSheet(syntax)) {
        createExpandedAbbr(syntax, abbreviation);
        // When abbr is longer than usual emmet snippets and matches better with existing css property, then no emmet
        if (abbreviation.length > 4
            && data_1.cssData.properties.find(x => x.startsWith(abbreviation))) {
            return vscode_languageserver_types_1.CompletionList.create([], true);
        }
        if (expandedAbbr && expandedText.length) {
            expandedAbbr.textEdit = vscode_languageserver_types_1.TextEdit.replace(abbreviationRange, escapeNonTabStopDollar(addFinalTabStop(expandedText)));
            expandedAbbr.documentation = replaceTabStopsWithCursors(expandedText);
            expandedAbbr.label = removeTabStops(expandedText);
            expandedAbbr.filterText = abbreviation;
            // Custom snippets should show up in completions if abbreviation is a prefix
            const stylesheetCustomSnippetsKeys = stylesheetCustomSnippetsKeyCache.has(syntax) ?
                stylesheetCustomSnippetsKeyCache.get(syntax) : stylesheetCustomSnippetsKeyCache.get('css');
            completionItems = makeSnippetSuggestion(stylesheetCustomSnippetsKeys !== null && stylesheetCustomSnippetsKeys !== void 0 ? stylesheetCustomSnippetsKeys : [], abbreviation, abbreviation, abbreviationRange, expandOptions, 'Emmet Custom Snippet', false);
            if (!completionItems.find(x => { var _a, _b, _c; return ((_a = x.textEdit) === null || _a === void 0 ? void 0 : _a.newText) && ((_b = x.textEdit) === null || _b === void 0 ? void 0 : _b.newText) === ((_c = expandedAbbr === null || expandedAbbr === void 0 ? void 0 : expandedAbbr.textEdit) === null || _c === void 0 ? void 0 : _c.newText); })) {
                // Fix for https://github.com/Microsoft/vscode/issues/28933#issuecomment-309236902
                // When user types in propertyname, emmet uses it to match with snippet names, resulting in width -> widows or font-family -> font: family
                // Filter out those cases here.
                const abbrRegex = new RegExp('.*' + abbreviation.split('').map(x => (x === '$' || x === '+') ? '\\' + x : x).join('.*') + '.*', 'i');
                if (/\d/.test(abbreviation) || abbrRegex.test(expandedAbbr.label)) {
                    completionItems.push(expandedAbbr);
                }
            }
        }
    }
    else {
        createExpandedAbbr(syntax, abbreviation);
        let tagToFindMoreSuggestionsFor = abbreviation;
        const newTagMatches = abbreviation.match(/(>|\+)([\w:-]+)$/);
        if (newTagMatches && newTagMatches.length === 3) {
            tagToFindMoreSuggestionsFor = newTagMatches[2];
        }
        if (syntax !== 'xml') {
            const commonlyUsedTagSuggestions = makeSnippetSuggestion(commonlyUsedTags, tagToFindMoreSuggestionsFor, abbreviation, abbreviationRange, expandOptions, 'Emmet Abbreviation');
            completionItems = completionItems.concat(commonlyUsedTagSuggestions);
        }
        if (emmetConfig.showAbbreviationSuggestions === true) {
            const abbreviationSuggestions = makeSnippetSuggestion(markupSnippetKeys.filter(x => !commonlyUsedTags.includes(x)), tagToFindMoreSuggestionsFor, abbreviation, abbreviationRange, expandOptions, 'Emmet Abbreviation');
            // Workaround for the main expanded abbr not appearing before the snippet suggestions
            if (expandedAbbr && abbreviationSuggestions.length > 0 && tagToFindMoreSuggestionsFor !== abbreviation) {
                expandedAbbr.sortText = '0' + expandedAbbr.label;
                abbreviationSuggestions.forEach(item => {
                    // Workaround for snippet suggestions items getting filtered out as the complete abbr does not start with snippetKey
                    item.filterText = abbreviation;
                    // Workaround for the main expanded abbr not appearing before the snippet suggestions
                    item.sortText = '9' + abbreviation;
                });
            }
            completionItems = completionItems.concat(abbreviationSuggestions);
        }
        // https://github.com/microsoft/vscode/issues/66680
        if (syntax === 'html' && completionItems.length >= 2 && abbreviation.includes(":")
            && ((_b = expandedAbbr === null || expandedAbbr === void 0 ? void 0 : expandedAbbr.textEdit) === null || _b === void 0 ? void 0 : _b.newText) === `<${abbreviation}>\${0}</${abbreviation}>`) {
            completionItems = completionItems.filter(item => item.label !== abbreviation);
        }
    }
    if (emmetConfig.showSuggestionsAsSnippets === true) {
        completionItems.forEach(x => x.kind = vscode_languageserver_types_1.CompletionItemKind.Snippet);
    }
    return completionItems.length ? vscode_languageserver_types_1.CompletionList.create(completionItems, true) : undefined;
}
/**
 * Create & return snippets for snippet keys that start with given prefix
 */
function makeSnippetSuggestion(snippetKeys, prefix, abbreviation, abbreviationRange, expandOptions, snippetDetail, skipFullMatch = true) {
    if (!prefix || !snippetKeys) {
        return [];
    }
    const snippetCompletions = [];
    snippetKeys.forEach(snippetKey => {
        if (!snippetKey.startsWith(prefix.toLowerCase()) || (skipFullMatch && snippetKey === prefix.toLowerCase())) {
            return;
        }
        const currentAbbr = abbreviation + snippetKey.substr(prefix.length);
        let expandedAbbr;
        try {
            expandedAbbr = (0, emmet_1.default)(currentAbbr, expandOptions);
        }
        catch (e) {
        }
        if (!expandedAbbr) {
            return;
        }
        const item = vscode_languageserver_types_1.CompletionItem.create(prefix + snippetKey.substr(prefix.length));
        item.documentation = replaceTabStopsWithCursors(expandedAbbr);
        item.detail = snippetDetail;
        item.textEdit = vscode_languageserver_types_1.TextEdit.replace(abbreviationRange, escapeNonTabStopDollar(addFinalTabStop(expandedAbbr)));
        item.insertTextFormat = vscode_languageserver_types_1.InsertTextFormat.Snippet;
        snippetCompletions.push(item);
    });
    return snippetCompletions;
}
function getCurrentWord(currentLineTillPosition) {
    if (currentLineTillPosition) {
        const matches = currentLineTillPosition.match(/[\w,:,-,\.]*$/);
        if (matches) {
            return matches[0];
        }
    }
}
function replaceTabStopsWithCursors(expandedWord) {
    return expandedWord.replace(/([^\\])\$\{\d+\}/g, '$1|').replace(/\$\{\d+:([^\}]+)\}/g, '$1');
}
function removeTabStops(expandedWord) {
    return expandedWord.replace(/([^\\])\$\{\d+\}/g, '$1').replace(/\$\{\d+:([^\}]+)\}/g, '$1');
}
function escapeNonTabStopDollar(text) {
    return text ? text.replace(/([^\\])(\$)([^\{])/g, '$1\\$2$3') : text;
}
function addFinalTabStop(text) {
    if (!text || !text.trim()) {
        return text;
    }
    let maxTabStop = -1;
    let maxTabStopRanges = [];
    let foundLastStop = false;
    let replaceWithLastStop = false;
    let i = 0;
    const n = text.length;
    try {
        while (i < n && !foundLastStop) {
            // Look for ${
            if (text[i++] != '$' || text[i++] != '{') {
                continue;
            }
            // Find tabstop
            let numberStart = -1;
            let numberEnd = -1;
            while (i < n && /\d/.test(text[i])) {
                numberStart = numberStart < 0 ? i : numberStart;
                numberEnd = i + 1;
                i++;
            }
            // If ${ was not followed by a number and either } or :, then its not a tabstop
            if (numberStart === -1 || numberEnd === -1 || i >= n || (text[i] != '}' && text[i] != ':')) {
                continue;
            }
            // If ${0} was found, then break
            const currentTabStop = text.substring(numberStart, numberEnd);
            foundLastStop = currentTabStop === '0';
            if (foundLastStop) {
                break;
            }
            let foundPlaceholder = false;
            if (text[i++] == ':') {
                // TODO: Nested placeholders may break here
                while (i < n) {
                    if (text[i] == '}') {
                        foundPlaceholder = true;
                        break;
                    }
                    i++;
                }
            }
            // Decide to replace currentTabStop with ${0} only if its the max among all tabstops and is not a placeholder
            if (Number(currentTabStop) > Number(maxTabStop)) {
                maxTabStop = Number(currentTabStop);
                maxTabStopRanges = [{ numberStart, numberEnd }];
                replaceWithLastStop = !foundPlaceholder;
            }
            else if (Number(currentTabStop) === maxTabStop) {
                maxTabStopRanges.push({ numberStart, numberEnd });
            }
        }
    }
    catch (e) {
    }
    if (replaceWithLastStop && !foundLastStop) {
        for (let i = 0; i < maxTabStopRanges.length; i++) {
            const rangeStart = maxTabStopRanges[i].numberStart;
            const rangeEnd = maxTabStopRanges[i].numberEnd;
            text = text.substr(0, rangeStart) + '0' + text.substr(rangeEnd);
        }
    }
    return text;
}
function getCurrentLine(document, position) {
    const offset = document.offsetAt(position);
    const text = document.getText();
    let start = 0;
    let end = text.length;
    for (let i = offset - 1; i >= 0; i--) {
        if (text[i] === '\n') {
            start = i + 1;
            break;
        }
    }
    for (let i = offset; i < text.length; i++) {
        if (text[i] === '\n') {
            end = i;
            break;
        }
    }
    return text.substring(start, end);
}
let customSnippetsRegistry = {};
let variablesFromFile = {};
let profilesFromFile = {};
const emmetSnippetField = (index, placeholder) => `\${${index}${placeholder ? ':' + placeholder : ''}}`;
exports.emmetSnippetField = emmetSnippetField;
/** Returns whether or not syntax is a supported stylesheet syntax, like CSS */
function isStyleSheet(syntax) {
    return configCompat_1.syntaxes.stylesheet.includes(syntax);
}
/** Returns the syntax type, either markup (e.g. for HTML) or stylesheet (e.g. for CSS) */
function getSyntaxType(syntax) {
    return isStyleSheet(syntax) ? 'stylesheet' : 'markup';
}
/** Returns the default syntax (html or css) to use for the snippets registry */
function getDefaultSyntax(syntax) {
    return isStyleSheet(syntax) ? 'css' : 'html';
}
/** Returns the default snippets that Emmet suggests */
function getDefaultSnippets(syntax) {
    const syntaxType = getSyntaxType(syntax);
    const emptyUserConfig = { type: syntaxType, syntax };
    const resolvedConfig = (0, emmet_1.resolveConfig)(emptyUserConfig);
    // https://github.com/microsoft/vscode/issues/97632
    // don't return markup (HTML) snippets for XML
    return syntax === 'xml' ? {} : resolvedConfig.snippets;
}
function getFilters(text, pos) {
    let filter;
    for (let i = 0; i < maxFilters; i++) {
        if (text.endsWith(`${filterDelimitor}${bemFilterSuffix}`, pos)) {
            pos -= bemFilterSuffix.length + 1;
            filter = filter ? bemFilterSuffix + ',' + filter : bemFilterSuffix;
        }
        else if (text.endsWith(`${filterDelimitor}${commentFilterSuffix}`, pos)) {
            pos -= commentFilterSuffix.length + 1;
            filter = filter ? commentFilterSuffix + ',' + filter : commentFilterSuffix;
        }
        else if (text.endsWith(`${filterDelimitor}${trimFilterSuffix}`, pos)) {
            pos -= trimFilterSuffix.length + 1;
            filter = filter ? trimFilterSuffix + ',' + filter : trimFilterSuffix;
        }
        else {
            break;
        }
    }
    return {
        pos: pos,
        filter: filter
    };
}
/**
 * Extracts abbreviation from the given position in the given document
 * @param document The TextDocument from which abbreviation needs to be extracted
 * @param position The Position in the given document from where abbreviation needs to be extracted
 * @param options The options to pass to the @emmetio/extract-abbreviation module
 */
function extractAbbreviation(document, position, options) {
    const currentLine = getCurrentLine(document, position);
    const currentLineTillPosition = currentLine.substr(0, position.character);
    const { pos, filter } = getFilters(currentLineTillPosition, position.character);
    const lengthOccupiedByFilter = filter ? filter.length + 1 : 0;
    const result = (0, emmet_1.extract)(currentLine, pos, options);
    if (!result) {
        return;
    }
    const rangeToReplace = vscode_languageserver_types_1.Range.create(position.line, result.location, position.line, result.location + result.abbreviation.length + lengthOccupiedByFilter);
    return {
        abbreviationRange: rangeToReplace,
        abbreviation: result.abbreviation,
        filter
    };
}
/**
 * Extracts abbreviation from the given text
 * @param text Text from which abbreviation needs to be extracted
 * @param syntax Syntax used to extract the abbreviation from the given text
 */
function extractAbbreviationFromText(text, syntax) {
    if (!text) {
        return;
    }
    const { pos, filter } = getFilters(text, text.length);
    const extractOptions = (isStyleSheet(syntax) || syntax === 'stylesheet') ?
        { syntax: 'stylesheet', lookAhead: false } :
        { lookAhead: true };
    const result = (0, emmet_1.extract)(text, pos, extractOptions);
    if (!result) {
        return;
    }
    return {
        abbreviation: result.abbreviation,
        filter
    };
}
/**
 * Returns a boolean denoting validity of given abbreviation in the context of given syntax
 * Not needed once https://github.com/emmetio/atom-plugin/issues/22 is fixed
 * @param syntax string
 * @param abbreviation string
 */
function isAbbreviationValid(syntax, abbreviation) {
    if (!abbreviation) {
        return false;
    }
    if (isStyleSheet(syntax)) {
        if (abbreviation.includes('#')) {
            if (abbreviation.startsWith('#')) {
                const hexColorRegex = /^#[\d,a-f,A-F]{1,6}$/;
                return hexColorRegex.test(abbreviation);
            }
            else if (commonlyUsedTags.includes(abbreviation.substring(0, abbreviation.indexOf('#')))) {
                return false;
            }
        }
        return cssAbbreviationRegex.test(abbreviation);
    }
    if (abbreviation.startsWith('!')) {
        return !/[^!]/.test(abbreviation);
    }
    // Its common for users to type (sometextinsidebrackets), this should not be treated as an abbreviation
    // Grouping in abbreviation is valid only if it's inside a text node or preceeded/succeeded with one of the symbols for nesting, sibling, repeater or climb up
    // Also, cases such as `span[onclick="alert();"]` are valid
    if ((/\(/.test(abbreviation) || /\)/.test(abbreviation))
        && !/\{[^\}\{]*[\(\)]+[^\}\{]*\}(?:[>\+\*\^]|$)/.test(abbreviation)
        && !/\(.*\)[>\+\*\^]/.test(abbreviation)
        && !/\[[^\[\]\(\)]+=".*"\]/.test(abbreviation)
        && !/[>\+\*\^]\(.*\)/.test(abbreviation)) {
        return false;
    }
    if (syntax === 'jsx') {
        return (jsxAbbreviationStartRegex.test(abbreviation) && htmlAbbreviationRegex.test(abbreviation));
    }
    // Fix for jinja syntax https://github.com/microsoft/vscode/issues/179422
    if (/^{%|{#|{{/.test(abbreviation)) {
        return false;
    }
    return (htmlAbbreviationStartRegex.test(abbreviation) && htmlAbbreviationRegex.test(abbreviation));
}
function isExpandedTextNoise(syntax, abbreviation, expandedText, options) {
    var _a, _b;
    // Unresolved css abbreviations get expanded to a blank property value
    // Eg: abc -> abc: ; or abc:d -> abc: d; which is noise if it gets suggested for every word typed
    if (isStyleSheet(syntax) && options) {
        const between = (_a = options['stylesheet.between']) !== null && _a !== void 0 ? _a : ': ';
        const after = (_b = options['stylesheet.after']) !== null && _b !== void 0 ? _b : ';';
        // Remove overlapping between `abbreviation` and `between`, if any
        let endPrefixIndex = abbreviation.indexOf(between[0], Math.max(abbreviation.length - between.length, 0));
        endPrefixIndex = endPrefixIndex >= 0 ? endPrefixIndex : abbreviation.length;
        const abbr = abbreviation.substring(0, endPrefixIndex);
        return expandedText === `${abbr}${between}\${0}${after}` ||
            expandedText.replace(/\s/g, '') === abbreviation.replace(/\s/g, '') + after;
    }
    // we don't want common html tags suggested for xml
    if (syntax === 'xml' &&
        commonlyUsedTags.some(tag => tag.startsWith(abbreviation.toLowerCase()))) {
        return true;
    }
    if (commonlyUsedTags.includes(abbreviation.toLowerCase()) ||
        markupSnippetKeys.includes(abbreviation)) {
        return false;
    }
    // Custom tags can have - or :
    if (/[-,:]/.test(abbreviation) && !/--|::/.test(abbreviation) &&
        !abbreviation.endsWith(':')) {
        return false;
    }
    // users might write successive dots '..', '...' which shouldn't be treated as an abbreviation
    if (/^\.{2,}$/.test(abbreviation)) {
        return true;
    }
    // Its common for users to type some text and end it with period, this should not be treated as an abbreviation
    // Else it becomes noise.
    // When user just types '.', return the expansion
    // Otherwise emmet loses change to participate later
    // For example in `.foo`. See https://github.com/Microsoft/vscode/issues/66013
    if (abbreviation === '.') {
        return false;
    }
    const dotMatches = abbreviation.match(/^([a-z,A-Z,\d]*)\.$/);
    if (dotMatches) {
        // Valid html tags such as `div.`
        if (dotMatches[1] && data_1.htmlData.tags.includes(dotMatches[1])) {
            return false;
        }
        return true;
    }
    // Fix for https://github.com/microsoft/vscode/issues/89746
    // PascalCase tags are common in jsx code, which should not be treated as noise.
    // Eg: MyAwesomComponent -> <MyAwesomComponent></MyAwesomComponent>
    if (syntax === 'jsx' && /^([A-Z][A-Za-z0-9]*)+$/.test(abbreviation)) {
        return false;
    }
    // Unresolved html abbreviations get expanded as if it were a tag
    // Eg: abc -> <abc></abc> which is noise if it gets suggested for every word typed
    return (expandedText.toLowerCase() === `<${abbreviation.toLowerCase()}>\${1}</${abbreviation.toLowerCase()}>`);
}
/**
 * Returns options to be used by emmet
 */
function getExpandOptions(syntax, emmetConfig, filter) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    emmetConfig = emmetConfig !== null && emmetConfig !== void 0 ? emmetConfig : {};
    emmetConfig['preferences'] = (_a = emmetConfig['preferences']) !== null && _a !== void 0 ? _a : {};
    const preferences = emmetConfig['preferences'];
    const stylesheetSyntax = isStyleSheet(syntax) ? syntax : 'css';
    // Fetch Profile
    const profile = getProfile(syntax, (_b = emmetConfig['syntaxProfiles']) !== null && _b !== void 0 ? _b : {});
    const filtersFromProfile = (profile && profile['filters']) ? profile['filters'].split(',') : [];
    const trimmedFilters = filtersFromProfile.map(filterFromProfile => filterFromProfile.trim());
    const bemEnabled = (filter && filter.split(',').some(x => x.trim() === 'bem')) || trimmedFilters.includes('bem');
    const commentEnabled = (filter && filter.split(',').some(x => x.trim() === 'c')) || trimmedFilters.includes('c');
    // Fetch formatters
    const formatters = getFormatters(syntax, emmetConfig['preferences']);
    const unitAliases = ((formatters === null || formatters === void 0 ? void 0 : formatters.stylesheet) && formatters.stylesheet['unitAliases']) || {};
    // These options are the default values provided by vscode for
    // extension preferences
    const defaultVSCodeOptions = {
        // inlineElements: string[],
        // 'output.indent': string,
        // 'output.baseIndent': string,
        // 'output.newline': string,
        // 'output.tagCase': profile['tagCase'],
        // 'output.attributeCase': profile['attributeCase'],
        // 'output.attributeQuotes': profile['attributeQuotes'],
        // 'output.format': profile['format'] ?? true,
        // 'output.formatLeafNode': boolean,
        'output.formatSkip': ['html'],
        'output.formatForce': ['body'],
        'output.inlineBreak': 0,
        'output.compactBoolean': false,
        // 'output.booleanAttributes': string[],
        'output.reverseAttributes': false,
        // 'output.selfClosingStyle': profile['selfClosingStyle'],
        'output.field': exports.emmetSnippetField,
        // 'output.text': TextOutput,
        'markup.href': true,
        'comment.enabled': false,
        'comment.trigger': ['id', 'class'],
        'comment.before': '',
        'comment.after': '\n<!-- /[#ID][.CLASS] -->',
        'bem.enabled': false,
        'bem.element': '__',
        'bem.modifier': '_',
        'jsx.enabled': syntax === 'jsx',
        // 'stylesheet.keywords': string[],
        // 'stylesheet.unitless': string[],
        'stylesheet.shortHex': true,
        'stylesheet.between': syntax === 'stylus' ? ' ' : ': ',
        'stylesheet.after': (syntax === 'sass' || syntax === 'stylus') ? '' : ';',
        'stylesheet.intUnit': 'px',
        'stylesheet.floatUnit': 'em',
        'stylesheet.unitAliases': { e: 'em', p: '%', x: 'ex', r: 'rem' },
        // 'stylesheet.json': boolean,
        // 'stylesheet.jsonDoubleQuotes': boolean,
        'stylesheet.fuzzySearchMinScore': 0.3,
    };
    // These options come from user prefs in the vscode repo
    let userPreferenceOptions = {
        // inlineElements: string[],
        // 'output.indent': string,
        // 'output.baseIndent': string,
        // 'output.newline': string,
        'output.tagCase': profile['tagCase'],
        'output.attributeCase': profile['attributeCase'],
        'output.attributeQuotes': profile['attributeQuotes'],
        'output.format': (_c = profile['format']) !== null && _c !== void 0 ? _c : true,
        // 'output.formatLeafNode': boolean,
        'output.formatSkip': preferences['format.noIndentTags'],
        'output.formatForce': preferences['format.forceIndentationForTags'],
        'output.inlineBreak': (_d = profile['inlineBreak']) !== null && _d !== void 0 ? _d : preferences['output.inlineBreak'],
        'output.compactBoolean': (_e = profile['compactBooleanAttributes']) !== null && _e !== void 0 ? _e : preferences['profile.allowCompactBoolean'],
        // 'output.booleanAttributes': string[],
        'output.reverseAttributes': preferences['output.reverseAttributes'],
        'output.selfClosingStyle': (_g = (_f = profile['selfClosingStyle']) !== null && _f !== void 0 ? _f : preferences['output.selfClosingStyle']) !== null && _g !== void 0 ? _g : getClosingStyle(syntax),
        'output.field': exports.emmetSnippetField,
        // 'output.text': TextOutput,
        // 'markup.href': boolean,
        'comment.enabled': commentEnabled,
        'comment.trigger': preferences['filter.commentTrigger'],
        'comment.before': preferences['filter.commentBefore'],
        'comment.after': preferences['filter.commentAfter'],
        'bem.enabled': bemEnabled,
        'bem.element': (_h = preferences['bem.elementSeparator']) !== null && _h !== void 0 ? _h : '__',
        'bem.modifier': (_j = preferences['bem.modifierSeparator']) !== null && _j !== void 0 ? _j : '_',
        'jsx.enabled': syntax === 'jsx',
        // 'stylesheet.keywords': string[],
        // 'stylesheet.unitless': string[],
        'stylesheet.shortHex': preferences['css.color.short'],
        'stylesheet.between': preferences[`${stylesheetSyntax}.valueSeparator`],
        'stylesheet.after': preferences[`${stylesheetSyntax}.propertyEnd`],
        'stylesheet.intUnit': preferences['css.intUnit'],
        'stylesheet.floatUnit': preferences['css.floatUnit'],
        'stylesheet.unitAliases': unitAliases,
        // 'stylesheet.json': boolean,
        // 'stylesheet.jsonDoubleQuotes': boolean,
        'stylesheet.fuzzySearchMinScore': preferences['css.fuzzySearchMinScore']
    };
    if (syntax === 'jsx') {
        // Ref https://github.com/emmetio/emmet/blob/master/src/config.ts#L391
        const defaultMarkupAttributeOptions = {
            'class': 'className',
            'class*': 'styleName',
            'for': 'htmlFor'
        };
        const defaultMarkupValuePrefixOptions = {
            'class*': 'styles'
        };
        // Rather than trying to merge these specific options upstream,
        // we can merge them here before passing them upstream.
        if (profile['markup.attributes']) {
            userPreferenceOptions['markup.attributes'] = Object.assign(Object.assign({}, defaultMarkupAttributeOptions), profile['markup.attributes']);
        }
        if (profile['markup.valuePrefix']) {
            userPreferenceOptions['markup.valuePrefix'] = Object.assign(Object.assign({}, defaultMarkupValuePrefixOptions), profile['markup.valuePrefix']);
        }
    }
    if (syntax === 'vue') {
        // Ref https://github.com/emmetio/emmet/blob/master/src/config.ts#L404
        const defaultMarkupAttributeOptions = {
            'class*': ':class',
        };
        const defaultMarkupValuePrefixOptions = {
            'class*': '$style'
        };
        if (profile['markup.attributes']) {
            userPreferenceOptions['markup.attributes'] = Object.assign(Object.assign({}, defaultMarkupAttributeOptions), profile['markup.attributes']);
        }
        if (profile['markup.valuePrefix']) {
            userPreferenceOptions['markup.valuePrefix'] = Object.assign(Object.assign({}, defaultMarkupValuePrefixOptions), profile['markup.valuePrefix']);
        }
    }
    const combinedOptions = {};
    [...Object.keys(defaultVSCodeOptions), ...Object.keys(userPreferenceOptions)].forEach(key => {
        var _a;
        const castKey = key;
        combinedOptions[castKey] = (_a = userPreferenceOptions[castKey]) !== null && _a !== void 0 ? _a : defaultVSCodeOptions[castKey];
    });
    const mergedAliases = Object.assign(Object.assign({}, defaultVSCodeOptions['stylesheet.unitAliases']), userPreferenceOptions['stylesheet.unitAliases']);
    combinedOptions['stylesheet.unitAliases'] = mergedAliases;
    const type = getSyntaxType(syntax);
    const variables = getVariables(emmetConfig['variables']);
    const baseSyntax = getDefaultSyntax(syntax);
    const snippets = (type === 'stylesheet') ?
        ((_k = customSnippetsRegistry[syntax]) !== null && _k !== void 0 ? _k : customSnippetsRegistry[baseSyntax]) :
        customSnippetsRegistry[syntax];
    return {
        type,
        options: combinedOptions,
        variables,
        snippets,
        syntax,
        // context: null,
        text: undefined,
        maxRepeat: 1000,
        // cache: null
    };
}
function getClosingStyle(syntax) {
    switch (syntax) {
        case 'xhtml': return 'xhtml';
        case 'xml': return 'xml';
        case 'xsl': return 'xml';
        case 'jsx': return 'xhtml';
        default: return 'html';
    }
}
/**
 * Parses given abbreviation using given options and returns a tree
 * @param abbreviation string
 * @param options options used by the emmet module to parse given abbreviation
 */
function parseAbbreviation(abbreviation, options) {
    const resolvedOptions = (0, emmet_1.resolveConfig)(options);
    return (options.type === 'stylesheet') ?
        (0, emmet_1.parseStylesheet)(abbreviation, resolvedOptions) :
        (0, emmet_1.parseMarkup)(abbreviation, resolvedOptions);
}
/**
 * Expands given abbreviation using given options
 * @param abbreviation string or parsed abbreviation
 * @param config options used by the @emmetio/expand-abbreviation module to expand given abbreviation
 */
function expandAbbreviation(abbreviation, config) {
    let expandedText;
    const resolvedConfig = (0, emmet_1.resolveConfig)(config);
    if (config.type === 'stylesheet') {
        if (typeof abbreviation === 'string') {
            expandedText = (0, emmet_1.default)(abbreviation, resolvedConfig);
        }
        else {
            expandedText = (0, emmet_1.stringifyStylesheet)(abbreviation, resolvedConfig);
        }
    }
    else {
        if (typeof abbreviation === 'string') {
            expandedText = (0, emmet_1.default)(abbreviation, resolvedConfig);
        }
        else {
            expandedText = (0, emmet_1.stringifyMarkup)(abbreviation, resolvedConfig);
        }
    }
    return escapeNonTabStopDollar(addFinalTabStop(expandedText));
}
/**
 * Maps and returns syntaxProfiles of previous format to ones compatible with new emmet modules
 * @param syntax
 */
function getProfile(syntax, profilesFromSettings) {
    if (!profilesFromSettings) {
        profilesFromSettings = {};
    }
    const profilesConfig = Object.assign({}, profilesFromFile, profilesFromSettings);
    const options = profilesConfig[syntax];
    if (!options || typeof options === 'string') {
        if (options === 'xhtml') {
            return {
                selfClosingStyle: 'xhtml'
            };
        }
        return {};
    }
    const newOptions = {};
    for (const key in options) {
        switch (key) {
            case 'tag_case':
                newOptions['tagCase'] = (options[key] === 'lower' || options[key] === 'upper') ? options[key] : '';
                break;
            case 'attr_case':
                newOptions['attributeCase'] = (options[key] === 'lower' || options[key] === 'upper') ? options[key] : '';
                break;
            case 'attr_quotes':
                newOptions['attributeQuotes'] = options[key];
                break;
            case 'tag_nl':
                newOptions['format'] = (options[key] === true || options[key] === false) ? options[key] : true;
                break;
            case 'inline_break':
                newOptions['inlineBreak'] = options[key];
                break;
            case 'self_closing_tag':
                if (options[key] === true) {
                    newOptions['selfClosingStyle'] = 'xml';
                    break;
                }
                if (options[key] === false) {
                    newOptions['selfClosingStyle'] = 'html';
                    break;
                }
                newOptions['selfClosingStyle'] = options[key];
                break;
            case 'compact_bool':
                newOptions['compactBooleanAttributes'] = options[key];
                break;
            default:
                newOptions[key] = options[key];
                break;
        }
    }
    return newOptions;
}
/**
 * Returns variables to be used while expanding snippets
 */
function getVariables(variablesFromSettings) {
    if (!variablesFromSettings) {
        return variablesFromFile;
    }
    return Object.assign({}, variablesFromFile, variablesFromSettings);
}
function getFormatters(syntax, preferences) {
    if (!preferences || typeof preferences !== 'object') {
        return {};
    }
    if (!isStyleSheet(syntax)) {
        const commentFormatter = {};
        for (const key in preferences) {
            switch (key) {
                case 'filter.commentAfter':
                    commentFormatter['after'] = preferences[key];
                    break;
                case 'filter.commentBefore':
                    commentFormatter['before'] = preferences[key];
                    break;
                case 'filter.commentTrigger':
                    commentFormatter['trigger'] = preferences[key];
                    break;
                default:
                    break;
            }
        }
        return {
            comment: commentFormatter
        };
    }
    let fuzzySearchMinScore = typeof (preferences === null || preferences === void 0 ? void 0 : preferences['css.fuzzySearchMinScore']) === 'number' ? preferences['css.fuzzySearchMinScore'] : 0.3;
    if (fuzzySearchMinScore > 1) {
        fuzzySearchMinScore = 1;
    }
    else if (fuzzySearchMinScore < 0) {
        fuzzySearchMinScore = 0;
    }
    const stylesheetFormatter = {
        'fuzzySearchMinScore': fuzzySearchMinScore
    };
    for (const key in preferences) {
        switch (key) {
            case 'css.floatUnit':
                stylesheetFormatter['floatUnit'] = preferences[key];
                break;
            case 'css.intUnit':
                stylesheetFormatter['intUnit'] = preferences[key];
                break;
            case 'css.unitAliases':
                const unitAliases = {};
                preferences[key].split(',').forEach((alias) => {
                    if (!alias || !alias.trim() || !alias.includes(':')) {
                        return;
                    }
                    const aliasName = alias.substr(0, alias.indexOf(':'));
                    const aliasValue = alias.substr(aliasName.length + 1);
                    if (!aliasName.trim() || !aliasValue) {
                        return;
                    }
                    unitAliases[aliasName.trim()] = aliasValue;
                });
                stylesheetFormatter['unitAliases'] = unitAliases;
                break;
            case `${syntax}.valueSeparator`:
                stylesheetFormatter['between'] = preferences[key];
                break;
            case `${syntax}.propertyEnd`:
                stylesheetFormatter['after'] = preferences[key];
                break;
            default:
                break;
        }
    }
    return {
        stylesheet: stylesheetFormatter
    };
}
/**
 * Updates customizations from snippets.json and syntaxProfiles.json files in the directory configured in emmet.extensionsPath setting
 * @param emmetExtensionsPathSetting setting passed from emmet.extensionsPath. Supports multiple paths
 */
function updateExtensionsPath(emmetExtensionsPathSetting, fs, workspaceFolderPaths, homeDir) {
    return __awaiter(this, void 0, void 0, function* () {
        resetSettingsFromFile();
        if (!emmetExtensionsPathSetting.length) {
            return;
        }
        // Extract URIs from the given setting
        const emmetExtensionsPathUri = [];
        for (let emmetExtensionsPath of emmetExtensionsPathSetting) {
            if (typeof emmetExtensionsPath !== 'string') {
                console.warn("The following emmetExtensionsPath isn't a string: " + JSON.stringify(emmetExtensionsPath));
                continue;
            }
            emmetExtensionsPath = emmetExtensionsPath.trim();
            if (emmetExtensionsPath.length && emmetExtensionsPath[0] === '~') {
                if (homeDir) {
                    emmetExtensionsPathUri.push((0, fileService_1.joinPath)(homeDir, emmetExtensionsPath.substring(1)));
                }
            }
            else if (!(0, fileService_1.isAbsolutePath)(emmetExtensionsPath)) {
                if (workspaceFolderPaths) {
                    // Try pushing the path for each workspace root
                    for (const workspacePath of workspaceFolderPaths) {
                        emmetExtensionsPathUri.push((0, fileService_1.joinPath)(workspacePath, emmetExtensionsPath));
                    }
                }
            }
            else {
                emmetExtensionsPathUri.push(vscode_uri_1.URI.file(emmetExtensionsPath));
            }
        }
        // For each URI, grab the files
        for (const uri of emmetExtensionsPathUri) {
            try {
                if ((yield fs.stat(uri)).type !== fileService_1.FileType.Directory) {
                    // Invalid directory, or path is not a directory
                    continue;
                }
            }
            catch (e) {
                // stat threw an error
                continue;
            }
            const snippetsPath = (0, fileService_1.joinPath)(uri, 'snippets.json');
            const profilesPath = (0, fileService_1.joinPath)(uri, 'syntaxProfiles.json');
            let decoder;
            if (typeof globalThis.TextDecoder === 'function') {
                decoder = new globalThis.TextDecoder();
            }
            else {
                decoder = new util_1.TextDecoder();
            }
            // the only errors we want to throw here are JSON parse errors
            let snippetsDataStr = "";
            try {
                const snippetsData = yield fs.readFile(snippetsPath);
                snippetsDataStr = decoder.decode(snippetsData);
            }
            catch (e) {
            }
            if (snippetsDataStr.length) {
                try {
                    const snippetsJson = tryParseFile(snippetsPath, snippetsDataStr);
                    if (snippetsJson['variables']) {
                        updateVariables(snippetsJson['variables']);
                    }
                    updateSnippets(snippetsJson);
                }
                catch (e) {
                    resetSettingsFromFile();
                    throw e;
                }
            }
            let profilesDataStr = "";
            try {
                const profilesData = yield fs.readFile(profilesPath);
                profilesDataStr = decoder.decode(profilesData);
            }
            catch (e) {
            }
            if (profilesDataStr.length) {
                try {
                    const profilesJson = tryParseFile(profilesPath, profilesDataStr);
                    updateProfiles(profilesJson);
                }
                catch (e) {
                    resetSettingsFromFile();
                    throw e;
                }
            }
        }
    });
}
function tryParseFile(strPath, dataStr) {
    let errors = [];
    const json = JSONC.parse(dataStr, errors);
    if (errors.length) {
        throw new Error(`Found error ${JSONC.printParseErrorCode(errors[0].error)} while parsing the file ${strPath} at offset ${errors[0].offset}`);
    }
    return json;
}
/**
 * Assigns variables from one snippet file under emmet.extensionsPath to
 * variablesFromFile
 */
function updateVariables(varsJson) {
    if (typeof varsJson === 'object' && varsJson) {
        variablesFromFile = Object.assign({}, variablesFromFile, varsJson);
    }
    else {
        throw new Error(l10n.t('Invalid emmet.variables field. See https://code.visualstudio.com/docs/editor/emmet#_emmet-configuration for a valid example.'));
    }
}
/**
 * Assigns profiles from one profile file under emmet.extensionsPath to
 * profilesFromFile
 */
function updateProfiles(profileJson) {
    if (typeof profileJson === 'object' && profileJson) {
        profilesFromFile = Object.assign({}, profilesFromFile, profileJson);
    }
    else {
        throw new Error(l10n.t('Invalid syntax profile. See https://code.visualstudio.com/docs/editor/emmet#_emmet-configuration for a valid example.'));
    }
}
/**
 * Assigns snippets from one snippet file under emmet.extensionsPath to
 * customSnippetsRegistry, snippetKeyCache, and stylesheetCustomSnippetsKeyCache
 */
function updateSnippets(snippetsJson) {
    if (typeof snippetsJson === 'object' && snippetsJson) {
        Object.keys(snippetsJson).forEach(syntax => {
            if (!snippetsJson[syntax]['snippets']) {
                return;
            }
            const baseSyntax = getDefaultSyntax(syntax);
            let customSnippets = snippetsJson[syntax]['snippets'];
            if (snippetsJson[baseSyntax] && snippetsJson[baseSyntax]['snippets'] && baseSyntax !== syntax) {
                customSnippets = Object.assign({}, snippetsJson[baseSyntax]['snippets'], snippetsJson[syntax]['snippets']);
            }
            if (!isStyleSheet(syntax)) {
                // In Emmet 2.0 all snippets should be valid abbreviations
                // Convert old snippets that do not follow this format to new format
                for (const snippetKey in customSnippets) {
                    if (customSnippets.hasOwnProperty(snippetKey)
                        && customSnippets[snippetKey].startsWith('<')
                        && customSnippets[snippetKey].endsWith('>')) {
                        customSnippets[snippetKey] = `{${customSnippets[snippetKey]}}`;
                    }
                }
            }
            else {
                const prevSnippetKeys = stylesheetCustomSnippetsKeyCache.get(syntax);
                const mergedSnippetKeys = Object.assign([], prevSnippetKeys, Object.keys(customSnippets));
                stylesheetCustomSnippetsKeyCache.set(syntax, mergedSnippetKeys);
            }
            const prevSnippetsRegistry = customSnippetsRegistry[syntax];
            const newSnippets = (0, configCompat_1.parseSnippets)(customSnippets);
            const mergedSnippets = Object.assign({}, prevSnippetsRegistry, newSnippets);
            customSnippetsRegistry[syntax] = mergedSnippets;
        });
    }
    else {
        throw new Error(l10n.t('Invalid snippets file. See https://code.visualstudio.com/docs/editor/emmet#_using-custom-emmet-snippets for a valid example.'));
    }
}
function resetSettingsFromFile() {
    customSnippetsRegistry = {};
    snippetKeyCache.clear();
    stylesheetCustomSnippetsKeyCache.clear();
    profilesFromFile = {};
    variablesFromFile = {};
}
/**
* Get the corresponding emmet mode for given vscode language mode
* Eg: jsx for typescriptreact/javascriptreact or pug for jade
* If the language is not supported by emmet or has been exlcuded via `exlcudeLanguages` setting,
* then nothing is returned
*
* @param language
* @param exlcudedLanguages Array of language ids that user has chosen to exlcude for emmet
*/
function getEmmetMode(language, excludedLanguages = []) {
    if (!language || excludedLanguages.includes(language)) {
        return;
    }
    if (/\b(typescriptreact|javascriptreact|jsx-tags)\b/.test(language)) { // treat tsx like jsx
        return 'jsx';
    }
    if (language === 'sass-indented') { // map sass-indented to sass
        return 'sass';
    }
    if (language === 'jade') {
        return 'pug';
    }
    if (configCompat_1.syntaxes.markup.includes(language) || configCompat_1.syntaxes.stylesheet.includes(language)) {
        return language;
    }
}
//# sourceMappingURL=emmetHelper.js.map