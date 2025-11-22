/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { YamlCommands } from '../../commands';
import { URI } from 'vscode-uri';
export function registerCommands(commandExecutor, connection) {
    commandExecutor.registerCommand(YamlCommands.JUMP_TO_SCHEMA, async (uri) => {
        if (!uri) {
            return;
        }
        // if uri points to local file of its a windows path
        if (!uri.startsWith('file') && !/^[a-z]:[\\/]/i.test(uri)) {
            const origUri = URI.parse(uri);
            const customUri = URI.from({
                scheme: 'json-schema',
                authority: origUri.authority,
                path: origUri.path.endsWith('.json') ? origUri.path : origUri.path + '.json',
                fragment: uri,
            });
            uri = customUri.toString();
        }
        // test if uri is windows path, ie starts with 'c:\' and convert to URI
        if (/^[a-z]:[\\/]/i.test(uri)) {
            const winUri = URI.file(uri);
            uri = winUri.toString();
        }
        const result = await connection.window.showDocument({ uri: uri, external: false, takeFocus: true });
        if (!result) {
            connection.window.showErrorMessage(`Cannot open ${uri}`);
        }
    });
}
//# sourceMappingURL=yamlCommands.js.map