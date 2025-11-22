import fs from "node:fs";
import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";
import { blue, bold, green } from "kleur/colors";
import { telemetry } from "../../events/index.js";
import { eventCliSession } from "../../events/session.js";
import {
  runHookBuildDone,
  runHookBuildStart,
  runHookConfigDone,
  runHookConfigSetup
} from "../../integrations/hooks.js";
import { createDevelopmentManifest } from "../../vite-plugin-astro-server/plugin.js";
import { resolveConfig } from "../config/config.js";
import { createNodeLogger } from "../config/logging.js";
import { createSettings } from "../config/settings.js";
import { createVite } from "../create-vite.js";
import { createKey, getEnvironmentKey, hasEnvironmentKey } from "../encryption.js";
import { AstroError, AstroErrorData } from "../errors/index.js";
import { levels, timerMessage } from "../logger/core.js";
import { apply as applyPolyfill } from "../polyfill.js";
import { createRoutesList } from "../routing/index.js";
import { getServerIslandRouteData } from "../server-islands/endpoint.js";
import { clearContentLayerCache } from "../sync/index.js";
import { ensureProcessNodeEnv } from "../util.js";
import { collectPagesData } from "./page-data.js";
import { staticBuild, viteBuild } from "./static-build.js";
import { getTimeStat } from "./util.js";
async function build(inlineConfig, options = {}) {
  ensureProcessNodeEnv(options.devOutput ? "development" : "production");
  applyPolyfill();
  const logger = createNodeLogger(inlineConfig);
  const { userConfig, astroConfig } = await resolveConfig(inlineConfig, "build");
  telemetry.record(eventCliSession("build", userConfig));
  const settings = await createSettings(astroConfig, fileURLToPath(astroConfig.root));
  if (inlineConfig.force) {
    await clearContentLayerCache({ settings, logger, fs, isDev: false });
  }
  const builder = new AstroBuilder(settings, {
    ...options,
    logger,
    mode: inlineConfig.mode ?? "production",
    runtimeMode: options.devOutput ? "development" : "production"
  });
  await builder.run();
}
class AstroBuilder {
  settings;
  logger;
  mode;
  runtimeMode;
  origin;
  routesList;
  timer;
  teardownCompiler;
  constructor(settings, options) {
    this.mode = options.mode;
    this.runtimeMode = options.runtimeMode;
    this.settings = settings;
    this.logger = options.logger;
    this.teardownCompiler = options.teardownCompiler ?? true;
    this.origin = settings.config.site ? new URL(settings.config.site).origin : `http://localhost:${settings.config.server.port}`;
    this.routesList = { routes: [] };
    this.timer = {};
  }
  /** Setup Vite and run any async setup logic that couldn't run inside of the constructor. */
  async setup() {
    this.logger.debug("build", "Initial setup...");
    const { logger } = this;
    this.timer.init = performance.now();
    this.settings = await runHookConfigSetup({
      settings: this.settings,
      command: "build",
      logger
    });
    const manifest = createDevelopmentManifest(this.settings);
    this.routesList = await createRoutesList({ settings: this.settings }, this.logger);
    await runHookConfigDone({ settings: this.settings, logger, command: "build" });
    if (!this.settings.config.adapter && this.settings.buildOutput === "server") {
      throw new AstroError(AstroErrorData.NoAdapterInstalled);
    }
    const viteConfig = await createVite(
      {
        server: {
          hmr: false,
          middlewareMode: true
        }
      },
      {
        settings: this.settings,
        logger: this.logger,
        mode: this.mode,
        command: "build",
        sync: false,
        routesList: this.routesList,
        manifest
      }
    );
    const { syncInternal } = await import("../sync/index.js");
    await syncInternal({
      mode: this.mode,
      settings: this.settings,
      logger,
      fs,
      routesList: this.routesList,
      command: "build",
      manifest
    });
    return { viteConfig };
  }
  /** Run the build logic. build() is marked private because usage should go through ".run()" */
  async build({ viteConfig }) {
    await runHookBuildStart({ config: this.settings.config, logger: this.logger });
    this.validateConfig();
    this.logger.info("build", `output: ${blue('"' + this.settings.config.output + '"')}`);
    this.logger.info("build", `mode: ${blue('"' + this.settings.buildOutput + '"')}`);
    this.logger.info("build", `directory: ${blue(fileURLToPath(this.settings.config.outDir))}`);
    if (this.settings.adapter) {
      this.logger.info("build", `adapter: ${green(this.settings.adapter.name)}`);
    }
    this.logger.info("build", "Collecting build info...");
    this.timer.loadStart = performance.now();
    const { assets, allPages } = collectPagesData({
      settings: this.settings,
      logger: this.logger,
      manifest: this.routesList
    });
    this.logger.debug("build", timerMessage("All pages loaded", this.timer.loadStart));
    const pageNames = [];
    this.timer.buildStart = performance.now();
    this.logger.info(
      "build",
      green(`\u2713 Completed in ${getTimeStat(this.timer.init, performance.now())}.`)
    );
    const hasKey = hasEnvironmentKey();
    const keyPromise = hasKey ? getEnvironmentKey() : createKey();
    const opts = {
      allPages,
      settings: this.settings,
      logger: this.logger,
      routesList: this.routesList,
      runtimeMode: this.runtimeMode,
      origin: this.origin,
      pageNames,
      teardownCompiler: this.teardownCompiler,
      viteConfig,
      key: keyPromise
    };
    const { internals, ssrOutputChunkNames } = await viteBuild(opts);
    const hasServerIslands = this.settings.serverIslandNameMap.size > 0;
    if (hasServerIslands && this.settings.buildOutput !== "server") {
      throw new AstroError(AstroErrorData.NoAdapterInstalledServerIslands);
    }
    await staticBuild(opts, internals, ssrOutputChunkNames);
    this.timer.assetsStart = performance.now();
    Object.keys(assets).map((k) => {
      if (!assets[k]) return;
      const filePath = new URL(`file://${k}`);
      fs.mkdirSync(new URL("./", filePath), { recursive: true });
      fs.writeFileSync(filePath, assets[k], "utf8");
      delete assets[k];
    });
    this.logger.debug("build", timerMessage("Additional assets copied", this.timer.assetsStart));
    await runHookBuildDone({
      settings: this.settings,
      pages: pageNames,
      routes: Object.values(allPages).flat().map((pageData) => pageData.route).concat(hasServerIslands ? getServerIslandRouteData(this.settings.config) : []),
      logger: this.logger
    });
    if (this.logger.level && levels[this.logger.level()] <= levels["info"]) {
      await this.printStats({
        logger: this.logger,
        timeStart: this.timer.init,
        pageCount: pageNames.length,
        buildMode: this.settings.buildOutput
        // buildOutput is always set at this point
      });
    }
  }
  /** Build the given Astro project.  */
  async run() {
    this.settings.timer.start("Total build");
    const setupData = await this.setup();
    try {
      await this.build(setupData);
    } catch (_err) {
      throw _err;
    } finally {
      this.settings.timer.end("Total build");
      this.settings.timer.writeStats();
    }
  }
  validateConfig() {
    const { config } = this.settings;
    if (config.outDir.toString() === config.root.toString()) {
      throw new Error(
        `the outDir cannot be the root folder. Please build to a folder such as dist.`
      );
    }
  }
  /** Stats */
  async printStats({
    logger,
    timeStart,
    pageCount,
    buildMode
  }) {
    const total = getTimeStat(timeStart, performance.now());
    let messages = [];
    if (buildMode === "static") {
      messages = [`${pageCount} page(s) built in`, bold(total)];
    } else {
      messages = ["Server built in", bold(total)];
    }
    logger.info("build", messages.join(" "));
    logger.info("build", `${bold("Complete!")}`);
  }
}
export {
  build as default
};
