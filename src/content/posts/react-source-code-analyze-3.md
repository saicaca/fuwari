---
title: React 源码浅析之 - ReactChildren
category: 技术
published: 2017-09-21 00:19:09
tags:
  - React
  - SourceCode
---

# 引入的模块

```js
var ReactElement = require("ReactElement")

var emptyFunction = require("fbjs/lib/emptyFunction")
var invariant = require("fbjs/lib/invariant")
```

我们来看一下 ReactElement 模块，其他两个都是工具函数，不用关心。

# Export 的对象

```js
var ReactChildren = {
  forEach: forEachChildren,
  map: mapChildren,
  count: countChildren,
  toArray: toArray,
}

module.exports = ReactChildren
```

依次来看一下这个四个 API

## forEach

```js
function forEachChildren(children, forEachFunc, forEachContext) {
  if (children == null) {
    return children
  }
  var traverseContext = getPooledTraverseContext(
    null,
    null,
    forEachFunc,
    forEachContext
  )
  traverseAllChildren(children, forEachSingleChild, traverseContext)
  releaseTraverseContext(traverseContext)
}
```

入参： children, forEachFunc, forEachContext.
首先通过 `getPooledTraverseContext` 拿到一个遍历的上下文对象 `traverseContext`，然后调用 traverseAllChildren 方法来遍历所有传入 children 的后代节点。
最后释放当前的 `traverseContext`.

<!-- more -->

### getPooledTraverseContext

```js
var POOL_SIZE = 10
var traverseContextPool = []
function getPooledTraverseContext(
  mapResult,
  keyPrefix,
  mapFunction,
  mapContext
) {
  if (traverseContextPool.length) {
    var traverseContext = traverseContextPool.pop()
    traverseContext.result = mapResult
    traverseContext.keyPrefix = keyPrefix
    traverseContext.func = mapFunction
    traverseContext.context = mapContext
    traverseContext.count = 0
    return traverseContext
  } else {
    return {
      result: mapResult,
      keyPrefix: keyPrefix,
      func: mapFunction,
      context: mapContext,
      count: 0,
    }
  }
}
```

定义了一个 `traverseContextPool` 以避免每次重新创建新对象的成本，大小为 10. `getPooledTraverseContext` 方法接收四个参数，mapResult, keyPrefix, mapFunction, mapContext.
然后赋值到 traverseContext 上，除此之外还添加了一个计数器属性 count.

### traverseAllChildren

```js
function traverseAllChildren(children, callback, traverseContext) {
  if (children == null) {
    return 0;
  }

  return traverseAllChildrenImpl(children, '', callback, traverseContext);
}
 
`traverseAllChildren` 只是个空壳，里面的 `traverseAllChildrenImpl` 才是真正的实现。
** traverseAllChildrenImpl **

function traverseAllChildrenImpl(
  children,
  nameSoFar,
  callback,
  traverseContext,
) {
  var type = typeof children;

  if (type === 'undefined' || type === 'boolean') {
    // All of the above are perceived as null.
    children = null;
  }

  if (
    children === null ||
    type === 'string' ||
    type === 'number' ||
    // The following is inlined from ReactElement. This means we can optimize
    // some checks. React Fiber also inlines this logic for similar purposes.
    (type === 'object' && children.$$typeof === REACT_ELEMENT_TYPE)
  ) {
    callback(
      traverseContext,
      children,
      // If it's the only child, treat the name as if it was wrapped in an array
      // so that it's consistent if the number of children grows.
      nameSoFar === '' ? SEPARATOR + getComponentKey(children, 0) : nameSoFar,
    );
    return 1;
  }
```

接收四个参数，首先判断 children 参数的 type ，不合法都认为 children 是 null.
紧接着的一堆判断，就是说当 children 是单个合法 React 元素的时候，执行 callback 函数，并返回 1，因为后面会递归的调用当前这个函数，所以这里也是递归调用的出口。

```js
var child;
var nextName;
var subtreeCount = 0; // Count of children found in the current subtree.
var nextNamePrefix = nameSoFar === '' ? SEPARATOR : nameSoFar + SUBSEPARATOR;

if (Array.isArray(children)) {
  for (var i = 0; i < children.length; i++) {
    child = children[i];
    nextName = nextNamePrefix + getComponentKey(child, i);
    subtreeCount += traverseAllChildrenImpl(
      child,
      nextName,
      callback,
      traverseContext,
    );
  }
} else {
```

