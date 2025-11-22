import ts from 'typescript';

export interface SvelteCompiledToTsx {
    code: string;
    map: import("magic-string").SourceMap;
    exportedNames: IExportedNames;
    /**
     * @deprecated Use TypeScript's `TypeChecker` to get the type information instead. This only covers literal typings.
     */
    events: ComponentEvents;
}

export interface IExportedNames {
    has(name: string): boolean;
}

/**
 * @deprecated Use TypeScript's `TypeChecker` to get the type information instead. This only covers literal typings.
 */
export interface ComponentEvents {
    getAll(): { name: string; type: string; doc?: string }[];
}

export function svelte2tsx(
    svelte: string,
    options?: {
        /**
         * Path of the file
         */
        filename?: string;
        /**
         * If the given file uses TypeScript inside script.
         * This cannot be inferred from `svelte2tsx` by looking
         * at the attributes of the script tag because the
         * user may have set a default-language through
         * `svelte-preprocess`.
         */
        isTsFile?: boolean;
        /**
         * Whether to try emitting result when there's a syntax error in the template
         */
        emitOnTemplateError?: boolean;
        /**
         * The namespace option from svelte config
         * see https://svelte.dev/docs#svelte_compile for more info
         */
        namespace?: string;
        /**
         * When setting this to 'dts', all ts/js code and the template code will be thrown out.
         * Only the `code` property will be set on the returned element.
         * Use this as an intermediate step to generate type definitions from a component.
         * It is expected to pass the result to TypeScript which should handle emitting the d.ts files.
         * The shims need to be provided by the user ambient-style,
         * for example through `filenames.push(require.resolve('svelte2tsx/svelte-shims.d.ts'))`.
         * If you pass 'ts', it uses the regular Svelte->TS/JS transformation.
         * 
         * @default 'ts'
         */
        mode?: 'ts' | 'dts',
        /**
         * Tells svelte2tsx from which namespace some specific functions to use.
         * 
         * Example: 'svelteHTML' -> svelteHTML.createElement<..>(..)
         * 
         * A namespace needs to implement the following functions:
         * - `createElement(str: string, validAttributes: ..): Element`
         * - `mapElementTag<Key extends keyof YourElements>(str: Key): YourElements[Key]`
         * 
         * @default 'svelteHTML'
         */
        typingsNamespace?: string;
        /**
         * The accessor option from svelte config. 
         * Would be overridden by the same config in the svelte:option element if exist
         * see https://svelte.dev/docs#svelte_compile for more info
         */
        accessors?: boolean
        /**
         * The Svelte parser to use. Defaults to the one bundled with `svelte2tsx`.
         */
        parse?: typeof import('svelte/compiler').parse;
        /**
         * The VERSION from 'svelte/compiler'. Defaults to the one bundled with `svelte2tsx`.
         * Transpiled output may vary between versions.
         */
        version?: string;
    }
): SvelteCompiledToTsx

export interface EmitDtsConfig {
    /**
     * Where to output the declaration files
     */
    declarationDir: string;
    /**
     * Path to `svelte-shims.d.ts` of `svelte2tsx`.
     * Example: `require.resolve('svelte2tsx/svelte-shims.d.ts')`
     * 
     * If a path is given that points to `svelte-shims-v4.d.ts`,
     * the `SvelteComponent` import is used instead of
     * `SvelteComponentTyped` which is deprecated in Svelte v4.
     */
    svelteShimsPath: string;
    /**
     * If you want to emit types only for part of your project,
     * then set this to the folder for which the types should be emitted.
     * Most of the time you don't need this. For SvelteKit, this is for example
     * set to `src/lib` by default.
     */
    libRoot?: string;
    /**
     * Name of your tsconfig file, if it's not the standard `tsconfig.json` or `jsconfig.json` 
     */
    tsconfig?: string;
}

// to make typo fix non-breaking, continue to export the old name but mark it as deprecated
/**@deprecated*/
export interface EmitDtsConig extends EmitDtsConfig {}

/**
 * Searches for a jsconfig or tsconfig starting at `root` and emits d.ts files
 * into `declarationDir` using the ambient file from `svelteShimsPath`.
 * Note: Handwritten `d.ts` files are not copied over; TypeScript does not
 * touch these files.
 */
export function emitDts(config: EmitDtsConfig): Promise<void>;


/**
 * ## Internal, do not use! This is subject to change at any time.
 *
 * Implementation notice: If one of the methods use a TypeScript function which is not from the
 * static top level `ts` namespace, it must be passed as a parameter.
 */
export const internalHelpers: {
    get_global_types: (
        tsSystem: ts.System,
        isSvelte3: boolean,
        sveltePath: string,
        typesPath: string,
        hiddenFolderPath?: string,
    ) => string[],
    isKitFile: (
        fileName: string,
        options: InternalHelpers.KitFilesSettings
    ) => boolean;
    isKitRouteFile: (basename: string) => boolean,
    isHooksFile: (
        fileName: string,
        basename: string,
        hooksPath: string
    ) => boolean,
    isParamsFile: (fileName: string, basename: string, paramsPath: string) =>boolean,
    upsertKitFile: (
        _ts: typeof ts,
        fileName: string,
        kitFilesSettings: InternalHelpers.KitFilesSettings,
        getSource: () => ts.SourceFile | undefined,
        surround?: (code: string) => string
    ) => { text: string; addedCode: InternalHelpers.AddedCode[] } | undefined,
    toVirtualPos: (pos: number, addedCode: InternalHelpers.AddedCode[]) => number,
    toOriginalPos: (pos: number, addedCode: InternalHelpers.AddedCode[]) => {pos: number; inGenerated: boolean},
    findExports: (_ts: typeof ts, source: ts.SourceFile, isTsFile: boolean) => Map<
        string,
        | {
            type: 'function';
            node: ts.FunctionDeclaration | ts.ArrowFunction | ts.FunctionExpression;
            hasTypeDefinition: boolean;
        }
        | {
            type: 'var';
            node: ts.VariableDeclaration;
            hasTypeDefinition: boolean;
        }
    >,
	renderName: string
};

/**
 * ## Internal, do not use! This is subject to change at any time.
 */
export namespace InternalHelpers {
    export interface AddedCode {
        generatedPos: number;
        originalPos: number;
        length: number;
        total: number;
        inserted: string;
    }

    export interface KitFilesSettings {
        serverHooksPath: string;
        clientHooksPath: string;
        universalHooksPath: string;
        paramsPath: string;
    }
}