# zod-to-ts

generate TypeScript types from your [Zod](https://github.com/colinhacks/zod) schema

## Installation

```
npm install zod-to-ts zod typescript
```

You must be on zod@3 and typescript@4.

## Usage

```ts
import { z } from 'zod'
import { zodToTs } from 'zod-to-ts'

// define your Zod schema
const UserSchema = z.object({
	username: z.string(),
	age: z.number(),
	inventory: z.object({
		name: z.string(),
		itemId: z.number(),
	}).array(),
})

// pass schema and name of type/identifier
const { node } = zodToTs(UserSchema, 'User')
```

result:

<!-- dprint-ignore -->
```ts
{
  username: string
  age: number
  inventory: {
    name: string
    itemId: number
  }[]
}
```

You must pass in the identifier `User` or it will default to `Identifier`. This is necessary to handle cases like recursive types and native enums. `zodToTs()` only returns the type value, not the actual type declaration. If you want to add an identifier to the type and create a type declaration, you can use the `createTypeAlias()` utility:

```ts
import { createTypeAlias, zodToTs } from 'zod-to-ts'

const identifier = 'User'
const { node } = zodToTs(UserSchema, identifier)
const typeAlias = createTypeAlias(
	node,
	identifier,
	// optionally pass a comment
	// comment: UserSchema.description
)
```

result:

```ts
type User = {
	username: string
}
```

`zodToTs()` and `createTypeAlias()` return a TS AST nodes, so if you want to get the node as a string, you can use the `printNode()` utility.

`zodToTs()`:

```ts
import { printNode, zodToTs } from 'zod-to-ts'

const identifier = 'User'
const { node } = zodToTs(UserSchema, identifier)
const nodeString = printNode(node)
```

result:

<!-- dprint-ignore -->
```
"{
  username: string
  age: number
  inventory: {
    name: string
    itemId: number
  }[]
}"
```

`createTypeAlias()`:

```ts
import { createTypeAlias, printNode, zodToTs } from 'zod-to-ts'

const identifier = 'User'
const { node } = zodToTs(UserSchema, identifier)
const typeAlias = createTypeAlias(node, identifier)
const nodeString = printNode(typeAlias)
```

result:

<!-- dprint-ignore -->
```
"type User = {
  username: string
  age: number
  inventory: {
    name: string
    itemId: number
  }[]
}"
```

## Overriding Types

You can use `withGetType` to override a type, which is useful when more information is needed to determine the actual type. Unfortunately, this means working with the TS AST:

```ts
import { z } from 'zod'
import { withGetType, zodToTs } from 'zod-to-ts'

const DateSchema = withGetType(
	z.instanceof(Date),
	(ts) => ts.factory.createIdentifier('Date'),
)

const ItemSchema = z.object({
	name: z.string(),
	date: DateSchema,
})

const { node } = zodToTs(ItemSchema, 'Item')
```

result without `withGetType` override:

```ts
type Item = {
	name: string
	date: any
}
```

result with override:

```ts
type Item = {
	name: string
	date: Date
}
```

[TypeScript AST Viewer](https://ts-ast-viewer.com/) can help a lot with this if you are having trouble referencing something. It even provides copy-pastable code!

### Special Cases

#### [z.lazy()](https://github.com/colinhacks/zod#recursive-types)

Lazy types default to referencing the root type (`User` in the following example). It is impossible to determine what it is referencing otherwise.

```ts
// Zod cannot infer types when you use the z.lazy
// so you must define it
import { z } from 'zod'
type User = {
	username: string
	friends: User[]
}

const UserSchema: z.ZodSchema<User> = z.object({
	username: z.string(),
	friends: z.lazy(() => UserSchema).array(),
})

const { node } = zodToTs(UserSchema, 'User')
```

result:

```ts
type User = {
	username: string
	friends: User[]
}
```

But what happens when the schema looks like this?

```ts
type User = {
	username: string
	item: {
		name: string
		itemId: string
	}
	friends: User[]
}

// essentially when you are referencing a different field
// and not the root type
const friendItems = z.lazy(() => UserSchema.item).array()

const UserSchema: z.ZodSchema<User> = z.object({
	username: z.string(),
	item: z.object({
		name: z.string(),
		id: z.number(),
	}),
	friendItems,
})

const { node } = zodToTs(UserSchema, 'User')
```

result:

<!-- dprint-ignore -->
```ts
{
  username: string
  item: {
    name: string
    id: number
  }
  friendItems: User[]
}
```

`friendItems` will still have the `User` type even though it is actually referencing `UserSchema["item"]`. You must provide the actual type using `withGetType`:

```ts
import { z } from 'zod'
import { withGetType } from 'zod-to-ts'
type User = {
	username: string
	item: {
		name: string
		id: number
	}
	friends: User[]
}

const friendItems: z.Schema<User['item'][]> = withGetType(
	z.lazy(() => UserSchema.item).array(),
	// return a TS AST node
	(ts, identifier) =>
		ts.factory.createIndexedAccessTypeNode(
			ts.factory.createTypeReferenceNode(
				ts.factory.createIdentifier(identifier),
				undefined,
			),
			ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral('item')),
		),
)

const UserSchema: z.ZodSchema<User> = z.object({
	username: z.string(),
	item: z.object({
		name: z.string(),
		id: z.number(),
	}),
	friendItems,
})

const { node } = zodToTs(UserSchema, 'User')
```

result:

```ts
{
  username: string
  item: {
    name: string
    id: number
  }
  friendItems: User['item'][]
}
```

#### [z.nativeEnum()](https://github.com/colinhacks/zod#native-enums)

`z.enum()` is always preferred, but sometimes `z.nativeEnum()` is necessary. `z.nativeEnum()` works similarly to `z.lazy()` in that the identifier of the enum cannot be determined:

```ts
import { z } from 'zod'
import { withGetType } from 'zod-to-ts'

enum Fruit {
  Apple = 'apple',
  Banana = 'banana',
  Cantaloupe = 'cantaloupe',
}

const fruitNativeEnum: = z.nativeEnum(
  Fruit,
)

const TreeSchema = z.object({
  fruit: fruitNativeEnum,
})
```

result:

<!-- dprint-ignore -->
```ts
{
  fruit: unknown
}
```

There are three ways to solve this: provide an identifier to it or resolve all the enums inside `zodToTs()`.

Option 1 - providing an identifier using `withGetType()`:

```ts
import { z } from 'zod'
import { withGetType, zodToTs } from 'zod-to-ts'

enum Fruit {
	Apple = 'apple',
	Banana = 'banana',
	Cantaloupe = 'cantaloupe',
}

const fruitNativeEnum = withGetType(
	z.nativeEnum(
		Fruit,
	),
	// return an identifier that will be used on the enum type
	(ts) => ts.factory.createIdentifier('Fruit'),
)

const TreeSchema = z.object({
	fruit: fruitNativeEnum,
})

const { node } = zodToTs(TreeSchema)
```

result:

<!-- dprint-ignore -->
```ts
{
  fruit: Fruit
}
```

Option 2 - resolve enums. This is the same as before, but you just need to pass an option:

```ts
const TreeTSType = zodToTs(TreeSchema, undefined, { nativeEnums: 'resolve' })
```

result:

<!-- dprint-ignore -->
```ts
{
  node: {
    fruit: Fruit
  },
  store: {
    nativeEnums: [
      enum Fruit {
        Apple = 'apple',
        Banana = 'banana',
        Cantaloupe = 'cantaloupe',
      }
    ]
  }
}
```

Note: These are not the actual values, they are TS representation. The actual values are TS AST nodes.

This option allows you to embed the enums before the schema without actually depending on an external enum type.

Option 3 - convert to union. This is the same as how ZodEnum created by z.enum([...]) is handled, but need to pass an option:

```ts
const { node } = zodToTs(TreeSchema, undefined, {
	nativeEnums: 'union',
})
```

result:

<!-- dprint-ignore -->
```ts
{
  fruit: 'apple' | 'banana' | 'cantaloupe'
}
```

Note: These are not the actual values, they are TS representation. The actual values are TS AST nodes.
