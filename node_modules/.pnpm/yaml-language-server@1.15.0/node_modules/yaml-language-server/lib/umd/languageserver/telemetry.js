/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TelemetryImpl = void 0;
    class TelemetryImpl {
        constructor(connection) {
            this.connection = connection;
        }
        send(event) {
            this.connection.telemetry.logEvent(event);
        }
        sendError(name, properties) {
            this.send({ name, type: 'track', properties: properties });
        }
        sendTrack(name, properties) {
            this.send({ name, type: 'track', properties: properties });
        }
    }
    exports.TelemetryImpl = TelemetryImpl;
});
//# sourceMappingURL=telemetry.js.map