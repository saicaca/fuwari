import { EventEmitter } from "node:events";
function createLoader(overrides) {
  return {
    import() {
      throw new Error(`Not implemented`);
    },
    resolveId(id) {
      return Promise.resolve(id);
    },
    getModuleById() {
      return void 0;
    },
    getModulesByFile() {
      return void 0;
    },
    getModuleInfo() {
      return null;
    },
    eachModule() {
      throw new Error(`Not implemented`);
    },
    invalidateModule() {
    },
    fixStacktrace() {
    },
    clientReload() {
    },
    webSocketSend() {
    },
    isHttps() {
      return true;
    },
    events: new EventEmitter(),
    ...overrides
  };
}
export {
  createLoader
};
