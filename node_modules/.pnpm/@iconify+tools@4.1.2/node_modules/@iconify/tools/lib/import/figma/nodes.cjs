'use strict';

function getFigmaIconNodes(document, options) {
  const nodes = {
    icons: /* @__PURE__ */ Object.create(null)
  };
  let found = 0;
  const check = (node, parents) => {
    const iconNodeType = node.type;
    switch (iconNodeType) {
      case "COMPONENT":
      case "INSTANCE":
      case "FRAME": {
        const iconNode = node;
        if (iconNode.absoluteBoundingBox) {
          const box = iconNode.absoluteBoundingBox;
          const item = {
            ...node,
            type: iconNodeType,
            width: box.width,
            height: box.height,
            parents
          };
          const keyword = options.iconNameForNode(
            item,
            nodes,
            document
          );
          if (typeof keyword === "string") {
            found++;
            nodes.icons[node.id] = {
              id: node.id,
              name: node.name,
              keyword
            };
            return;
          }
          if (keyword && typeof keyword === "object" && typeof keyword.keyword === "string") {
            found++;
            nodes.icons[node.id] = {
              ...keyword,
              id: node.id,
              name: node.name
            };
            return;
          }
        }
        break;
      }
    }
    if (!node.children) {
      return;
    }
    const parentNodeType = node.type;
    switch (parentNodeType) {
      case "CANVAS":
      case "FRAME":
      case "GROUP":
      case "SECTION":
      case "COMPONENT_SET": {
        const parentItem = {
          ...node,
          type: parentNodeType
        };
        const newParents = parents.concat([parentItem]);
        if (!parents.length && options.pages) {
          const allowedPages = options.pages;
          if (!allowedPages.includes(node.id) && !allowedPages.includes(node.name.trim())) {
            return;
          }
        } else {
          if (options.filterParentNode && !options.filterParentNode(newParents, document)) {
            return;
          }
        }
        node.children.forEach((childNode) => {
          check(childNode, newParents);
        });
        break;
      }
    }
  };
  document.document.children.forEach((node) => {
    check(node, []);
  });
  nodes.nodesCount = found;
  return nodes;
}

exports.getFigmaIconNodes = getFigmaIconNodes;
