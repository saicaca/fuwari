# zimmerframe

A tool for walking.

Specifically, it's a tool for walking an abstract syntax tree (AST), where every node is an object with a `type: string`. This includes [ESTree](https://github.com/estree/estree) nodes, such as you might generate with [Acorn](https://github.com/acornjs/acorn) or [Meriyah](https://github.com/meriyah/meriyah), but also includes things like [CSSTree](https://github.com/csstree/csstree) or an arbitrary AST of your own devising.

## Usage

```ts
import { walk } from 'zimmerframe';
import { parse } from 'acorn';
import { Node } from 'estree';

const program = parse(`
let message = 'hello';
console.log(message);

if (true) {
  let answer = 42;
  console.log(answer);
}
`);

// You can pass in arbitrary state
const state = {
  declarations: [],
  depth: 0
};

const transformed = walk(program as Node, state, {
  _(node, { state, next }) {
    // the `_` visitor is 'universal' — if provided,
    // it will run for every node, before deferring
    // to specialised visitors. you can pass a new
    // `state` object to `next`
    next({ ...state, answer: 42 });
  },
  VariableDeclarator(node, { state }) {
    // `state` is passed into each visitor
    if (node.id.type === 'Identifier') {
      state.declarations.push({
        depth: state.depth,
        name: node.id.name
      });
    }
  },
  BlockStatement(node, { state, next, stop }) {
    // you must call `next()` or `next(childState)`
    // to visit child nodes
    console.log('entering BlockStatement');
    next({ ...state, depth: state.depth + 1 });
    console.log('leaving BlockStatement');
  },
  Literal(node) {
    // if you return something, it will replace
    // the current node
    if (node.value === 'hello') {
      return {
        ...node,
        value: 'goodbye'
      };
    }
  },
  IfStatement(node, { visit }) {
    // normally, returning a value will halt
    // traversal into child nodes. you can
    // transform children with the current
    // visitors using `visit(node, state?)`
    if (node.test.type === 'Literal' && node.test.value === true) {
      return visit(node.consequent);
    }
  }
});
```

The `transformed` AST would look like this:

```js
let message = 'goodbye';
console.log(message);

{
  let answer = 42;
  console.log(answer);
}
```

## Types

The type of `node` in each visitor is inferred from the visitor's name. For example:

```ts
walk(ast as estree.Node, state, {
  ArrowFunctionExpression(node) {
    // `node` is of type estree.ArrowFunctionExpression
  }
});
```

For this to work, the first argument should be casted to an union of all the types you plan to visit.

You can import types from 'zimmerframe':

```ts
import {
  walk,
  type Visitor,
  type Visitors,
  type Context
} from 'zimmerframe';
import type { Node } from 'estree';

interface State {...}

const node: Node = {...};
const state: State = {...};
const visitors: Visitors<Node, State> =  {...}

walk(node, state, visitors);
```

## Context

Each visitor receives a second argument, `context`, which is an object with the following properties and methods:

- `next(state?: State): void` — a function that allows you to control when child nodes are visited, and which state they are visited with. If child visitors transform their inputs, this will return the transformed node (if not, returns `undefined`)
- `path: Node[]` — an array of parent nodes. For example, to get the root node you would do `path.at(0)`; to get the current node's immediate parent you would do `path.at(-1)`
- `state: State` — an object of the same type as the second argument to `walk`. Visitors can pass new state objects to their children with `next(childState)` or `visit(node, childState)`
- `stop(): void` — prevents any subsequent traversal
- `visit(node: Node, state?: State): Node` — returns the result of visiting `node` with the current set of visitors. If no `state` is provided, children will inherit the current state

## Immutability

ASTs are regarded as immutable. If you return a transformed node from a visitor, then all parents of the node will be replaced with clones, but unchanged subtrees will reuse the existing nodes.

For example in this case, no transformation takes place, meaning that the returned value is identical to the original AST:

```js
const transformed = walk(original, state, {
  Literal(node) {
    console.log(node.value);
  }
});

transformed === original; // true
```

In this case, however, we replace one of the nodes:

```js
const original = {
  type: 'BinaryExpression',
  operator: '+',
  left: {
    type: 'Identifier',
    name: 'foo'
  },
  right: {
    type: 'Identifier',
    name: 'bar'
  }
};

const transformed = walk(original, state, {
  Identifier(node) {
    if (node.name === 'bar') {
      return { ...node, name: 'baz' };
    }
  }
});

transformed === original; // false, the BinaryExpression node is cloned
transformed.left === original.left; // true, we can safely reuse this node
```

This makes it very easy to transform parts of your AST without incurring the performance and memory overhead of cloning the entire thing, and without the footgun of mutating it in place.

## License

MIT
