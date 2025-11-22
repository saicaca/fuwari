# 2.0.0-alpha.3 (2021-07-31)
  * **Breaking change**: Requires [`Object.is`](https://caniuse.com/mdn-javascript_builtins_object_is) or polyfill

# 2.0.0-alpha.1 (2020-03-30)
  * **Breaking change**: Requires Node 10.x
  * migrate toolchain: TypeScript, prettier, eslint, jest, rollup
  * export TypeScript types and esm export
  * add support for `Map`, `Set`, negative zero, sparse arrays
  * serialize numeric object keys as numbers (e.g. `{'1':2}` becomes `{1:2}`)

# 1.0.0 (2015-09-03)

  * added changelog
  * fixed RegExp escaping of `/` on node 0.10
  * added [standard](https://github.com/feross/standard) for code style/eslint

# v0.1.3 (2014-10-08)

  * use toString for functions

# v0.1.2 (2014-05-14)

  * fixes circular reference bug

# v0.1.1 (2011-04-24)

  * initial release
