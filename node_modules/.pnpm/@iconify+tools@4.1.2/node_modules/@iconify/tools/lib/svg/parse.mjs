function parseSVG(svg, callback) {
  const cheerio = svg.$svg;
  const $root = svg.$svg(":root");
  function checkNode(element, parents) {
    if (element.type !== "tag") {
      return;
    }
    const $element = cheerio(element);
    const tagName = element.tagName;
    const item = {
      tagName,
      element,
      $element,
      svg,
      parents,
      testChildren: true,
      removeNode: false
    };
    const callbackResult = callback(item);
    if (callbackResult instanceof Promise) {
      throw new Error("parseSVG does not support async callbacks");
    }
    const newParents = parents.slice(0);
    newParents.unshift(item);
    let queue = [];
    if (tagName !== "style" && item.testChildren && !item.removeNode) {
      const children = $element.children().toArray();
      queue = children.slice(0);
    }
    while (queue.length) {
      const queueItem = queue.shift();
      if (!queueItem || item.removeNode) {
        break;
      }
      checkNode(queueItem, newParents);
    }
    if (item.removeNode) {
      $element.remove();
    }
  }
  checkNode($root.get(0), []);
}

export { parseSVG };
