#!/usr/bin/env node
import fs from 'node:fs'
import process from 'node:process'

import {direction} from './index.js'

/** @type {{[key: string]: unknown, version: string}} */
const pack = JSON.parse(String(fs.readFileSync('package.json')))

const argv = process.argv.slice(2)

if (argv.includes('--help') || argv.includes('-h')) {
  console.log(help())
} else if (argv.includes('--version') || argv.includes('-v')) {
  console.log(pack.version)
} else if (argv.length === 0) {
  process.stdin.resume()
  process.stdin.setEncoding('utf8')
  process.stdin.on('data', function (data) {
    console.log(direction(String(data)))
  })
} else {
  console.log(direction(argv.join(' ')))
}

function help() {
  return [
    '',
    '  Usage: ' + pack.name + ' [options] <words...>',
    '',
    '  ' + pack.description,
    '',
    '  Options:',
    '',
    '    -h, --help           output usage information',
    '    -v, --version        output version number',
    '',
    '  Usage:',
    '',
    '  # output directionality',
    '  $ ' + pack.name + ' @',
    '  # ' + direction('@'),
    '',
    '  # output directionality from stdin',
    "  $ echo 'الانجليزية' | " + pack.name,
    '  # ' + direction('الانجليزية'),
    ''
  ].join('\n')
}
