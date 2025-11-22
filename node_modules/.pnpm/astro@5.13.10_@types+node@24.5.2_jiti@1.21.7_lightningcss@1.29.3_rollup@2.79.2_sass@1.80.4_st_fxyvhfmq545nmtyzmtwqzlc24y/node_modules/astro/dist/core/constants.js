const ASTRO_VERSION = "5.13.10";
const REROUTE_DIRECTIVE_HEADER = "X-Astro-Reroute";
const REWRITE_DIRECTIVE_HEADER_KEY = "X-Astro-Rewrite";
const REWRITE_DIRECTIVE_HEADER_VALUE = "yes";
const NOOP_MIDDLEWARE_HEADER = "X-Astro-Noop";
const ROUTE_TYPE_HEADER = "X-Astro-Route-Type";
const DEFAULT_404_COMPONENT = "astro-default-404.astro";
const REDIRECT_STATUS_CODES = [301, 302, 303, 307, 308, 300, 304];
const REROUTABLE_STATUS_CODES = [404, 500];
const clientAddressSymbol = Symbol.for("astro.clientAddress");
const clientLocalsSymbol = Symbol.for("astro.locals");
const originPathnameSymbol = Symbol.for("astro.originPathname");
const responseSentSymbol = Symbol.for("astro.responseSent");
const SUPPORTED_MARKDOWN_FILE_EXTENSIONS = [
  ".markdown",
  ".mdown",
  ".mkdn",
  ".mkd",
  ".mdwn",
  ".md"
];
const MIDDLEWARE_PATH_SEGMENT_NAME = "middleware";
export {
  ASTRO_VERSION,
  DEFAULT_404_COMPONENT,
  MIDDLEWARE_PATH_SEGMENT_NAME,
  NOOP_MIDDLEWARE_HEADER,
  REDIRECT_STATUS_CODES,
  REROUTABLE_STATUS_CODES,
  REROUTE_DIRECTIVE_HEADER,
  REWRITE_DIRECTIVE_HEADER_KEY,
  REWRITE_DIRECTIVE_HEADER_VALUE,
  ROUTE_TYPE_HEADER,
  SUPPORTED_MARKDOWN_FILE_EXTENSIONS,
  clientAddressSymbol,
  clientLocalsSymbol,
  originPathnameSymbol,
  responseSentSymbol
};
