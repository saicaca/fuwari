import { fileURLToPath } from "node:url";
import * as vite from "vite";
import { globalContentLayer } from "../../content/content-layer.js";
import { attachContentServerListeners } from "../../content/server-listeners.js";
import { eventCliSession, telemetry } from "../../events/index.js";
import { SETTINGS_FILE } from "../../preferences/constants.js";
import { createNodeLogger, createSettings, resolveConfig } from "../config/index.js";
import { collectErrorMetadata } from "../errors/dev/utils.js";
import { isAstroConfigZodError } from "../errors/errors.js";
import { createSafeError } from "../errors/index.js";
import { formatErrorMessage } from "../messages.js";
import { createContainer, startContainer } from "./container.js";
async function createRestartedContainer(container, settings) {
  const { logger, fs, inlineConfig } = container;
  const newContainer = await createContainer({
    isRestart: true,
    logger,
    settings,
    inlineConfig,
    fs
  });
  await startContainer(newContainer);
  return newContainer;
}
const configRE = /.*astro.config.(?:mjs|mts|cjs|cts|js|ts)$/;
function shouldRestartContainer({ settings, inlineConfig, restartInFlight }, changedFile) {
  if (restartInFlight) return false;
  let shouldRestart = false;
  const normalizedChangedFile = vite.normalizePath(changedFile);
  if (inlineConfig.configFile) {
    shouldRestart = vite.normalizePath(inlineConfig.configFile) === normalizedChangedFile;
  } else {
    shouldRestart = configRE.test(normalizedChangedFile);
    const settingsPath = vite.normalizePath(
      fileURLToPath(new URL(SETTINGS_FILE, settings.dotAstroDir))
    );
    if (settingsPath.endsWith(normalizedChangedFile)) {
      shouldRestart = settings.preferences.ignoreNextPreferenceReload ? false : true;
      settings.preferences.ignoreNextPreferenceReload = false;
    }
  }
  if (!shouldRestart && settings.watchFiles.length > 0) {
    shouldRestart = settings.watchFiles.some(
      (path) => vite.normalizePath(path) === vite.normalizePath(changedFile)
    );
  }
  return shouldRestart;
}
async function restartContainer(container) {
  const { logger, close, settings: existingSettings } = container;
  container.restartInFlight = true;
  try {
    const { astroConfig } = await resolveConfig(container.inlineConfig, "dev", container.fs);
    if (astroConfig.experimental.csp) {
      logger.warn(
        "config",
        "Astro's Content Security Policy (CSP) does not work in development mode. To verify your CSP implementation, build the project and run the preview server."
      );
    }
    const settings = await createSettings(astroConfig, fileURLToPath(existingSettings.config.root));
    await close();
    return await createRestartedContainer(container, settings);
  } catch (_err) {
    const error = createSafeError(_err);
    if (!isAstroConfigZodError(_err)) {
      logger.error(
        "config",
        formatErrorMessage(collectErrorMetadata(error), logger.level() === "debug") + "\n"
      );
    }
    container.viteServer.hot.send({
      type: "error",
      err: {
        message: error.message,
        stack: error.stack || ""
      }
    });
    container.restartInFlight = false;
    logger.error(null, "Continuing with previous valid configuration\n");
    return error;
  }
}
async function createContainerWithAutomaticRestart({
  inlineConfig,
  fs
}) {
  const logger = createNodeLogger(inlineConfig ?? {});
  const { userConfig, astroConfig } = await resolveConfig(inlineConfig ?? {}, "dev", fs);
  if (astroConfig.experimental.csp) {
    logger.warn(
      "config",
      "Astro's Content Security Policy (CSP) does not work in development mode. To verify your CSP implementation, build the project and run the preview server."
    );
  }
  telemetry.record(eventCliSession("dev", userConfig));
  const settings = await createSettings(astroConfig, fileURLToPath(astroConfig.root));
  const initialContainer = await createContainer({
    settings,
    logger,
    inlineConfig,
    fs
  });
  let resolveRestart;
  let restartComplete = new Promise((resolve) => {
    resolveRestart = resolve;
  });
  let restart = {
    container: initialContainer,
    restarted() {
      return restartComplete;
    }
  };
  async function handleServerRestart(logMsg = "", server) {
    logger.info(null, (logMsg + " Restarting...").trim());
    const container = restart.container;
    const result = await restartContainer(container);
    if (result instanceof Error) {
      resolveRestart(result);
    } else {
      restart.container = result;
      setupContainer();
      await attachContentServerListeners(restart.container);
      if (server) {
        server.resolvedUrls = result.viteServer.resolvedUrls;
      }
      resolveRestart(null);
    }
    restartComplete = new Promise((resolve) => {
      resolveRestart = resolve;
    });
  }
  function handleChangeRestart(logMsg) {
    return async function(changedFile) {
      if (shouldRestartContainer(restart.container, changedFile)) {
        handleServerRestart(logMsg);
      }
    };
  }
  function setupContainer() {
    const watcher = restart.container.viteServer.watcher;
    watcher.on("change", handleChangeRestart("Configuration file updated."));
    watcher.on("unlink", handleChangeRestart("Configuration file removed."));
    watcher.on("add", handleChangeRestart("Configuration file added."));
    restart.container.viteServer.restart = async () => {
      if (!restart.container.restartInFlight) {
        await handleServerRestart("", restart.container.viteServer);
      }
    };
    const customShortcuts = [
      // Disable default Vite shortcuts that don't work well with Astro
      { key: "r", description: "" },
      { key: "u", description: "" },
      { key: "c", description: "" }
    ];
    customShortcuts.push({
      key: "s",
      description: "sync content layer",
      action: () => {
        globalContentLayer.get()?.sync();
      }
    });
    restart.container.viteServer.bindCLIShortcuts({
      customShortcuts
    });
  }
  setupContainer();
  return restart;
}
export {
  createContainerWithAutomaticRestart
};
