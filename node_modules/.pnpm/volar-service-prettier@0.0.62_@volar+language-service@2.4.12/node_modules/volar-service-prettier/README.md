# volar-service-prettier

Volar plugin for [prettier](https://prettier.io/).

## Installation

```sh
npm install volar-service-prettier
```

## Usage

`volar.config.js`

```js
module.exports = {
	services: [
		require('volar-service-prettier').create(
			{
				languages: ['html', 'css', 'scss', 'typescript', 'javascript'],
				html: {
					breakContentsFromTags: true,
				},
				ignoreIdeOptions: true,
			},
			// provide your prettier options, otherwise auto resolve config file by plugin
			() => ({
				// ...
			})
		),
	],
};
```

## License

[MIT](LICENSE) © [Pacharapol Withayasakpunt](https://www.polv.cc)
