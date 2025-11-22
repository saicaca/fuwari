#!/usr/bin/env node

import build from './commands/build.js';
import check from './commands/check.js';
import dev from './commands/dev.js';
import lint from './commands/lint.js';
import format from './commands/format.js';

import { error } from './lib/shell.js';

const commands = {
	build: async () => (await check()) && (await build()),
	dev: async () => (await check()) && (await dev()),
	lint,
	format,
	check,
};

async function main() {
	const args = process.argv.slice(2);

	const command = args[0] || '';
	if (!command) {
		return error(`Missing command (available: ${Object.keys(commands).join(', ')})`);
	}

	const handler = commands[command];
	if (!handler) {
		return error(`Unknown command: ${args.join(' ')}`);
	}

	await handler(args);
}

main();
