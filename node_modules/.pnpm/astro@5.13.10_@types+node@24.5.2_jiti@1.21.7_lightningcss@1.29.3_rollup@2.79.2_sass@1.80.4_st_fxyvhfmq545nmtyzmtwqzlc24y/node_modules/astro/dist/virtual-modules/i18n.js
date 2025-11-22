import { IncorrectStrategyForI18n } from "../core/errors/errors-data.js";
import { AstroError } from "../core/errors/index.js";
import * as I18nInternals from "../i18n/index.js";
import { toFallbackType, toRoutingStrategy } from "../i18n/utils.js";
import { normalizeTheLocale, toCodes, toPaths } from "../i18n/index.js";
const { trailingSlash, format, site, i18n, isBuild } = (
  // @ts-expect-error
  __ASTRO_INTERNAL_I18N_CONFIG__
);
const { defaultLocale, locales, domains, fallback, routing } = i18n;
const base = import.meta.env.BASE_URL;
let strategy = toRoutingStrategy(routing, domains);
let fallbackType = toFallbackType(routing);
const noop = (method) => function() {
  throw new AstroError({
    ...IncorrectStrategyForI18n,
    message: IncorrectStrategyForI18n.message(method)
  });
};
const getRelativeLocaleUrl = (locale, path, options) => I18nInternals.getLocaleRelativeUrl({
  locale,
  path,
  base,
  trailingSlash,
  format,
  defaultLocale,
  locales,
  strategy,
  domains,
  ...options
});
const getAbsoluteLocaleUrl = (locale, path, options) => I18nInternals.getLocaleAbsoluteUrl({
  locale,
  path,
  base,
  trailingSlash,
  format,
  site,
  defaultLocale,
  locales,
  strategy,
  domains,
  isBuild,
  ...options
});
const getRelativeLocaleUrlList = (path, options) => I18nInternals.getLocaleRelativeUrlList({
  base,
  path,
  trailingSlash,
  format,
  defaultLocale,
  locales,
  strategy,
  domains,
  ...options
});
const getAbsoluteLocaleUrlList = (path, options) => I18nInternals.getLocaleAbsoluteUrlList({
  site,
  base,
  path,
  trailingSlash,
  format,
  defaultLocale,
  locales,
  strategy,
  domains,
  isBuild,
  ...options
});
const getPathByLocale = (locale) => I18nInternals.getPathByLocale(locale, locales);
const getLocaleByPath = (path) => I18nInternals.getLocaleByPath(path, locales);
const pathHasLocale = (path) => I18nInternals.pathHasLocale(path, locales);
let redirectToDefaultLocale;
if (i18n?.routing === "manual") {
  redirectToDefaultLocale = I18nInternals.redirectToDefaultLocale({
    base,
    trailingSlash,
    format,
    defaultLocale,
    locales,
    strategy,
    domains,
    fallback,
    fallbackType
  });
} else {
  redirectToDefaultLocale = noop("redirectToDefaultLocale");
}
let notFound;
if (i18n?.routing === "manual") {
  notFound = I18nInternals.notFound({
    base,
    trailingSlash,
    format,
    defaultLocale,
    locales,
    strategy,
    domains,
    fallback,
    fallbackType
  });
} else {
  notFound = noop("notFound");
}
let requestHasLocale;
if (i18n?.routing === "manual") {
  requestHasLocale = I18nInternals.requestHasLocale(locales);
} else {
  requestHasLocale = noop("requestHasLocale");
}
let redirectToFallback;
if (i18n?.routing === "manual") {
  redirectToFallback = I18nInternals.redirectToFallback({
    base,
    trailingSlash,
    format,
    defaultLocale,
    locales,
    strategy,
    domains,
    fallback,
    fallbackType
  });
} else {
  redirectToFallback = noop("useFallback");
}
let middleware;
if (i18n?.routing === "manual") {
  middleware = (customOptions) => {
    strategy = toRoutingStrategy(customOptions, {});
    fallbackType = toFallbackType(customOptions);
    const manifest = {
      ...i18n,
      strategy,
      domainLookupTable: {},
      fallbackType,
      fallback: i18n.fallback
    };
    return I18nInternals.createMiddleware(manifest, base, trailingSlash, format);
  };
} else {
  middleware = noop("middleware");
}
export {
  getAbsoluteLocaleUrl,
  getAbsoluteLocaleUrlList,
  getLocaleByPath,
  getPathByLocale,
  getRelativeLocaleUrl,
  getRelativeLocaleUrlList,
  middleware,
  normalizeTheLocale,
  notFound,
  pathHasLocale,
  redirectToDefaultLocale,
  redirectToFallback,
  requestHasLocale,
  toCodes,
  toPaths
};
