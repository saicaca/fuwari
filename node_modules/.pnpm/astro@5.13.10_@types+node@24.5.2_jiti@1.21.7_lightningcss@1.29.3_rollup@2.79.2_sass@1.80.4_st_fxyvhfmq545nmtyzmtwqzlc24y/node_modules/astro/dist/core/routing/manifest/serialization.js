import { getRouteGenerator } from "./generator.js";
function serializeRouteData(routeData, trailingSlash) {
  return {
    ...routeData,
    generate: void 0,
    pattern: routeData.pattern.source,
    redirectRoute: routeData.redirectRoute ? serializeRouteData(routeData.redirectRoute, trailingSlash) : void 0,
    fallbackRoutes: routeData.fallbackRoutes.map((fallbackRoute) => {
      return serializeRouteData(fallbackRoute, trailingSlash);
    }),
    _meta: { trailingSlash }
  };
}
function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}
export {
  deserializeRouteData,
  serializeRouteData
};
