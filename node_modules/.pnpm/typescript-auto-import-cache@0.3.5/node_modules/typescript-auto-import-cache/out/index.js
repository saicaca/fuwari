"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLanguageService = void 0;
const semver = require("semver");
const _4_0_1 = require("./4_0");
const _4_4_1 = require("./4_4");
const _4_7_1 = require("./4_7");
const _5_0_1 = require("./5_0");
const _5_3_1 = require("./5_3");
const _5_5_1 = require("./5_5");
const _5_6_1 = require("./5_6");
function createLanguageService(ts, sys, host, createLanguageService) {
    // moduleSpecifierCache changes introduced in 5.6.1-rc 
    // https://github.com/microsoft/TypeScript/pull/59604
    if (semver.gte(ts.version, '5.6.1-rc')) {
        return (0, _5_6_1.default)(ts, sys, host, createLanguageService);
    }
    if (semver.gte(ts.version, '5.5.1')) {
        return (0, _5_5_1.default)(ts, sys, host, createLanguageService);
    }
    else if (semver.gte(ts.version, '5.3.0')) {
        return (0, _5_3_1.default)(ts, sys, host, createLanguageService);
    }
    else if (semver.gte(ts.version, '5.0.0')) {
        return (0, _5_0_1.default)(ts, sys, host, createLanguageService);
    }
    else if (semver.gte(ts.version, '4.7.0')) {
        const service = createLanguageService(host);
        (0, _4_7_1.default)(ts, host, service);
        return { languageService: service };
    }
    else if (semver.gte(ts.version, '4.4.0')) {
        const service = createLanguageService(host);
        (0, _4_4_1.default)(ts, host, service);
        return { languageService: service };
    }
    else if (semver.gte(ts.version, '4.0.0')) {
        const service = createLanguageService(host);
        (0, _4_0_1.default)(ts, host, service);
        return { languageService: service };
    }
    return { languageService: createLanguageService(host) };
}
exports.createLanguageService = createLanguageService;
