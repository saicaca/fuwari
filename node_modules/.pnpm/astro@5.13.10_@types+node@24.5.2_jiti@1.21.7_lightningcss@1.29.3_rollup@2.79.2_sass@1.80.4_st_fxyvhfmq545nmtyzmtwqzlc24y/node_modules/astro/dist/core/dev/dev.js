import fs from "node:fs";
import { performance } from "node:perf_hooks";
import { green } from "kleur/colors";
import { gt, major, minor, patch } from "semver";
import { getDataStoreFile, globalContentLayer } from "../../content/content-layer.js";
import { attachContentServerListeners } from "../../content/index.js";
import { MutableDataStore } from "../../content/mutable-data-store.js";
import { globalContentConfigObserver } from "../../content/utils.js";
import { telemetry } from "../../events/index.js";
import * as msg from "../messages.js";
import { ensureProcessNodeEnv } from "../util.js";
import { startContainer } from "./container.js";
import { createContainerWithAutomaticRestart } from "./restart.js";
import {
  fetchLatestAstroVersion,
  MAX_PATCH_DISTANCE,
  shouldCheckForUpdates
} from "./update-check.js";
async function dev(inlineConfig) {
  ensureProcessNodeEnv("development");
  const devStart = performance.now();
  await telemetry.record([]);
  const restart = await createContainerWithAutomaticRestart({ inlineConfig, fs });
  const logger = restart.container.logger;
  const currentVersion = "5.13.10";
  const isPrerelease = currentVersion.includes("-");
  if (!isPrerelease) {
    try {
      shouldCheckForUpdates(restart.container.settings.preferences).then(async (shouldCheck) => {
        if (shouldCheck) {
          const version = await fetchLatestAstroVersion(restart.container.settings.preferences);
          if (gt(version, currentVersion)) {
            restart.container.settings.latestAstroVersion = version;
            const sameMajor = major(version) === major(currentVersion);
            const sameMinor = minor(version) === minor(currentVersion);
            const patchDistance = patch(version) - patch(currentVersion);
            if (sameMajor && sameMinor && patchDistance < MAX_PATCH_DISTANCE) {
              return;
            }
            logger.warn(
              "SKIP_FORMAT",
              await msg.newVersionAvailable({
                latestVersion: version
              })
            );
          }
        }
      }).catch(() => {
      });
    } catch {
    }
  }
  let store;
  try {
    const dataStoreFile = getDataStoreFile(restart.container.settings, true);
    store = await MutableDataStore.fromFile(dataStoreFile);
  } catch (err) {
    logger.error("content", err.message);
  }
  if (!store) {
    logger.error("content", "Failed to create data store");
  }
  await attachContentServerListeners(restart.container);
  const config = globalContentConfigObserver.get();
  if (config.status === "error") {
    logger.error("content", config.error.message);
  }
  if (config.status === "loaded" && store) {
    const contentLayer = globalContentLayer.init({
      settings: restart.container.settings,
      logger,
      watcher: restart.container.viteServer.watcher,
      store
    });
    contentLayer.watchContentConfig();
    await contentLayer.sync();
  } else {
    logger.warn("content", "Content config not loaded");
  }
  const devServerAddressInfo = await startContainer(restart.container);
  logger.info(
    "SKIP_FORMAT",
    msg.serverStart({
      startupTime: performance.now() - devStart,
      resolvedUrls: restart.container.viteServer.resolvedUrls || { local: [], network: [] },
      host: restart.container.settings.config.server.host,
      base: restart.container.settings.config.base
    })
  );
  if (isPrerelease) {
    logger.warn("SKIP_FORMAT", msg.prerelease({ currentVersion }));
  }
  if (restart.container.viteServer.config.server?.fs?.strict === false) {
    logger.warn("SKIP_FORMAT", msg.fsStrictWarning());
  }
  logger.info(null, green("watching for file changes..."));
  return {
    address: devServerAddressInfo,
    get watcher() {
      return restart.container.viteServer.watcher;
    },
    handle(req, res) {
      return restart.container.handle(req, res);
    },
    async stop() {
      await restart.container.close();
    }
  };
}
export {
  dev as default
};
