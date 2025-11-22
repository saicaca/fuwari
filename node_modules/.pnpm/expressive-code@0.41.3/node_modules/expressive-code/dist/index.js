// src/index.ts
import { ExpressiveCodeEngine } from "@expressive-code/core";
import { pluginFrames } from "@expressive-code/plugin-frames";
import { pluginShiki } from "@expressive-code/plugin-shiki";
import { pluginTextMarkers } from "@expressive-code/plugin-text-markers";
export * from "@expressive-code/core";
export * from "@expressive-code/plugin-frames";
export * from "@expressive-code/plugin-shiki";
export * from "@expressive-code/plugin-text-markers";
var ExpressiveCode = class extends ExpressiveCodeEngine {
  constructor({ shiki, textMarkers, frames, ...baseConfig } = {}) {
    const pluginsToPrepend = [];
    const baseConfigPlugins = baseConfig.plugins?.flat() || [];
    const notPresentInPlugins = (name) => baseConfigPlugins.every((plugin) => plugin.name !== name);
    if (shiki !== false && notPresentInPlugins("Shiki")) {
      pluginsToPrepend.push(pluginShiki(shiki !== true ? shiki : void 0));
    }
    if (textMarkers !== false && notPresentInPlugins("TextMarkers")) {
      if (typeof textMarkers === "object" && textMarkers.styleOverrides) {
        throw new Error(
          `The Expressive Code config option "textMarkers" can no longer be an object,
					but only undefined or a boolean. Please move any style settings into the
					top-level "styleOverrides" object below the new "textMarkers" key.`.replace(/\s+/g, " ")
        );
      }
      pluginsToPrepend.push(pluginTextMarkers());
    }
    if (frames !== false && notPresentInPlugins("Frames")) {
      if (typeof frames === "object" && frames.styleOverrides) {
        throw new Error(
          `The config option "frames" no longer has its own "styleOverrides" object.
					Please move any style settings into the top-level "styleOverrides" object
					below the new "frames" key.`.replace(/\s+/g, " ")
        );
      }
      pluginsToPrepend.push(pluginFrames(frames !== true ? frames : void 0));
    }
    const pluginsWithDefaults = [...pluginsToPrepend, ...baseConfig.plugins || []];
    super({ ...baseConfig, plugins: pluginsWithDefaults });
  }
};
export {
  ExpressiveCode
};
//# sourceMappingURL=index.js.map