'use strict';

const pathe = require('pathe');
const child_process = require('child_process');

function execAsync(cmd, options) {
  return new Promise((fulfill, reject) => {
    if (typeof options?.cwd === "string") {
      options = {
        ...options,
        cwd: pathe.resolve(options.cwd)
      };
    }
    child_process.exec(cmd, options, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        fulfill({
          stdout,
          stderr
        });
      }
    });
  });
}

exports.execAsync = execAsync;
