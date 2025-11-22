import path from 'path';
import fs from 'fs';

const appDirectory = fs.realpathSync(process.cwd());

export function resolve(relativePath = '') {
	if (relativePath) {
		return path.resolve(appDirectory, relativePath);
	} else {
		return appDirectory;
	}
}
