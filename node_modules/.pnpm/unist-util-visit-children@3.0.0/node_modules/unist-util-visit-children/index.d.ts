export { visitChildren } from "./lib/index.js";
export type Visitor<Kind extends import("unist").Parent> = import('./lib/index.js').Visitor<Kind>;
export type Visit<Kind extends import("unist").Parent> = import('./lib/index.js').Visit<Kind>;
