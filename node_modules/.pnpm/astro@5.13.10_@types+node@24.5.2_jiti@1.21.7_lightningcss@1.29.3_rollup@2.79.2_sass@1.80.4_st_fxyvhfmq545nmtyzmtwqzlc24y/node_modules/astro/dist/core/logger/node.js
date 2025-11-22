import debugPackage from "debug";
import { getEventPrefix, levels } from "./core.js";
const nodeLogDestination = {
  write(event) {
    let dest = process.stderr;
    if (levels[event.level] < levels["error"]) {
      dest = process.stdout;
    }
    let trailingLine = event.newLine ? "\n" : "";
    if (event.label === "SKIP_FORMAT") {
      dest.write(event.message + trailingLine);
    } else {
      dest.write(getEventPrefix(event) + " " + event.message + trailingLine);
    }
    return true;
  }
};
const debuggers = {};
function debug(type, ...messages) {
  const namespace = `astro:${type}`;
  debuggers[namespace] = debuggers[namespace] || debugPackage(namespace);
  return debuggers[namespace](...messages);
}
globalThis._astroGlobalDebug = debug;
function enableVerboseLogging() {
  debugPackage.enable("astro:*,vite:*");
  debug("cli", '--verbose flag enabled! Enabling: DEBUG="astro:*,vite:*"');
  debug(
    "cli",
    'Tip: Set the DEBUG env variable directly for more control. Example: "DEBUG=astro:*,vite:* astro build".'
  );
}
export {
  enableVerboseLogging,
  nodeLogDestination
};
