---
title: React 源码浅析之 - ReactElement
category: 技术
published: 2017-09-21 00:27:33
tags:
  - React
  - SourceCode
---

## ReactElement

这个模块定义了 React 元素的行为和方法，首先看 ReactElement 函数：

### ReactElement

```js
var ReactElement = function (type, key, ref, self, source, owner, props) {
  var element = {
    // This tag allow us to uniquely identify this as a React Element
    $$typeof: REACT_ELEMENT_TYPE,

    // Built-in properties that belong on the element
    type: type,
    key: key,
    ref: ref,
    props: props,

    // Record the component responsible for creating this element.
    _owner: owner,
  }

  if (__DEV__) {
    // The validation flag is currently mutative. We put it on
    // an external backing store so that we can freeze the whole object.
    // This can be replaced with a WeakMap once they are implemented in
    // commonly used development environments.
    element._store = {}

    // To make comparing ReactElements easier for testing purposes, we make
    // the validation flag non-enumerable (where possible, which should
    // include every environment we run tests in), so the test framework
    // ignores it.
    Object.defineProperty(element._store, "validated", {
      configurable: false,
      enumerable: false,
      writable: true,
      value: false,
    })
    // self and source are DEV only properties.
    Object.defineProperty(element, "_self", {
      configurable: false,
      enumerable: false,
      writable: false,
      value: self,
    })
    // Two elements created in two different places should be considered
    // equal for testing purposes and therefore we hide it from enumeration.
    Object.defineProperty(element, "_source", {
      configurable: false,
      enumerable: false,
      writable: false,
      value: source,
    })
    if (Object.freeze) {
      Object.freeze(element.props)
      Object.freeze(element)
    }
  }

  return element
}
```

抛去其中 DEV 里面的内容，其他部分很简单，定义了一个 React 元素应有属性。包括： type, key, ref, self, source, owner, props.

<!-- more -->

还有一个 `$$typeof` 属性，是一个常量，用来判断这个对象是不是一个 React 元素。

```js
var REACT_ELEMENT_TYPE =
  (typeof Symbol === "function" && Symbol.for && Symbol.for("react.element")) ||
  0xeac7
```

### ReactElement.createElement

```js
ReactElement.createElement = function (type, config, children) {
  var propName

  // Reserved names are extracted
  var props = {}

  var key = null
  var ref = null
  var self = null
  var source = null

  if (config != null) {
    // ref 和 key 都属于保留 props key 值，所以这里需要做判断
    if (hasValidRef(config)) {
      ref = config.ref
    }
    if (hasValidKey(config)) {
      key = "" + config.key
    }
    // __self 和 __source 这两个属性目前没有看到他们的作用，先放着
    self = config.__self === undefined ? null : config.__self
    source = config.__source === undefined ? null : config.__source
    // Remaining properties are added to a new props object
    // 其他的属性添加到新的 props 对象上，同时需要排除掉保留字段 RESERVED_PROPS
    // var RESERVED_PROPS = {key: true, ref: true, __self: true, __source: true,};
    for (propName in config) {
      if (
        hasOwnProperty.call(config, propName) &&
        !RESERVED_PROPS.hasOwnProperty(propName)
      ) {
        props[propName] = config[propName]
      }
    }
  }

  // Children 可以传递一个以上的参数，这些 children 参数都会作为新分配的 props 的属性
  var childrenLength = arguments.length - 2
  if (childrenLength === 1) {
    props.children = children
  } else if (childrenLength > 1) {
    var childArray = Array(childrenLength)
    for (var i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2]
    }
    if (__DEV__) {
      if (Object.freeze) {
        Object.freeze(childArray)
      }
    }
    props.children = childArray
  }

  // 设置 defaultProps 属性
  if (type && type.defaultProps) {
    var defaultProps = type.defaultProps
    for (propName in defaultProps) {
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName]
      }
    }
  }
  // 开发环境下，如果使用了保留字段 key 和 ref ，那么进行控制台报错提醒
  if (__DEV__) {
    if (key || ref) {
      if (
        typeof props.$$typeof === "undefined" ||
        props.$$typeof !== REACT_ELEMENT_TYPE
      ) {
        var displayName =
          typeof type === "function"
            ? type.displayName || type.name || "Unknown"
            : type
        if (key) {
          defineKeyPropWarningGetter(props, displayName)
        }
        if (ref) {
          defineRefPropWarningGetter(props, displayName)
        }
      }
    }
  }
  // 返回一个 React 元素， ReactCurrentOwner.current 是指当前正处于构建过程中的组件，这里默认是 null
  return ReactElement(
    type,
    key,
    ref,
    self,
    source,
    ReactCurrentOwner.current,
    props
  )
}
```

用给定的参数来创建一个 React 元素，需要注意的是 `ref` 和 `key` 属于保留字段，不能作为 props 的属性传递。

### ReactElement.createFactory

一个简单的工厂函数，用来方便的创建同类型的组件。

```js
ReactElement.createFactory = function (type) {
  var factory = ReactElement.createElement.bind(null, type)
  // Expose the type on the factory and the prototype so that it can be
  // easily accessed on elements. E.g. `<Foo />.type === Foo`.
  // This should not be named `constructor` since this may not be the function
  // that created the element, and it may not even be a constructor.
  // Legacy hook TODO: Warn if this is accessed
  factory.type = type
  return factory
}
```

### ReactElement.cloneAndReplaceKey

这个 API 没用过，可以用来替换一个 React 元素的保留属性： key 值。

```js
ReactElement.cloneAndReplaceKey = function (oldElement, newKey) {
  var newElement = ReactElement(
    oldElement.type,
    newKey,
    oldElement.ref,
    oldElement._self,
    oldElement._source,
    oldElement._owner,
    oldElement.props
  )

  return newElement
}
```

### ReactElement.cloneElement

cloneElement 方法和 createElement 基本一样，只是前者是通过现有的 React 元素来复制一个新的元素出来。

### ReactElement.isValidElement

用来判断一个对象是不是一个合法的 React 元素。

```js
ReactElement.isValidElement = function (object) {
  return (
    typeof object === "object" &&
    object !== null &&
    object.$$typeof === REACT_ELEMENT_TYPE
  )
}
```

用到了上面一开始定义的 $$typeof 属性。

### export

```js
module.exports = ReactElement
```

ReactElement 模块就是这么些东西了，主要定义了一个 React 元素应有的属性，以及操作元素的一些方法。

# 相关文章

- {% post_link react-source-code-analyze-1 React 源码浅析之 - 入口文件 %}
- {% post_link react-source-code-analyze-2 React 源码浅析之 - ReactBaseClasses %}
- {% post_link react-source-code-analyze-3 React 源码浅析之 - ReactChildren %}
- {% post_link react-source-code-analyze-4 React 源码浅析之 - ReactElement %}
- {% post_link react-source-code-analyze-5 React 源码浅析之 - onlyChildren %}
