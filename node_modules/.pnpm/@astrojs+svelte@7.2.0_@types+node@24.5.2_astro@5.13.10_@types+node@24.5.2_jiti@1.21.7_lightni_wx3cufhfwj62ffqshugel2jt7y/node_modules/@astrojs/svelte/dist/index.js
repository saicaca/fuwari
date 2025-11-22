import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";
function getRenderer() {
  return {
    name: "@astrojs/svelte",
    clientEntrypoint: "@astrojs/svelte/client.js",
    serverEntrypoint: "@astrojs/svelte/server.js"
  };
}
function getContainerRenderer() {
  return {
    name: "@astrojs/svelte",
    serverEntrypoint: "@astrojs/svelte/server.js"
  };
}
function svelteIntegration(options) {
  return {
    name: "@astrojs/svelte",
    hooks: {
      "astro:config:setup": async ({ updateConfig, addRenderer }) => {
        addRenderer(getRenderer());
        updateConfig({
          vite: {
            optimizeDeps: {
              include: ["@astrojs/svelte/client.js"],
              exclude: ["@astrojs/svelte/server.js"]
            },
            plugins: [svelte(options)]
          }
        });
      }
    }
  };
}
export {
  svelteIntegration as default,
  getContainerRenderer,
  vitePreprocess
};
