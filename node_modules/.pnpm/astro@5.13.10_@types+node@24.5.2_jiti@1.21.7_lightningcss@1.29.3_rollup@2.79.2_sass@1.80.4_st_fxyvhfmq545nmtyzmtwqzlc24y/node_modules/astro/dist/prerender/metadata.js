import { viteID } from "../core/util.js";
function getPrerenderStatus({
  filePath,
  loader
}) {
  const fileID = viteID(filePath);
  const moduleInfo = loader.getModuleInfo(fileID);
  if (!moduleInfo) return;
  const prerenderStatus = getPrerenderMetadata(moduleInfo);
  return prerenderStatus;
}
function getPrerenderMetadata(moduleInfo) {
  return moduleInfo?.meta?.astro?.pageOptions?.prerender;
}
export {
  getPrerenderMetadata,
  getPrerenderStatus
};
