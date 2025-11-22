module.exports = {
	development: [
		'last 1 version',
	],
	production: [
		'last 3 version',
		'>=0.5%',
		'not dead',
	],
	modern: [
		'last 2 version',
		'>1%',
		'not dead',
	]
};
