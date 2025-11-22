import * as z from "zod";
import { defineLiveCollection } from "../content/config.js";
function createErrorFunction(message) {
  return () => {
    const error = new Error(`The ${message}() function is not available in live config files.`);
    const stackLines = error.stack?.split("\n");
    if (stackLines && stackLines.length > 1) {
      stackLines.splice(1, 1);
      error.stack = stackLines.join("\n");
    }
    throw error;
  };
}
const getCollection = createErrorFunction("getCollection");
const render = createErrorFunction("render");
const getEntry = createErrorFunction("getEntry");
const getEntryBySlug = createErrorFunction("getEntryBySlug");
const getDataEntryById = createErrorFunction("getDataEntryById");
const getEntries = createErrorFunction("getEntries");
const reference = createErrorFunction("reference");
const getLiveCollection = createErrorFunction("getLiveCollection");
const getLiveEntry = createErrorFunction("getLiveEntry");
const defineCollection = createErrorFunction("defineCollection");
export {
  defineCollection,
  defineLiveCollection,
  getCollection,
  getDataEntryById,
  getEntries,
  getEntry,
  getEntryBySlug,
  getLiveCollection,
  getLiveEntry,
  reference,
  render,
  z
};
