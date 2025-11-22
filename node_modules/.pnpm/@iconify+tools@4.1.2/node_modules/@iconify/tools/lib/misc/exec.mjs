import { resolve } from 'pathe';
import { exec } from 'child_process';

function execAsync(cmd, options) {
  return new Promise((fulfill, reject) => {
    if (typeof options?.cwd === "string") {
      options = {
        ...options,
        cwd: resolve(options.cwd)
      };
    }
    exec(cmd, options, (error, stdout, stderr) => {
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

export { execAsync };
