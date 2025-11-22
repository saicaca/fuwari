"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SemanticTokensBuilder = void 0;
class SemanticTokensBuilder {
    constructor() {
        this.initialize();
    }
    initialize() {
        this._id = Date.now();
        this._prevLine = 0;
        this._prevChar = 0;
        this._data = [];
        this._dataLen = 0;
    }
    push(line, char, length, tokenType, tokenModifiers) {
        let pushLine = line;
        let pushChar = char;
        if (this._dataLen > 0) {
            pushLine -= this._prevLine;
            if (pushLine === 0) {
                pushChar -= this._prevChar;
            }
        }
        this._data[this._dataLen++] = pushLine;
        this._data[this._dataLen++] = pushChar;
        this._data[this._dataLen++] = length;
        this._data[this._dataLen++] = tokenType;
        this._data[this._dataLen++] = tokenModifiers;
        this._prevLine = line;
        this._prevChar = char;
    }
    get id() {
        return this._id.toString();
    }
    build() {
        return {
            resultId: this.id,
            data: this._data,
        };
    }
}
exports.SemanticTokensBuilder = SemanticTokensBuilder;
//# sourceMappingURL=SemanticTokensBuilder.js.map