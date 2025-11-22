import { exec, echo } from '../lib/shell.js';

export default async function build() {
	echo('Run plugin in dev mode');
	exec('BROWSERSLIST_ENV=development microbundle -f modern --css inline -w');
	return true;
};
