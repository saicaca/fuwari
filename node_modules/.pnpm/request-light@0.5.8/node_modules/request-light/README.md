# request-light


[![npm Package](https://img.shields.io/npm/v/request-light.svg?style=flat-square)](https://www.npmjs.org/package/request-light)
[![NPM Downloads](https://img.shields.io/npm/dm/request-light.svg)](https://npmjs.org/package/request-light)
[![Build Status](https://github.com/microsoft/node-request-light/workflows/Tests/badge.svg)](https://github.com/microsoft/node-request-light/workflows/Tests)

A lightweight request library intended to be used by VSCode extensions.
- NodeJS and browser main entry points
- proxy support: Use `configure` or `HTTP_PROXY` and `HTTPS_PROXY` env variables to configure the HTTP proxy addresses.

```ts
import { xhr, XHRResponse, getErrorStatusDescription } from 'request-light';

const headers = { 'Accept-Encoding': 'gzip, deflate' };
return xhr({ url: url, followRedirects: 5, headers }).then(response => {
    return response.responseText;
}, (error: XHRResponse) => {
    throw new Error(error.responseText || getErrorStatusDescription(error.status) || error.toString());
});
```
