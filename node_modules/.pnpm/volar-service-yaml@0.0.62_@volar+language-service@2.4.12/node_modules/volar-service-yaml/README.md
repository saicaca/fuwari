# volar-service-yaml

Volar plugin for [`yaml-language-server`](https://github.com/redhat-developer/yaml-language-server).

## Installation

```sh
npm install volar-service-yaml
```

## Usage

`volar.config.js`

```js
module.exports = {
	services: [
		require('volar-service-yaml').create(),
	],
};
```

## License

[MIT](LICENSE) © [Remco Haszing](https://github.com/remcohaszing)
