'use strict';

const extract = require('extract-zip');
const fs = require('fs');

function _interopDefaultCompat (e) { return e && typeof e === 'object' && 'default' in e ? e.default : e; }

const extract__default = /*#__PURE__*/_interopDefaultCompat(extract);

async function unzip(source, path) {
  const dir = await fs.promises.realpath(path);
  await extract__default(source, {
    dir
  });
}

exports.unzip = unzip;
