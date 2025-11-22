# Deterministic-Object-Hash
A deterministic object hashing algorithm for Node.js and web platform.

## The Problem
Using `JSON.stringify` on two objects that are deeply equal does not lead to the same output string. Instead the keys are ordered in the same order that they were added. This leads to two objects that are deeply equal being hashed to different values.

```typescript
import { createHash } from "crypto";
import { isEqual } from "lodash";

const obj1: Record<string, string> = {};
obj1['a'] = 'x';
obj1['b'] = 'y';
obj1['c'] = 'z';

const obj2: Record<string, string> = {};
obj2['c'] = 'z';
obj2['b'] = 'y';
obj2['a'] = 'x';

isEqual(obj1, obj2);
// -> true

const string1 = JSON.stringify(obj1);
// -> {"a":"x","b":"y","c":"z"}
const string2 = JSON.stringify(obj2);
// -> {"c":"z","b":"y","a":"x"}

createHash('sha1').update(string1).digest('hex');
// -> ff75fe071d236ce309c15d5636ecaa86c0519ebc
createHash('sha1').update(string2).digest('hex');
// -> 2e53bac865f7be77c8e10cd86d737fbbf259ed37
```


## Usage
Pass a value and receive a deterministic hash of the value.

```typescript
import deterministicHash from 'deterministic-object-hash';

const objA = { a: 'x', arr: [1,2,3,4], b: 'y' };
const objB = { b: 'y', a: 'x', arr: [1,2,3,4] };

await deterministicHash({
	c: [ objA, objB ],
	b: objA,
	e: objB,
	f: ()=>{ Math.random(); },
	g: Symbol('Unique identity'),
	h: new Error('AHHH')
});
// -> 4c57bcb76498dca7b98ef9747c8f1e7f10c30388

await deterministicHash({
	h: new Error('AHHH'),
	e: objB,
	g: Symbol('Unique identity'),
	b: objA,
	f: ()=>{ Math.random(); },
	c: [ objA, objB ]
});
// -> 4c57bcb76498dca7b98ef9747c8f1e7f10c30388
```

## Settings

A hash algorithm can be passed as the second argument. This takes any value that is valid for `webcrypto.subtle.digest`. The default is `SHA-1`. \
A digest format can be passed as the third argument. This takes any value that is valid for `Hash.digest`. The default is `hex`.


```typescript
await deterministicHash('value', 'SHA-1');
// -> efede6000ad4e1ff258a38866c71aa351d3c01f6
await deterministicHash('value', 'SHA-256', 'hex');
// -> a0b7821a11db531982044ca5ca2e788e2d749d6b696cd3aa4172342f584f2ee1
await deterministicHash('value', 'SHA-512', 'base64');
// -> 514CuHw/31qqUH2waqaqhKSMvLYH/YdZeRI4QqDBwhKbUk0/3mxhv4NUubXIl5Dm2k0VpU6ZZkmunEb10RngfQ==
```

## Supported Values
|                     |                   |
| ------------------- | ----------------- |
| String              | Number            |
| Boolean             | Function          |
| Plain Objects       | Symbol            |
| undefined           | null              |
| Infinity            | NaN               |
| BigInt              | Array             |
| Classes/Inheritance | Errors            |
| Date                | RegExp            |
| Map                 | Set               |
| Int8Array           | Uint8Array        |
| Int16Array          | Uint16Array       |
| Int32Array          | Uint32Array       |
| Float32Array        | Float64Array      |
| BigInt64Array       | BigUint64Array    |
| Uint8ClampedArray   | globalThis        |
| ArrayBuffer         | SharedArrayBuffer |

## Unsupported Values
|          |          |
| -------- | -------- |
| WeakMap  | WeakSet  |
| Atomics  | DataView |
| Promises | Reflect  |
| Proxy    |          |

Due to their nature, [WeakSet](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet#description) and [WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap#why_weakmap) are not enumerable. As a result there is no way to know what is in a WeakSet/WeakMap unless we are told.

## Support
Currently this has only been tested on Node.js `18.x.x`. More tests are to come and this section will be updated as I test them.

## Contributors
Contributions are welcome. Feel free to create a PR and tag [zbauman3](https://github.com/zbauman3).

### Past contributors: 

- [zbauman3](https://github.com/zbauman3)
- [RodrigoTomeES](https://github.com/RodrigoTomeES)
