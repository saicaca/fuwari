import { match } from 'path-to-regexp';
import type { Path, MatchFunction } from 'path-to-regexp';
export { type Path };
type Params = Parameters<typeof match>;
/** Create a match function from a path pattern that checks if a URLs matches it. */
export declare const matchPath: <P extends object = object>(path: Params[0], options?: Params[1]) => MatchFunction<P>;
//# sourceMappingURL=matchPath.d.ts.map