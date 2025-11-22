# volar-service-css

Volar plugin for [`vscode-css-languageservice`](https://github.com/microsoft/vscode-css-languageservice).

## Installation

```sh
npm install volar-service-css
```

## Usage

`volar.config.js`

```js
module.exports = {
	services: [
		require('volar-service-css').create(),
	],
};
```

## License

[MIT](LICENSE) © [Johnson Chu](https://github.com/johnsoncodehk)
