# volar-service-html

Volar plugin for [`vscode-html-languageservice`](https://github.com/microsoft/vscode-html-languageservice).

## Installation

```sh
npm install volar-service-html
```

## Usage

`volar.config.js`

```js
module.exports = {
	services: [
		require('volar-service-html').create(),
	],
};
```

## License

[MIT](LICENSE) © [Johnson Chu](https://github.com/johnsoncodehk)
