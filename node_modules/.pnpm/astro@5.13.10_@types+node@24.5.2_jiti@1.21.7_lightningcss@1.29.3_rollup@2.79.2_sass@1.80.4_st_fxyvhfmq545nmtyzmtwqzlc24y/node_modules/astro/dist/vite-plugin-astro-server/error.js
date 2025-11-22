import { collectErrorMetadata } from "../core/errors/dev/index.js";
import { createSafeError } from "../core/errors/index.js";
import { formatErrorMessage } from "../core/messages.js";
function recordServerError(loader, config, { logger }, _err) {
  const err = createSafeError(_err);
  try {
    loader.fixStacktrace(err);
  } catch {
  }
  const errorWithMetadata = collectErrorMetadata(err, config.root);
  logger.error(null, formatErrorMessage(errorWithMetadata, logger.level() === "debug"));
  return {
    error: err,
    errorWithMetadata
  };
}
export {
  recordServerError
};
