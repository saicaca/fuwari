export function pathsEqual(path1: string, path2: string) {
    const normalizedPath1 = path1.replace(/^\/|\/$/g, '').toLowerCase();
    const normalizedPath2 = path2.replace(/^\/|\/$/g, '').toLowerCase();
    return normalizedPath1 === normalizedPath2;
}
