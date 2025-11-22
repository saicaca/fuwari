'use strict';

const fs = require('fs');

async function writeJSONFile(filename, data) {
  return fs.promises.writeFile(filename, JSON.stringify(data, null, "	") + "\n");
}

exports.writeJSONFile = writeJSONFile;
