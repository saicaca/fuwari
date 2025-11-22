import type { CodeMapping } from '@volar/language-core';
import type { DocumentDropEdit } from '@volar/language-service';
import * as vscode from 'vscode-languageserver-protocol';
export * from 'vscode-languageserver-protocol';
/**
 * Client request server
 */
export declare namespace FindFileReferenceRequest {
    type ParamsType = {
        textDocument: vscode.TextDocumentIdentifier;
    };
    type ResponseType = vscode.Location[] | null | undefined;
    type ErrorType = never;
    const type: vscode.RequestType<ParamsType, ResponseType, never>;
}
export declare namespace GetMatchTsConfigRequest {
    type ParamsType = vscode.TextDocumentIdentifier;
    type ResponseType = {
        uri: string;
    } | null | undefined;
    type ErrorType = never;
    const type: vscode.RequestType<vscode.TextDocumentIdentifier, ResponseType, never>;
}
export declare namespace AutoInsertRequest {
    type ParamsType = {
        textDocument: vscode.TextDocumentIdentifier;
        selection: vscode.Position;
        change: {
            rangeOffset: number;
            rangeLength: number;
            text: string;
        };
    };
    type ResponseType = string | null | undefined;
    type ErrorType = never;
    const type: vscode.RequestType<ParamsType, ResponseType, never>;
}
export declare namespace WriteVirtualFilesNotification {
    const type: vscode.NotificationType<vscode.TextDocumentIdentifier>;
}
export declare namespace ReloadProjectNotification {
    const type: vscode.NotificationType<vscode.TextDocumentIdentifier>;
}
/**
 * Document Drop
 */
export declare namespace DocumentDropRequest {
    type ParamsType = vscode.TextDocumentPositionParams & {
        dataTransfer: {
            mimeType: string;
            value: any;
            file?: {
                name: string;
                uri?: string;
            };
        }[];
    };
    type ResponseType = DocumentDropEdit | null | undefined;
    type ErrorType = never;
    const type: vscode.RequestType<ParamsType, ResponseType, never>;
}
export declare namespace DocumentDrop_DataTransferItemAsStringRequest {
    type ParamsType = {
        mimeType: string;
    };
    type ResponseType = string;
    type ErrorType = never;
    const type: vscode.RequestType<ParamsType, string, never>;
}
export declare namespace DocumentDrop_DataTransferItemFileDataRequest {
    type ParamsType = {
        mimeType: string;
    };
    type ResponseType = Uint8Array;
    type ErrorType = never;
    const type: vscode.RequestType<ParamsType, ResponseType, never>;
}
/**
 * Labs
 */
export declare namespace UpdateVirtualCodeStateNotification {
    type ParamsType = {
        fileUri: string;
        virtualCodeId: string;
        disabled: boolean;
    };
    const type: vscode.NotificationType<ParamsType>;
}
export declare namespace UpdateServicePluginStateNotification {
    type ParamsType = {
        uri: string;
        serviceId: number;
        disabled: boolean;
    };
    const type: vscode.NotificationType<ParamsType>;
}
export declare namespace GetServicePluginsRequest {
    type ParamsType = vscode.TextDocumentIdentifier;
    type ResponseType = {
        id: number;
        name?: string;
        features: string[];
        disabled: boolean;
    }[] | null | undefined;
    type ErrorType = never;
    const type: vscode.RequestType<vscode.TextDocumentIdentifier, ResponseType, never>;
}
export declare namespace GetVirtualFileRequest {
    type VirtualCodeInfo = {
        fileUri: string;
        virtualCodeId: string;
        languageId: string;
        version: number;
        disabled: boolean;
        embeddedCodes: VirtualCodeInfo[];
    };
    type ParamsType = vscode.TextDocumentIdentifier;
    type ResponseType = VirtualCodeInfo | null | undefined;
    type ErrorType = never;
    const type: vscode.RequestType<vscode.TextDocumentIdentifier, ResponseType, never>;
}
export declare namespace GetVirtualCodeRequest {
    type ParamsType = {
        fileUri: string;
        virtualCodeId: string;
    };
    type ResponseType = {
        content: string;
        mappings: Record<string, CodeMapping[]>;
    };
    type ErrorType = never;
    const type: vscode.RequestType<ParamsType, ResponseType, never>;
}
export declare namespace LoadedTSFilesMetaRequest {
    const type: vscode.RequestType0<unknown, unknown>;
}