当传入的 children 是一个 `Array` 的时候，遍历这个 Children Array ， 并对里面的每个元素调用当前的函数 `traverseAllChildrenImpl`.
传入的参数中需要注意， nextName 用来给要遍历的 React 元素添加 key 值，callback 和 `traverseContext` 和当前函数的值都是一样的，保证了每个子元素也能应用当前的 callback 且能访问到原始的 `traverseContext`.

```js
} else {
  var iteratorFn =
    (ITERATOR_SYMBOL && children[ITERATOR_SYMBOL]) ||
    children[FAUX_ITERATOR_SYMBOL];
  if (typeof iteratorFn === 'function') {
    if (__DEV__) {
      // Warn about using Maps as children
      if (iteratorFn === children.entries) {
        warning(
          didWarnAboutMaps,
          'Using Maps as children is unsupported and will likely yield ' +
            'unexpected results. Convert it to a sequence/iterable of keyed ' +
            'ReactElements instead.%s',
          getStackAddendum(),
        );
        didWarnAboutMaps = true;
      }
    }

    var iterator = iteratorFn.call(children);
    var step;
    var ii = 0;
    while (!(step = iterator.next()).done) {
      child = step.value;
      nextName = nextNamePrefix + getComponentKey(child, ii++);
      subtreeCount += traverseAllChildrenImpl(
        child,
        nextName,
        callback,
        traverseContext,
      );
    }
  } else if (type === 'object') {
    var addendum = '';
    if (__DEV__) {
      addendum =
        ' If you meant to render a collection of children, use an array ' +
        'instead.' +
        getStackAddendum();
    }
    var childrenString = '' + children;
    invariant(
      false,
      'Objects are not valid as a React child (found: %s).%s',
      childrenString === '[object Object]'
        ? 'object with keys {' + Object.keys(children).join(', ') + '}'
        : childrenString,
      addendum,
    );
  }
}
```

当不是 Array 但是一个可迭代的对象的时候，和上面一样，递归调用 traverseAllChildrenImpl 方法。
对于其他情况，认为 child 不合法，进行报错。

```js
  return subtreeCount;
}
```

最后返回所有后代元素的数量。
整体上来看 `traverseAllChildrenImpl` 方法的作用就是，遍历给定 children 的所有后代元素，在每个后代元素上调用 callback 方法，并给每个元素分配一个当前上下文下唯一的 key 值作为参数要传入的参数。

回到 forEach 方法：

```js
traverseAllChildren(children, forEachSingleChild, traverseContext)
```

这一句就是说遍历给定 children 的所有后代元素，并给它们调用 forEachSingleChild 方法。

```js
function forEachSingleChild(bookKeeping, child, name) {
  var { func, context } = bookKeeping
  func.call(context, child, bookKeeping.count++)
}
```

这个传入的 callback 方法 `forEachSingleChild` 就是从入参 bookKeeping 也就是 `traverseContext` 中拿到 `func` 和 context，把 context 作为 `func` 的上下文， child 和计数器 count 作为参数进行调用。这里的 `func` 就是 `forEachChildren` 的入参 `forEachFunc`，也就是需用最终用户提供的函数。

```js
releaseTraverseContext(traverseContext)
```

释放当前的 `traverseContext` 也就是把 `traverseContext` 的属性都置为 `null` 并放入 `traverseContextPool` 中供后续使用，提高使用效率。

```js
function releaseTraverseContext(traverseContext) {
  traverseContext.result = null
  traverseContext.keyPrefix = null
  traverseContext.func = null
  traverseContext.context = null
  traverseContext.count = 0
  if (traverseContextPool.length < POOL_SIZE) {
    traverseContextPool.push(traverseContext)
  }
}
```

## map

```js
function mapChildren(children, func, context) {
  if (children == null) {
    return children
  }
  var result = []
  mapIntoWithKeyPrefixInternal(children, result, null, func, context)
  return result
}
```

给传入 children 的后代元素调用 func 并返回调用 func 的结果集合。

### mapIntoWithKeyPrefixInternal

```js
function mapIntoWithKeyPrefixInternal(children, array, prefix, func, context) {
  var escapedPrefix = ""
  if (prefix != null) {
    escapedPrefix = escapeUserProvidedKey(prefix) + "/"
  }
  var traverseContext = getPooledTraverseContext(
    array,
    escapedPrefix,
    func,
    context
  )
  traverseAllChildren(children, mapSingleChildIntoContext, traverseContext)
  releaseTraverseContext(traverseContext)
}
```

