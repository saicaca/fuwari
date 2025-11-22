/**
 * Due to LSP limitation this object must be JSON serializable
 */
export interface TelemetryEvent {
    name: string;
    type?: string;
    properties?: unknown;
    measures?: unknown;
    traits?: unknown;
    context?: unknown;
}
export interface Telemetry {
    send(event: TelemetryEvent): void;
    sendError(name: string, properties: unknown): void;
    sendTrack(name: string, properties: unknown): void;
}
