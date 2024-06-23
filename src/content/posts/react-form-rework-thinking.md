---
title: 一个 React Form 组件的重构思路
category: 技术
published: 2017-03-18 05:31:31
tags:
  - React
  - Form
---

最近对团队内部 React 组件库（[**ne-rc**](https://github.com/NE-LOAN-FED/NE-Component)）中的 Form 组件进行了重构，记录一下思考的过程。

一些前置定义：

| 名词   | 定义                                              |
| ------ | ------------------------------------------------- |
| 表单   | Form 组件                                         |
| 子表单 | 嵌套在 Form 下面的类似 Input, Select 这样的子组件 |

首先我们看一下，我们的对 Form 组件的需求是什么。

1. 获取当前变动表单的状态
   - 校验所有必填表单是否填写完成
   - 对外触发具体表单变化的方法 `formFieldChange`
2. 暴露对外提供整个表单状态的方法
   - 提供整个表单最新状态的方法 $Form.data
3. 提交方法
   - 校验表单是否通过校验
   - 对外触发 `formSubmit` 方法

接着我们从重构前和重构后，看如何来解决这个问题。

# **Before**

## 获取当前变动表单的状态

### 如何获取变动的子表单

React 父子通信需要通过 prop 传递方法，对于 Form 下面的类似与 Input 之类的子表单的变化想要通知到父级，如果不借助第三方的事件传递方法，那么就只能通过由父级通过
props 向 Input 传递 `formFieldChange`（假设就叫这个名字）方法，然后当子组件变化时去调用 `formFieldChange` 来实现。

那么问题来了，什么时候去传递这个方法呢？

不能在具体页面里面使用的时候再去每条表单里面注册这个方法，那每个用到表单组件的时候就都需要给子表单进行这样的事件绑定，这样太累了。

所以一开始，我选择通过直接递归的遍历 Form 下面的 children，只要发现这个 children
是我想要的表单类型，那么就重新克隆一个带有 `formFieldChange` 的组件来替换掉原来的组件。

<!--more-->

```js
/**
 * 获取 form 下面每一个表单对象，注入属性，并收集起来
 * @param children
 * @returns {*}
 */
function getForms(children) {
  return React.Children.map(children, (el, i) => {
    if (!el) {
      return null
    }
    switch (el.type) {
      case Input:
        Forms.push(el)
        return React.cloneElement(el, {
          key: i,
          formFieldChange,
          emptyInput,
        })
      case Select:
        Forms.push(el)
        return React.cloneElement(el, {
          key: i,
          formFieldChange,
        })
      case CheckBox:
        Forms.push(el)
        return React.cloneElement(el, {
          key: i,
          formFieldChange,
        })
      default:
        if (el.props && el.props.children instanceof Array) {
          const children = getForms(el.props.children)
          return React.cloneElement(el, {
            key: i,
            children,
          })
        } else {
          return el
        }
    }
  })
}
```

这样，所有的特定子组件就都可以拿到被注册的方法。以 Input 为例，在 Input 的 `onChange` 方法里面去调用从父级 props
传入的 `formFieldChange` 就可以通知到 Form 组件了。

### 收集变动表单的数据。

前一步完成后，这一步就比较简单了，Input 在调用 `formFieldChange` 的时候把想要传递的数据作为参数传进去，在 Form
里面去对这个参数做处理，就可以拿到当前变动的表单状态数据了。

### 校验表单是否填写完成

前面我们收集了每一条变动表单的数据。但是要判断当前 Form
下面的表单是否填写完成，那么首先需要知道我们有多少个需要填写的表单，然后在 `formFieldChange` 的时候进行判断就可以了。如何来提前知道我们有多少需要填写的
Field 呢，之前我选择的是通过在使用 Form 的时候先初始化一个包含所有表单初始化状态的数据。

```js
export default class Form extends React.Component {
  constructor (props) {
    super(props)
    this.Forms = []
    this.formState = Object.assign({}, {
      isComplete: false,
      isValidate: false,
      errorMsg: '',
      data: {}
    }, this.props.formState)
  }

  static propTypes = {
    onChange: PropTypes.func,
    onSubmit: PropTypes.func,
    formState: PropTypes.object
  }
  // 初始化一个类似这样的对象传递给 Form
  formState: {
    data: {
      realName: {},
      cityId: {},
      email: {},
      relativeName: {},
      relativePhone: {},
      companyName: {}
    }
  }
}
```

这样就很粗暴的解决了这个问题，但是这中间存在很多问题。

因为限定了特定的组件类型（Input，Select，CheckBox），导致不利于扩展，如果在开发过程遇到其他类型的比如自定义的子表单，那么 Form
就没法对这个自定义子表单进行数据收集，解决起来比较麻烦。

所以就在考虑另一个种实现方式， Form 只去收集一个特定条件下的组件，只要这个组件满足了这个条件，并实现了对应的接口，那么 Form
就都可以去收集处理。这样也就大大挺高了适用性。

## 暴露对外提供整个表单状态的方法

通过在外监听每次 Form 触发的 `onChange` 事件来获取整个 Form 的状态。

## 提交方法

### 检验表单是否通过校验

已经有了整个 Form 的数据对象，做校验并不是什么困难。通过校验的时候调用 `formSubmit` 方法，没有通过校验的时候对外把错误信息添加到
Form 的 state 上去。

### 对外触发 formSubmit 方法

当表单通过校验的时候，对外触发 `formSubmit` 方法，把要提交的数据作为 `formSubmit` 的参数传递给外面。

# **After**

前面是之前写的 Form 组件的一些思路，在实际使用中也基本能满足业务需求。

但是整个 Form 的可拓展性比较差，无法很好的接入其他自定义的组件。所以萌生了重写的想法。

对于重写的这个 Form，我的想法是：首先一定要方便使用，不需要一大堆的起始工作；其次就是可拓展性要强，除了自己已经提供的内在
Input，Select 等能够接入 Form 外，对于其他的业务中的特殊需求需要接入 Form 的时候，只要这个组件实现了特定的接口就可以了很方便的接入，而不需要大量的去修改组件内部的代码。

重构主要集中在上面需求 1 里面的内容，也就是：**获取当前变动表单的状态**

获取当前表单的状态分解下来有一下几点：

- 获取所有需要收集的子表单 `formFields`
- 初始化 Form `state`
- 表单下面子表单数量或类型发生变化时更新 1 里面创建的 `formFields`
- 子表单内部状态发生变化时通知到父表单

## 获取当前变动表单的状态

### 获取所有需要的子表单

同样通过递归遍历 children 来获取需要收集的子表单，通过子表单的 type.name 命名规则是否符合我们的定义来决定是否要进行收集。
直接来看代码：

```js
collectFormField = (children) => {
  const handleFieldChange = this.handleFieldChange

  // 简单粗暴，在 Form 更新的时候直接清空上一次保存的 formFields，全量更新，
  // 避免 formFields 内容或者数量发生变化时 this.formFields 数据不正确的问题
  const FormFields = (this.formFields = [])

  function getChildList(children) {
    return React.Children.map(children, (el, i) => {
      // 只要 Name 以 _Field 开头，就认为是需要 From 管理的组件
      if (!el || el === null) return null

      const reg = /^_Field/
      const childName = el.type && el.type.name
      if (reg.test(childName)) {
        FormFields.push(el)
        return React.cloneElement(el, {
          key: i,
          handleFieldChange,
        })
      } else {
        if (el.props && el.props.children) {
          const children = getChildList(el.props.children)
          return React.cloneElement(el, {
            key: i,
            children,
          })
        } else {
          return el
        }
      }
    })
  }
}
```

只要组件的 class name 以 \_Field 开头，就把它收集起来，并传入 `handleFieldChange` 方法，这样当一个自定义组件接入的时候，只需要在外面包一层，并把
class 的命名为以 \_Field 开头的格式就可以被 Form 收集管理了。

接入组件里面需要做的就是，在合适的时机调用 `handleFieldChange` 方法，并把要传递的数据作为参数传递出来就可以了。

为什么一定要执迷不悟的使用遍历这种低效的方式去收集呢，其实都是为了组件上使用的方便。这样就不需要每次在引用的时候在对子表单做什么操作了。

### 初始化 Form state

上一步拿到了所有的子表单，然后通过调用 `initialFormDataStructure` 拿来初始化 Form 的 `state.data` 的结构，同时通知到外面
Form 发生了变化。

### 子表单数量或类型发生变化时

当 Form 下面子组件被添加或删除时，需要及时更新 Form Data 的结构。通过调用 `updateFormDataStructure`
把新增的或者修改的子表单更新到最新，并通知到外面 Form 发生了变化。

### 子表单内部状态发生变化时

在第一步收集子表单的时候就已经把 `handleFieldChange`
注入到了子表单组件里面，所以子表单来决定调用的时机。当 `handleFieldChange` 被调用的时候，首先对 Form `state`
进行更新，然后外通知子表单发生了变化，同时通知外面 Form 发生了变化。

这样看起来整个流程就走通了，但实际上存在很多问题。

首先由于 `setState` 是一个异步的过程，只有在 `render` 后才能获取到最新的 `state`.
这就导致，在一个生命周期循环内如果我多次调用了 `setState` ，那么两次调用之间对 `state`
的读取很可能是不准确的。（有关生命周期的详细内容可以看这篇文章：https://www.w3ctech.com/topic/1596）

所以我创建了一个临时变量 `currentState` 来存放当前状态下最新的 `state`，每次 `setState` 的时候都对其进行更新。

另一个问题是当 Form 发生变化的时候，`updateFormDataStructure` 调用的过于频繁。其实只有在子表单的数量或者类型发生变化时才需要更新
Form state 的结构。而直接去对比子表单的类型是否发生变化也是意见开销很大操作，所以选择另一种折中方式。通过给 Form 当前的状态打标，将
Form 可能处于的状态都标识出来：

```js
const STATUS = {
  Init: "Init",
  Normal: "Normal",
  FieldChange: "FieldChange",
  UpdateFormDataStructure: "UpdateFormDataStructure",
  Submit: "Submit",
}
```

这样，只有在 Form 的 `STATUS` 处于 `Normal` 的时候才对其进行 `updateFormDataStructure`
操作。这样就可以省去很多次渲染以及无效的对外触发的 `FormChange` 事件。

提交和对外暴露 Form 状态的方法和之前基本一致，这样整个对 Form 的重构就算完成了，具体项目中使用体验还不错 O(∩_∩)O

Form
组件地址： [https://github.com/NE-LOAN-FED/NE-Component/tree/master/src/Form](https://github.com/NE-LOAN-FED/NE-Component/tree/master/src/Form)

最后，如果看文章的你有什么更好的想法，请告诉我 😛。
