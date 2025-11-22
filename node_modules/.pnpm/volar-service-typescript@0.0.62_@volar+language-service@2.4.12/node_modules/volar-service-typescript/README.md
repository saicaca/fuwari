# volar-service-typescript

Volar plugin for [TypeScript](https://www.typescriptlang.org/).

## Installation

```sh
npm install volar-service-typescript
```

## Usage

`volar.config.js`

```js
module.exports = {
	services: [
		require('volar-service-typescript').create(),
	],
};
```

## License

[MIT](LICENSE) © [Johnson Chu](https://github.com/johnsoncodehk)
