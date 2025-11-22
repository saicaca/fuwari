function createDataCollector({
  hasUrl,
  saveUrl,
  savePreload,
  saveFontData
}) {
  return {
    collect({ hash, url, init, preload, data }) {
      if (!hasUrl(hash)) {
        saveUrl({ hash, url, init });
        if (preload) {
          savePreload(preload);
        }
      }
      saveFontData({ hash, url, data, init });
    }
  };
}
export {
  createDataCollector
};
