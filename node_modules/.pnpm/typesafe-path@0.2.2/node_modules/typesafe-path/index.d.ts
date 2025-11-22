declare const OsPathSymbol: unique symbol;
declare const PosixPathSymbol: unique symbol;
declare const Win32PathSymbol: unique symbol;

type _PlatformPath<PlatformPath, TArg, TReturn> = {
    [K in keyof PlatformPath]: PlatformPath[K] extends (...args: any) => any ? (
        Parameters<PlatformPath[K]> extends [string] ? (path: TArg) => _ReturnType<PlatformPath[K], TReturn>
        : Parameters<PlatformPath[K]> extends [string, string] ? (from: TArg, to: TArg) => _ReturnType<PlatformPath[K], TReturn>
        : Parameters<PlatformPath[K]> extends string[] ? (...paths: TArg[]) => _ReturnType<PlatformPath[K], TReturn>
        // basename
        : PlatformPath[K] extends (path: string, ext?: string) => string ? (path: TArg, ext?: string) => TReturn
        : PlatformPath[K]
    ) : PlatformPath[K]
};
type _ReturnType<T extends (...args: any) => any, T2> = ReturnType<T> extends string ? T2 : ReturnType<T>;

declare module 'typesafe-path' {

    namespace path {
        type OsPath = string & { [OsPathSymbol]: true; };
        type PosixPath = string & { [PosixPathSymbol]: true; };
        type Win32Path = string & { [Win32PathSymbol]: true; };
    }

    const path: Omit<_PlatformPath<import('path').PlatformPath, path.OsPath | path.PosixPath, path.OsPath>, 'win32' | 'posix'>;

    export = path;
}

declare module 'typesafe-path/win32' {

    namespace path {
        type OsPath = string & { [OsPathSymbol]: true; };
        type PosixPath = string & { [PosixPathSymbol]: true; };
        type Win32Path = string & { [Win32PathSymbol]: true; };
    }

    const path: _PlatformPath<import('path').PlatformPath, string, path.Win32Path>;

    export = path;
}

declare module 'typesafe-path/posix' {

    namespace path {
        type OsPath = string & { [OsPathSymbol]: true; };
        type PosixPath = string & { [PosixPathSymbol]: true; };
        type Win32Path = string & { [Win32PathSymbol]: true; };
    }

    const path: _PlatformPath<import('path').PlatformPath, path.PosixPath, path.PosixPath>;

    export = path;
}
