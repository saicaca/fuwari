import type { Path, __String, SourceFile, TypeChecker, Symbol, SymbolFlags } from "typescript/lib/tsserverlibrary";
export declare const enum ExportKind {
    Named = 0,
    Default = 1,
    ExportEquals = 2,
    UMD = 3
}
export interface SymbolExportInfo {
    readonly symbol: Symbol;
    readonly moduleSymbol: Symbol;
    /** Set if `moduleSymbol` is an external module, not an ambient module */
    moduleFileName: string | undefined;
    exportKind: ExportKind;
    targetFlags: SymbolFlags;
    /** True if export was only found via the package.json AutoImportProvider (for telemetry). */
    isFromPackageJson: boolean;
}
export interface ExportInfoMap {
    isUsableByFile(importingFile: Path): boolean;
    clear(): void;
    add(importingFile: Path, symbol: Symbol, key: __String, moduleSymbol: Symbol, moduleFile: SourceFile | undefined, exportKind: ExportKind, isFromPackageJson: boolean, checker: TypeChecker): void;
    get(importingFile: Path, key: string): readonly SymbolExportInfo[] | undefined;
    search<T>(importingFile: Path, preferCapitalized: boolean, matches: (name: string, targetFlags: SymbolFlags) => boolean, action: (info: readonly SymbolExportInfo[], symbolName: string, isFromAmbientModule: boolean, key: string) => T | undefined): T | undefined;
    releaseSymbols(): void;
    isEmpty(): boolean;
    /** @returns Whether the change resulted in the cache being cleared */
    onFileChanged(oldSourceFile: SourceFile, newSourceFile: SourceFile, typeAcquisitionEnabled: boolean): boolean;
}
