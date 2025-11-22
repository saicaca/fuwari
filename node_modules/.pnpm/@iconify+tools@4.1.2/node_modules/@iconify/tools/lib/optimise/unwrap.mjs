function unwrapEmptyGroup(svg) {
  const cheerio = svg.$svg;
  const $root = svg.$svg(":root");
  const children = $root.children();
  if (children.length !== 1 || children[0].tagName !== "g") {
    return;
  }
  const groupNode = children[0];
  const html = cheerio(groupNode).html();
  if (!html) {
    return;
  }
  for (const attr in groupNode.attribs) {
    const value = groupNode.attribs[attr];
    switch (attr) {
      case "id": {
        if (html?.includes(value)) {
          return;
        }
        break;
      }
      default:
        return;
    }
  }
  $root.html(html);
}

export { unwrapEmptyGroup };
