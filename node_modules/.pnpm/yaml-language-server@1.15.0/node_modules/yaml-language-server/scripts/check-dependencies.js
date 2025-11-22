/* --------------------------------------------------------------------------------------------
 * Copyright (c) Red Hat, Inc. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

//check package.json do not have dependency with 'next' version

/* eslint-disable @typescript-eslint/no-var-requires */

const exit = require('process').exit;
const dependencies = require('../package.json').dependencies;

for (const dep in dependencies) {
  if (Object.prototype.hasOwnProperty.call(dependencies, dep)) {
    const version = dependencies[dep];
    if (version === 'next') {
      console.error(`Dependency ${dep} has "${version}" version, please change it to fixed version`);
      exit(1);
    }
  }
}
