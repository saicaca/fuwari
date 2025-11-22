# volar-service-emmet

Volar plugin for [`@vscode/emmet-helper`](https://github.com/microsoft/vscode-emmet-helper).

## Installation

```sh
npm install volar-service-emmet
```

## Usage

`volar.config.js`

```js
module.exports = {
	services: [
		require('volar-service-emmet').create(),
	],
};
```

## License

[MIT](LICENSE) © [Johnson Chu](https://github.com/johnsoncodehk)
