import { visit } from "unist-util-visit";
function rehypeImages() {
  return function(tree, file) {
    if (!file.data.astro?.localImagePaths?.length && !file.data.astro?.remoteImagePaths?.length) {
      return;
    }
    const imageOccurrenceMap = /* @__PURE__ */ new Map();
    visit(tree, "element", (node) => {
      if (node.tagName !== "img") return;
      if (typeof node.properties?.src !== "string") return;
      const src = decodeURI(node.properties.src);
      let newProperties;
      if (file.data.astro?.localImagePaths?.includes(src)) {
        newProperties = { ...node.properties, src };
      } else if (file.data.astro?.remoteImagePaths?.includes(src)) {
        newProperties = {
          // By default, markdown images won't have width and height set. However, just in case another user plugin does set these, we should respect them.
          inferSize: "width" in node.properties && "height" in node.properties ? void 0 : true,
          ...node.properties,
          src
        };
      } else {
        return;
      }
      const index = imageOccurrenceMap.get(node.properties.src) || 0;
      imageOccurrenceMap.set(node.properties.src, index + 1);
      node.properties = { __ASTRO_IMAGE_: JSON.stringify({ ...newProperties, index }) };
    });
  };
}
export {
  rehypeImages
};
