import { Logger } from "../logger/core.js";
import { nodeLogDestination } from "../logger/node.js";
function createNodeLogger(inlineConfig) {
  if (inlineConfig.logger) return inlineConfig.logger;
  return new Logger({
    dest: nodeLogDestination,
    level: inlineConfig.logLevel ?? "info"
  });
}
export {
  createNodeLogger
};
