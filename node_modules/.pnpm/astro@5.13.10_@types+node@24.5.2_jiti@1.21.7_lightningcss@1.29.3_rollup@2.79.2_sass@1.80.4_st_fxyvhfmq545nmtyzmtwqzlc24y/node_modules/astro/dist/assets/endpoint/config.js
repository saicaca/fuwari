import {
  removeLeadingForwardSlash,
  removeTrailingForwardSlash
} from "@astrojs/internal-helpers/path";
import { resolveInjectedRoute } from "../../core/routing/manifest/create.js";
import { getPattern } from "../../core/routing/manifest/pattern.js";
function injectImageEndpoint(settings, manifest, mode, cwd) {
  manifest.routes.unshift(getImageEndpointData(settings, mode, cwd));
}
function getImageEndpointData(settings, mode, cwd) {
  const endpointEntrypoint = settings.config.image.endpoint.entrypoint === void 0 ? mode === "dev" ? "astro/assets/endpoint/node" : "astro/assets/endpoint/generic" : settings.config.image.endpoint.entrypoint;
  const segments = [
    [
      {
        content: removeTrailingForwardSlash(
          removeLeadingForwardSlash(settings.config.image.endpoint.route)
        ),
        dynamic: false,
        spread: false
      }
    ]
  ];
  return {
    type: "endpoint",
    isIndex: false,
    route: settings.config.image.endpoint.route,
    pattern: getPattern(segments, settings.config.base, settings.config.trailingSlash),
    segments,
    params: [],
    component: resolveInjectedRoute(endpointEntrypoint, settings.config.root, cwd).component,
    generate: () => "",
    pathname: settings.config.image.endpoint.route,
    prerender: false,
    fallbackRoutes: [],
    origin: "internal"
  };
}
export {
  injectImageEndpoint
};
