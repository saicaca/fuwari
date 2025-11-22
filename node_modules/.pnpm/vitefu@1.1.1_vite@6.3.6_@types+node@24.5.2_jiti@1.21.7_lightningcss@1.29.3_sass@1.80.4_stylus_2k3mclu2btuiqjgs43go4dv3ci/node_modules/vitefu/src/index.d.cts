// CJS types like `index.d.ts` but dumbed down and doesn't import from `vite`. Thanks TypeScript.

export interface CrawlFrameworkPkgsOptions {
  root: string
  isBuild: boolean
  workspaceRoot?: string
  viteUserConfig?: any
  isFrameworkPkgByJson?: (pkgJson: Record<string, any>) => boolean
  isFrameworkPkgByName?: (pkgName: string) => boolean | undefined
  isSemiFrameworkPkgByJson?: (pkgJson: Record<string, any>) => boolean
  isSemiFrameworkPkgByName?: (pkgName: string) => boolean | undefined
}

export interface CrawlFrameworkPkgsResult {
  optimizeDeps: {
    include: string[]
    exclude: string[]
  }
  ssr: {
    noExternal: string[]
    external: string[]
  }
}

export declare function crawlFrameworkPkgs(
  options: CrawlFrameworkPkgsOptions
): Promise<CrawlFrameworkPkgsResult>

export declare function findDepPkgJsonPath(
  dep: string,
  parent: string
): Promise<string | undefined>

export declare function findClosestPkgJsonPath(
  dir: string,
  predicate?: (pkgJsonPath: string) => boolean | Promise<boolean>
): Promise<string | undefined>

export declare function pkgNeedsOptimization(
  pkgJson: Record<string, any>,
  pkgJsonPath: string
): Promise<boolean>

export declare function isDepExcluded(
  dep: string,
  optimizeDepsExclude: any
): boolean

export declare function isDepIncluded(
  dep: string,
  optimizeDepsInclude: any
): boolean

export declare function isDepNoExternaled(
  dep: string,
  ssrNoExternal: any
): boolean

export declare function isDepExternaled(dep: string, ssrExternal: any): boolean
