import fs from "node:fs/promises";
const frontmatterRE = /^---(.*?)^---/ms;
async function loadId(pluginContainer, id) {
  const result = await pluginContainer.load(id, { ssr: true });
  if (result) {
    if (typeof result === "string") {
      return result;
    } else {
      return result.code;
    }
  }
  try {
    return await fs.readFile(id, "utf-8");
  } catch {
  }
}
export {
  frontmatterRE,
  loadId
};