首先，如果传入了 prefix ，那么转义 prefix 作为 `traverseContext` 的 prefix key.
然后拿到一个 `traverseContext` 对象，接着和 `forEachChildren` 一样，遍历所有 children 的后代元素并执行给定的 callback 函数，最后对 `traverseContext` 进行释放。

唯一的不同就是这个 callback 方法：`mapSingleChildIntoContext` .

### mapSingleChildIntoContext

```js
function mapSingleChildIntoContext(bookKeeping, child, childKey) {
  var { result, keyPrefix, func, context } = bookKeeping

  var mappedChild = func.call(context, child, bookKeeping.count++)
  if (Array.isArray(mappedChild)) {
    mapIntoWithKeyPrefixInternal(
      mappedChild,
      result,
      childKey,
      emptyFunction.thatReturnsArgument
    )
  } else if (mappedChild != null) {
    if (ReactElement.isValidElement(mappedChild)) {
      mappedChild = ReactElement.cloneAndReplaceKey(
        mappedChild,
        // Keep both the (mapped) and old keys if they differ, just as
        // traverseAllChildren used to do for objects as children
        keyPrefix +
          (mappedChild.key && (!child || child.key !== mappedChild.key)
            ? escapeUserProvidedKey(mappedChild.key) + "/"
            : "") +
          childKey
      )
    }
    result.push(mappedChild)
  }
}
```

这个方法和上面的 `forEachSingleChildren` 很像。从 bookKeeping 上拿到 result , keyPrefix, func, context.
Result 其实就是 `mapChildren` 里面一开始定义的空数组， keyPrefix 就是 `mapIntoWithKeyPrefixInternal` 里面 escapedPrefix ， func 和 context 都是 `mapChildren` 对应的入参。

首先定义 `mappedChild` 为用户传入的 `mapFunc` 函数调用的返回值，然后判断这个返回值 `mappedChild` 是不是一个 `Array`.
如果是，那么循环调用 `mapIntoWithKeyPrefixInternal` 方法；否则在不为 `null` 的情况且是一个合法 React 元素的时候，用一个通过 keyPrefix , 用户分配的 key 即 `mappedChild.key` 和原有的 childkey 组成新 key 值的 `mappedChild` 的克隆元素作为 map 的结果，push 到 result 中。

整个 `mapChildren` 方法，就是对提供的 children 的每个后代元素调用 `mapFunc` 方法，给返回的结果设置新的 key ，最后把每一个执行的结果 `mappedChild` 放入到一个列表中返回给用户。

### countChildren

```js
function countChildren(children, context) {
  return traverseAllChildren(children, emptyFunction.thatReturnsNull, null)
}
```

这个就很简单了，只是通过遍历返回所有后代节点的个数。
`emptyFunction.thatReturnsNull`
就是一个返回为 null 的函数。

### toArray

```js
function toArray(children) {
  var result = []
  mapIntoWithKeyPrefixInternal(
    children,
    result,
    null,
    emptyFunction.thatReturnsArgument
  )
  return result
}
```

理解了上面的 mapIntoWithKeyPrefixInternal ，那么这里也很简单了。
emptyFunction.thatReturnsArgument, 是一个函数，会返回它的第一个参数。

** mapSingleChildIntoContext **

```js
var mappedChild = func.call(context, child, bookKeeping.count++)
```

那么这句也就是返回 child 本身了。并将结果放入到 result 里面, 最后把所有的 result 返回给调用方。

# 总结

ReactChildren 有四个 API ，而这四个 API 主要依赖与两个方法，`traverseAllChildrenImpl` 和 `mapSingleChildIntoContext` 其他方法都是在此之上的组合调用。
还有一个值得注意的地方，就是用到对象池 `traverseContextPool` 。个人认为是因为在这里经常会递归调用而频繁的需要新建 `traverseContext` 对象，而每次都重新新建对象需要在堆里面重新分配内存，成本比较高，所以引入了对象池，以提高性能。

# 相关文章

- {% post_link react-source-code-analyze-1 React 源码浅析之 - 入口文件 %}
- {% post_link react-source-code-analyze-2 React 源码浅析之 - ReactBaseClasses %}
- {% post_link react-source-code-analyze-3 React 源码浅析之 - ReactChildren %}
- {% post_link react-source-code-analyze-4 React 源码浅析之 - ReactElement %}
- {% post_link react-source-code-analyze-5 React 源码浅析之 - onlyChildren %}
