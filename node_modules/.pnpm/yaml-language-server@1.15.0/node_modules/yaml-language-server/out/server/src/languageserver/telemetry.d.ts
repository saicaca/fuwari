import { Connection } from 'vscode-languageserver';
import { TelemetryEvent, Telemetry } from '../languageservice/telemetry';
export declare class TelemetryImpl implements Telemetry {
    private readonly connection;
    constructor(connection: Connection);
    send(event: TelemetryEvent): void;
    sendError(name: string, properties: unknown): void;
    sendTrack(name: string, properties: unknown): void;
}
