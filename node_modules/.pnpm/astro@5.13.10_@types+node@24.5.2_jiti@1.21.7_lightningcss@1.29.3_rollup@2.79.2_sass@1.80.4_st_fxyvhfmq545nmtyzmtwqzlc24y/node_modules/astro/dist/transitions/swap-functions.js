const PERSIST_ATTR = "data-astro-transition-persist";
const NON_OVERRIDABLE_ASTRO_ATTRS = ["data-astro-transition", "data-astro-transition-fallback"];
const scriptsAlreadyRan = /* @__PURE__ */ new Set();
function detectScriptExecuted(script) {
  const key = script.src ? new URL(script.src, location.href).href : script.textContent;
  if (scriptsAlreadyRan.has(key)) return true;
  scriptsAlreadyRan.add(key);
  return false;
}
function deselectScripts(doc) {
  for (const s2 of doc.scripts) {
    if (
      // Check if the script should be rerun regardless of it being the same
      !s2.hasAttribute("data-astro-rerun") && // Check if the script has already been executed
      detectScriptExecuted(s2)
    ) {
      s2.dataset.astroExec = "";
    }
  }
}
function swapRootAttributes(newDoc) {
  const currentRoot = document.documentElement;
  const nonOverridableAstroAttributes = [...currentRoot.attributes].filter(
    ({ name }) => (currentRoot.removeAttribute(name), NON_OVERRIDABLE_ASTRO_ATTRS.includes(name))
  );
  [...newDoc.documentElement.attributes, ...nonOverridableAstroAttributes].forEach(
    ({ name, value }) => currentRoot.setAttribute(name, value)
  );
}
function swapHeadElements(doc) {
  for (const el of Array.from(document.head.children)) {
    const newEl = persistedHeadElement(el, doc);
    if (newEl) {
      newEl.remove();
    } else {
      el.remove();
    }
  }
  document.head.append(...doc.head.children);
}
function swapBodyElement(newElement, oldElement) {
  oldElement.replaceWith(newElement);
  for (const el of oldElement.querySelectorAll(`[${PERSIST_ATTR}]`)) {
    const id = el.getAttribute(PERSIST_ATTR);
    const newEl = newElement.querySelector(`[${PERSIST_ATTR}="${id}"]`);
    if (newEl) {
      newEl.replaceWith(el);
      if (newEl.localName === "astro-island" && shouldCopyProps(el) && !isSameProps(el, newEl)) {
        el.setAttribute("ssr", "");
        el.setAttribute("props", newEl.getAttribute("props"));
      }
    }
  }
  attachShadowRoots(newElement);
}
function attachShadowRoots(root) {
  root.querySelectorAll("template[shadowrootmode]").forEach((template) => {
    const mode = template.getAttribute("shadowrootmode");
    const parent = template.parentNode;
    if ((mode === "closed" || mode === "open") && parent instanceof HTMLElement) {
      const shadowRoot = parent.attachShadow({ mode });
      shadowRoot.appendChild(template.content);
      template.remove();
      attachShadowRoots(shadowRoot);
    }
  });
}
const saveFocus = () => {
  const activeElement = document.activeElement;
  if (activeElement?.closest(`[${PERSIST_ATTR}]`)) {
    if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
      const start = activeElement.selectionStart;
      const end = activeElement.selectionEnd;
      return () => restoreFocus({ activeElement, start, end });
    }
    return () => restoreFocus({ activeElement });
  } else {
    return () => restoreFocus({ activeElement: null });
  }
};
const restoreFocus = ({ activeElement, start, end }) => {
  if (activeElement) {
    activeElement.focus();
    if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
      if (typeof start === "number") activeElement.selectionStart = start;
      if (typeof end === "number") activeElement.selectionEnd = end;
    }
  }
};
const persistedHeadElement = (el, newDoc) => {
  const id = el.getAttribute(PERSIST_ATTR);
  const newEl = id && newDoc.head.querySelector(`[${PERSIST_ATTR}="${id}"]`);
  if (newEl) {
    return newEl;
  }
  if (el.matches("link[rel=stylesheet]")) {
    const href = el.getAttribute("href");
    return newDoc.head.querySelector(`link[rel=stylesheet][href="${href}"]`);
  }
  return null;
};
const shouldCopyProps = (el) => {
  const persistProps = el.dataset.astroTransitionPersistProps;
  return persistProps == null || persistProps === "false";
};
const isSameProps = (oldEl, newEl) => {
  return oldEl.getAttribute("props") === newEl.getAttribute("props");
};
const swapFunctions = {
  deselectScripts,
  swapRootAttributes,
  swapHeadElements,
  swapBodyElement,
  saveFocus
};
const swap = (doc) => {
  deselectScripts(doc);
  swapRootAttributes(doc);
  swapHeadElements(doc);
  const restoreFocusFunction = saveFocus();
  swapBodyElement(doc.body, document.body);
  restoreFocusFunction();
};
export {
  deselectScripts,
  detectScriptExecuted,
  restoreFocus,
  saveFocus,
  swap,
  swapBodyElement,
  swapFunctions,
  swapHeadElements,
  swapRootAttributes
};
