export {modifyChildren} from './lib/index.js'
export type Modifier<Kind extends import('unist').Parent> =
  import('./lib/index.js').Modifier<Kind>
export type Modify<Kind extends import('unist').Parent> =
  import('./lib/index.js').Modify<Kind>
