#!/usr/bin/env node

/**
 * Helper script to get icon data from Iconify API
 * Usage: node scripts/get-icon-data.js <icon-name>
 * Example: node scripts/get-icon-data.js material-symbols:search
 */

const iconName = process.argv[2];

if (!iconName) {
	console.error('Usage: node scripts/get-icon-data.js <icon-name>');
	console.error('Example: node scripts/get-icon-data.js material-symbols:search');
	process.exit(1);
}

const [prefix, name] = iconName.split(':');

if (!prefix || !name) {
	console.error('Icon name must be in format: <prefix>:<name>');
	console.error('Example: material-symbols:search');
	process.exit(1);
}

const url = `https://api.iconify.design/${prefix}.json?icons=${name}`;

fetch(url)
	.then(res => res.json())
	.then(data => {
		const icon = data.icons[name];
		if (!icon) {
			console.error(`Icon "${name}" not found in set "${prefix}"`);
			process.exit(1);
		}

		const width = icon.width || data.width || 24;
		const height = icon.height || data.height || 24;

		console.log('\n// Add this to src/utils/preload-icons.ts:\n');
		console.log(`addIcon('${iconName}', {`);
		console.log(`\tbody: '${icon.body}',`);
		console.log(`\twidth: ${width},`);
		console.log(`\theight: ${height},`);
		console.log(`});\n`);
	})
	.catch(error => {
		console.error('Error fetching icon data:', error.message);
		process.exit(1);
	});
