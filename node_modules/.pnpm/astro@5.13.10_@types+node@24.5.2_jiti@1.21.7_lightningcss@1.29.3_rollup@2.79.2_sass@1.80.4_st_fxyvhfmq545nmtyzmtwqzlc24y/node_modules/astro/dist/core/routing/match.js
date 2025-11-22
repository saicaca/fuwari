import { redirectIsExternal } from "../redirects/render.js";
import { SERVER_ISLAND_BASE_PREFIX, SERVER_ISLAND_COMPONENT } from "../server-islands/endpoint.js";
function matchRoute(pathname, manifest) {
  return manifest.routes.find((route) => {
    return route.pattern.test(pathname) || route.fallbackRoutes.some((fallbackRoute) => fallbackRoute.pattern.test(pathname));
  });
}
function matchAllRoutes(pathname, manifest) {
  return manifest.routes.filter((route) => route.pattern.test(pathname));
}
const ROUTE404_RE = /^\/404\/?$/;
const ROUTE500_RE = /^\/500\/?$/;
function isRoute404(route) {
  return ROUTE404_RE.test(route);
}
function isRoute500(route) {
  return ROUTE500_RE.test(route);
}
function isRoute404or500(route) {
  return isRoute404(route.route) || isRoute500(route.route);
}
function isRouteServerIsland(route) {
  return route.component === SERVER_ISLAND_COMPONENT;
}
function isRequestServerIsland(request, base = "") {
  const url = new URL(request.url);
  const pathname = base === "/" ? url.pathname.slice(base.length) : url.pathname.slice(base.length + 1);
  return pathname.startsWith(SERVER_ISLAND_BASE_PREFIX);
}
function requestIs404Or500(request, base = "") {
  const url = new URL(request.url);
  const pathname = url.pathname.slice(base.length);
  return isRoute404(pathname) || isRoute500(pathname);
}
function isRouteExternalRedirect(route) {
  return !!(route.type === "redirect" && route.redirect && redirectIsExternal(route.redirect));
}
export {
  isRequestServerIsland,
  isRoute404,
  isRoute404or500,
  isRoute500,
  isRouteExternalRedirect,
  isRouteServerIsland,
  matchAllRoutes,
  matchRoute,
  requestIs404Or500
};
