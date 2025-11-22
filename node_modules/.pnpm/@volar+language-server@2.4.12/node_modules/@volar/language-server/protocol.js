"use strict";
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadedTSFilesMetaRequest = exports.GetVirtualCodeRequest = exports.GetVirtualFileRequest = exports.GetServicePluginsRequest = exports.UpdateServicePluginStateNotification = exports.UpdateVirtualCodeStateNotification = exports.DocumentDrop_DataTransferItemFileDataRequest = exports.DocumentDrop_DataTransferItemAsStringRequest = exports.DocumentDropRequest = exports.ReloadProjectNotification = exports.WriteVirtualFilesNotification = exports.AutoInsertRequest = exports.GetMatchTsConfigRequest = exports.FindFileReferenceRequest = void 0;
const vscode = require("vscode-languageserver-protocol");
__exportStar(require("vscode-languageserver-protocol"), exports);
/**
 * Client request server
 */
var FindFileReferenceRequest;
(function (FindFileReferenceRequest) {
    FindFileReferenceRequest.type = new vscode.RequestType('volar/client/findFileReference');
})(FindFileReferenceRequest || (exports.FindFileReferenceRequest = FindFileReferenceRequest = {}));
var GetMatchTsConfigRequest;
(function (GetMatchTsConfigRequest) {
    GetMatchTsConfigRequest.type = new vscode.RequestType('volar/client/tsconfig');
})(GetMatchTsConfigRequest || (exports.GetMatchTsConfigRequest = GetMatchTsConfigRequest = {}));
var AutoInsertRequest;
(function (AutoInsertRequest) {
    AutoInsertRequest.type = new vscode.RequestType('volar/client/autoInsert');
})(AutoInsertRequest || (exports.AutoInsertRequest = AutoInsertRequest = {}));
var WriteVirtualFilesNotification;
(function (WriteVirtualFilesNotification) {
    WriteVirtualFilesNotification.type = new vscode.NotificationType('volar/client/writeVirtualFiles');
})(WriteVirtualFilesNotification || (exports.WriteVirtualFilesNotification = WriteVirtualFilesNotification = {}));
var ReloadProjectNotification;
(function (ReloadProjectNotification) {
    ReloadProjectNotification.type = new vscode.NotificationType('volar/client/reloadProject');
})(ReloadProjectNotification || (exports.ReloadProjectNotification = ReloadProjectNotification = {}));
/**
 * Document Drop
 */
var DocumentDropRequest;
(function (DocumentDropRequest) {
    DocumentDropRequest.type = new vscode.RequestType('volar/client/documentDrop');
})(DocumentDropRequest || (exports.DocumentDropRequest = DocumentDropRequest = {}));
var DocumentDrop_DataTransferItemAsStringRequest;
(function (DocumentDrop_DataTransferItemAsStringRequest) {
    DocumentDrop_DataTransferItemAsStringRequest.type = new vscode.RequestType('volar/client/documentDrop/asString');
})(DocumentDrop_DataTransferItemAsStringRequest || (exports.DocumentDrop_DataTransferItemAsStringRequest = DocumentDrop_DataTransferItemAsStringRequest = {}));
var DocumentDrop_DataTransferItemFileDataRequest;
(function (DocumentDrop_DataTransferItemFileDataRequest) {
    DocumentDrop_DataTransferItemFileDataRequest.type = new vscode.RequestType('volar/client/documentDrop/fileData');
})(DocumentDrop_DataTransferItemFileDataRequest || (exports.DocumentDrop_DataTransferItemFileDataRequest = DocumentDrop_DataTransferItemFileDataRequest = {}));
/**
 * Labs
 */
var UpdateVirtualCodeStateNotification;
(function (UpdateVirtualCodeStateNotification) {
    UpdateVirtualCodeStateNotification.type = new vscode.NotificationType('volar/client/labs/updateVirtualFileState');
})(UpdateVirtualCodeStateNotification || (exports.UpdateVirtualCodeStateNotification = UpdateVirtualCodeStateNotification = {}));
var UpdateServicePluginStateNotification;
(function (UpdateServicePluginStateNotification) {
    UpdateServicePluginStateNotification.type = new vscode.NotificationType('volar/client/labs/updateServicePluginState');
})(UpdateServicePluginStateNotification || (exports.UpdateServicePluginStateNotification = UpdateServicePluginStateNotification = {}));
var GetServicePluginsRequest;
(function (GetServicePluginsRequest) {
    GetServicePluginsRequest.type = new vscode.RequestType('volar/client/servicePlugins');
})(GetServicePluginsRequest || (exports.GetServicePluginsRequest = GetServicePluginsRequest = {}));
var GetVirtualFileRequest;
(function (GetVirtualFileRequest) {
    GetVirtualFileRequest.type = new vscode.RequestType('volar/client/virtualFiles');
})(GetVirtualFileRequest || (exports.GetVirtualFileRequest = GetVirtualFileRequest = {}));
var GetVirtualCodeRequest;
(function (GetVirtualCodeRequest) {
    GetVirtualCodeRequest.type = new vscode.RequestType('volar/client/virtualFile');
})(GetVirtualCodeRequest || (exports.GetVirtualCodeRequest = GetVirtualCodeRequest = {}));
var LoadedTSFilesMetaRequest;
(function (LoadedTSFilesMetaRequest) {
    LoadedTSFilesMetaRequest.type = new vscode.RequestType0('volar/client/loadedTsFiles');
})(LoadedTSFilesMetaRequest || (exports.LoadedTSFilesMetaRequest = LoadedTSFilesMetaRequest = {}));
//# sourceMappingURL=protocol.js.map