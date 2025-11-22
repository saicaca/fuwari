function adobe(config) {
  return defineAstroFontProvider({
    entrypoint: "astro/assets/fonts/providers/adobe",
    config
  });
}
function bunny() {
  return defineAstroFontProvider({
    entrypoint: "astro/assets/fonts/providers/bunny"
  });
}
function fontshare() {
  return defineAstroFontProvider({
    entrypoint: "astro/assets/fonts/providers/fontshare"
  });
}
function fontsource() {
  return defineAstroFontProvider({
    entrypoint: "astro/assets/fonts/providers/fontsource"
  });
}
function google(config) {
  return defineAstroFontProvider({
    entrypoint: "astro/assets/fonts/providers/google",
    config
  });
}
const fontProviders = {
  adobe,
  bunny,
  fontshare,
  fontsource,
  google
};
function defineAstroFontProvider(provider) {
  return provider;
}
export {
  defineAstroFontProvider,
  fontProviders
};
