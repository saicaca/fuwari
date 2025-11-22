'use strict';

require('local-pkg');
require('fs');

async function getTypesVersion() {
  throw new Error(
    `getTypesVersion() is deprecated, use wildcard to make packages work with all versions`
  );
}

exports.getTypesVersion = getTypesVersion;
