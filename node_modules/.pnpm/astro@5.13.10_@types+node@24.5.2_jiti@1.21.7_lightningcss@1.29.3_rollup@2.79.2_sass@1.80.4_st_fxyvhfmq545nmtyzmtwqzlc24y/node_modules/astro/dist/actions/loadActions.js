import { ActionsCantBeLoaded } from "../core/errors/errors-data.js";
import { AstroError } from "../core/errors/index.js";
import { ASTRO_ACTIONS_INTERNAL_MODULE_ID } from "./consts.js";
async function loadActions(moduleLoader) {
  try {
    return await moduleLoader.import(ASTRO_ACTIONS_INTERNAL_MODULE_ID);
  } catch (error) {
    throw new AstroError(ActionsCantBeLoaded, { cause: error });
  }
}
export {
  loadActions
};
