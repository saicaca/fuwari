# @oslojs/encoding

**Documentation: https://encoding.oslojs.dev**

A JavaScript library for encoding and decoding data with hexadecimal, base32, base64, and base64url encoding schemes based on [RFC 4648](https://datatracker.ietf.org/doc/html/rfc4648). Implementations may be stricter than most to follow the RFC as close as possible.

- Runtime-agnostic
- No third-party dependencies
- Fully typed

```ts
import { encodeBase64, decodeBase64 } from "@oslojs/encoding";

const data: Uint8Array = new TextEncoder().encode("hello world");
const encoded = encodeBase64(data);
const decoded = decodeBase64(encoded);
```

## Installation

```
npm i @oslojs/encoding
```
