'use strict';

const tar = require('tar');

async function untar(file, path) {
  await tar.x({
    file,
    C: path
  });
}

exports.untar = untar;
