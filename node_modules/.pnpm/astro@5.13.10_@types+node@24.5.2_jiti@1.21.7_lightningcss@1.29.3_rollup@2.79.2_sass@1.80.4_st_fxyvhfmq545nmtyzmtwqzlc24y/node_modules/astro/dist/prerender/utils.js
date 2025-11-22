import { getOutDirWithinCwd } from "../core/build/common.js";
function getPrerenderDefault(config) {
  return config.output !== "server";
}
function getServerOutputDirectory(settings) {
  return settings.buildOutput === "server" ? settings.config.build.server : getOutDirWithinCwd(settings.config.outDir);
}
function getClientOutputDirectory(settings) {
  return settings.buildOutput === "server" ? settings.config.build.client : settings.config.outDir;
}
export {
  getClientOutputDirectory,
  getPrerenderDefault,
  getServerOutputDirectory
};
