import { readFile } from 'node:fs/promises';

import { echo, error } from '../lib/shell.js';
import { resolve } from '../lib/helpers.js';

export default async function check() {
	const pkg = await loadPluginPackageInfo();

	echo(`Checking package info of ${pkg.name}`);

	const { errors } = checkPluginPackageInfo(pkg);

	if (errors.length) {
		error(errors);
		return false;
	} else {
		echo('package.json looks good!');
		return true;
	}
};

function checkPluginPackageInfo(pkg) {
	const errors = [];

	if (!pkg.amdName) {
		errors.push('package.json missing `amdName` property');
	}
	if (pkg.type !== 'module') {
		errors.push('package.json `type` property must be "module"');
	}
	if (!pkg.source) {
		errors.push('package.json missing `source` property');
	}
	if (!pkg.main) {
		errors.push('package.json missing `main` property');
	}
	if (!pkg.module) {
		errors.push('package.json missing `module` property');
	}
	if (!pkg.unpkg) {
		errors.push('package.json missing `unpkg` property');
	}
	if (!pkg.exports) {
		errors.push('package.json missing `exports` property');
	}
	if (!pkg.browserslist) {
		errors.push('package.json missing `browserslist` property');
	}

	return { errors };
}

async function loadPluginPackageInfo() {
	const importPath = new URL(resolve('package.json'), import.meta.url);
	return JSON.parse(await readFile(importPath));
}
