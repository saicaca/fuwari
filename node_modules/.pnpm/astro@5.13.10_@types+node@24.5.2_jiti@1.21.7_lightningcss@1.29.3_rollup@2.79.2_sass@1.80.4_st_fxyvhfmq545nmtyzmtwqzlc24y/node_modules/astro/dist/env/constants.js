const VIRTUAL_MODULES_IDS = {
  client: "astro:env/client",
  server: "astro:env/server",
  internal: "virtual:astro:env/internal"
};
const VIRTUAL_MODULES_IDS_VALUES = new Set(Object.values(VIRTUAL_MODULES_IDS));
const ENV_TYPES_FILE = "env.d.ts";
const PKG_BASE = new URL("../../", import.meta.url);
const MODULE_TEMPLATE_URL = new URL("templates/env.mjs", PKG_BASE);
export {
  ENV_TYPES_FILE,
  MODULE_TEMPLATE_URL,
  VIRTUAL_MODULES_IDS,
  VIRTUAL_MODULES_IDS_VALUES
};
