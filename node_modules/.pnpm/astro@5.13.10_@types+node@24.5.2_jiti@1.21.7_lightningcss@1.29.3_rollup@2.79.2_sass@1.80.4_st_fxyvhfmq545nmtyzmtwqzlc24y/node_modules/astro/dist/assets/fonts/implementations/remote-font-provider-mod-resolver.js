function createBuildRemoteFontProviderModResolver() {
  return {
    resolve(id) {
      return import(id);
    }
  };
}
function createDevServerRemoteFontProviderModResolver({
  server
}) {
  return {
    resolve(id) {
      return server.ssrLoadModule(id);
    }
  };
}
export {
  createBuildRemoteFontProviderModResolver,
  createDevServerRemoteFontProviderModResolver
};
