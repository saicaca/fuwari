function vitePluginFileURL() {
  return {
    name: "astro:vite-plugin-file-url",
    enforce: "pre",
    resolveId(source, importer) {
      if (source.startsWith("file://")) {
        const rest = source.slice(7);
        return this.resolve(rest, importer);
      }
    }
  };
}
export {
  vitePluginFileURL as default
};
