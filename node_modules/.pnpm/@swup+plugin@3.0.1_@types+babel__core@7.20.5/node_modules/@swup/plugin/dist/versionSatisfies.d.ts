export declare const normalizeVersion: (version: string) => string;
export declare const compareVersion: (a: string, b: string) => number;
/**
 * Check if a version satisfies all given version requirements
 *
 * versionSatisfies('2.1.0', ['>=2', '<4']) // true
 * versionSatisfies('2.1.0', ['5']) // false
 *
 * @param {string} installed Installed version
 * @param {Array.<string>} requirements Array of requirements that must be satisfied
 * @returns boolean
 */
export declare const versionSatisfies: (installed: string, requirements: string[]) => boolean;
