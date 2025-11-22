function routeIsRedirect(route) {
  return route?.type === "redirect";
}
function routeIsFallback(route) {
  return route?.type === "fallback";
}
export {
  routeIsFallback,
  routeIsRedirect
};
