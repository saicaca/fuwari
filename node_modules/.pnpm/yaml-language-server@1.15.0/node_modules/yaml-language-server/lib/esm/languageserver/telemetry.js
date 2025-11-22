/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export class TelemetryImpl {
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
//# sourceMappingURL=telemetry.js.map