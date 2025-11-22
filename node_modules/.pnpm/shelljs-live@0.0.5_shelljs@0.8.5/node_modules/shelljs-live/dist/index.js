"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const cross_spawn_1 = __importDefault(require("cross-spawn"));
const shelljs_1 = require("shelljs");
const utils_1 = require("./utils");
function live(command, optionsOrCallback, callback) {
    var _a, _b;
    let options;
    if (typeof optionsOrCallback === 'function') {
        callback = optionsOrCallback;
        options = {};
    }
    else {
        options = optionsOrCallback || {};
    }
    const [command0, args, shell] = (0, utils_1.parseCommand)(command);
    if (!command0) {
        throw new Error('Must specify a command');
    }
    const fatal = (_a = options.fatal) !== null && _a !== void 0 ? _a : shelljs_1.config.fatal;
    const silent = (_b = options.silent) !== null && _b !== void 0 ? _b : shelljs_1.config.silent;
    const spawnOptions = {
        ...options,
        ...(silent ? {} : { stdio: 'inherit' }),
        shell,
    };
    function handleStatus(status) {
        if (status === null || status !== 0) {
            if (fatal) {
                console.error((0, utils_1.buildErrorMessage)(command0, status));
                process.exit(status || 1);
            }
        }
        if (callback) {
            callback(status);
        }
    }
    if (options.async || callback) {
        const childProcess = (0, cross_spawn_1.default)(command0, args, spawnOptions);
        childProcess.on('close', handleStatus);
        return null;
    }
    else {
        const { status } = cross_spawn_1.default.sync(command0, args, spawnOptions);
        handleStatus(status);
        return status;
    }
}
module.exports = live;
