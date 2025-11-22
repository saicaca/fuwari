export * from "./shared.js";
function defineAction() {
  throw new Error("[astro:action] `defineAction()` unexpectedly used on the client.");
}
function getActionContext() {
  throw new Error("[astro:action] `getActionContext()` unexpectedly used on the client.");
}
export {
  defineAction,
  getActionContext
};
