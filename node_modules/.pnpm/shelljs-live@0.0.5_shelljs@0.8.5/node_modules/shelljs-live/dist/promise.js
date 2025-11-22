"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const _1 = __importDefault(require("./"));
const utils_1 = require("./utils");
function live(command, options) {
    return new Promise((resolve, reject) => {
        (0, _1.default)(command, options, (status) => {
            if (status === 0) {
                resolve();
            }
            else {
                const errorMessage = (0, utils_1.buildErrorMessage)((0, utils_1.parseCommand)(command)[0], status);
                reject(new Error(errorMessage));
            }
        });
    });
}
module.exports = live;
