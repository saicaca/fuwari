import { ZodTypeAny } from 'zod';
import ts from 'typescript';

type ZodToTsOptions = {
    /** @deprecated use `nativeEnums` instead */
    resolveNativeEnums?: boolean;
    nativeEnums?: 'identifier' | 'resolve' | 'union';
};
declare const resolveOptions: (raw?: ZodToTsOptions) => {
    resolveNativeEnums?: boolean | undefined;
    nativeEnums: 'identifier' | 'resolve' | 'union';
};
type ResolvedZodToTsOptions = ReturnType<typeof resolveOptions>;
type ZodToTsStore = {
    nativeEnums: ts.EnumDeclaration[];
};
type ZodToTsReturn = {
    node: ts.TypeNode;
    store: ZodToTsStore;
};
type GetTypeFunction = (typescript: typeof ts, identifier: string, options: ResolvedZodToTsOptions) => ts.Identifier | ts.TypeNode;
type GetType = {
    _def: {
        getType?: GetTypeFunction;
    };
};

declare const createTypeAlias: (node: ts.TypeNode, identifier: string, comment?: string) => ts.TypeAliasDeclaration;
declare const printNode: (node: ts.Node, printerOptions?: ts.PrinterOptions) => string;
declare const withGetType: <T extends ZodTypeAny & GetType>(schema: T, getType: GetTypeFunction) => T;

declare const zodToTs: (zod: ZodTypeAny, identifier?: string, options?: ZodToTsOptions) => ZodToTsReturn;

export { GetType, ZodToTsOptions, createTypeAlias, printNode, withGetType, zodToTs };
