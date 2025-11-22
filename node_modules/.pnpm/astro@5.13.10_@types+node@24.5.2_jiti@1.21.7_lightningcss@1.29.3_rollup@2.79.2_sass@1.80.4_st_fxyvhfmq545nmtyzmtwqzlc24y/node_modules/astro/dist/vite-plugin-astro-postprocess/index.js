import { parse } from "acorn";
import { walk } from "estree-walker";
import MagicString from "magic-string";
import { isMarkdownFile } from "../core/util.js";
const ASTRO_GLOB_REGEX = /Astro2?\s*\.\s*glob\s*\(/;
function astro() {
  return {
    name: "astro:postprocess",
    async transform(code, id) {
      if (!id.endsWith(".astro") && !isMarkdownFile(id)) {
        return null;
      }
      if (!ASTRO_GLOB_REGEX.test(code)) {
        return null;
      }
      let s;
      const ast = parse(code, {
        ecmaVersion: "latest",
        sourceType: "module"
      });
      walk(ast, {
        enter(node) {
          if (node.type === "CallExpression" && node.callee.type === "MemberExpression" && node.callee.property.name === "glob" && (node.callee.object.name === "Astro" || node.callee.object.name === "Astro2") && node.arguments.length) {
            const firstArgStart = node.arguments[0].start;
            const firstArgEnd = node.arguments[0].end;
            const lastArgEnd = node.arguments[node.arguments.length - 1].end;
            const firstArg = code.slice(firstArgStart, firstArgEnd);
            s ??= new MagicString(code);
            s.overwrite(
              firstArgStart,
              lastArgEnd,
              `import.meta.glob(${firstArg}), () => ${firstArg}`
            );
          }
        }
      });
      if (s) {
        return {
          code: s.toString(),
          map: s.generateMap({ hires: "boundary" })
        };
      }
    }
  };
}
export {
  astro as default
};
