import { join, normalize, sep } from 'path';
import { URI } from 'vscode-uri';
export const isRelativePath = (path) => {
    const relativePathRegex = /^(((\.\.?)|([\w-@. ]+))(\/|\\\\?))*[\w-. ]*\.[\w-]+$/i;
    return relativePathRegex.test(path);
};
export const relativeToAbsolutePath = (workspaceFolders, workspaceRoot, uri) => {
    // Iterate through all of the workspace root folders
    for (const folder of workspaceFolders) {
        // If the requested schema URI specifies a workspace root folder
        // Convert it into an absolute path with the appropriate root folder path
        if (uri.startsWith(folder.name)) {
            const pathToFolder = URI.parse(folder.uri).fsPath;
            const withoutFolderPrefix = uri.split(sep);
            withoutFolderPrefix.shift();
            return URI.file(join(pathToFolder, withoutFolderPrefix.join())).toString();
        }
    }
    // If a root folder was not specified, resolve the relative URI
    // Against the location of the workspace file instead
    if (workspaceRoot) {
        return URI.file(join(workspaceRoot.fsPath, uri)).toString();
    }
    // Fallback in case nothing could be applied
    return normalize(uri);
};
export const workspaceFoldersChanged = (workspaceFolders, changedFolders) => {
    workspaceFolders = workspaceFolders.filter((e) => {
        return !changedFolders.removed.some((f) => {
            return f.uri === e.uri;
        });
    });
    workspaceFolders = workspaceFolders
        .filter((e) => {
        return !changedFolders.added.some((f) => {
            return f.uri === e.uri;
        });
    })
        .concat(changedFolders.added);
    return workspaceFolders;
};
//# sourceMappingURL=paths.js.map