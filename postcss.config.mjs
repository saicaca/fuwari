import autoprefixer from "autoprefixer";
import postcssImport from "postcss-import";
import tailwindcss from "tailwindcss";
import postcssNesting from "tailwindcss/nesting/index.js";

// Plugin: replace vendor-only -webkit-text-size-adjust with standard text-size-adjust
function textSizeAdjustFix() {
  return {
    postcssPlugin: "text-size-adjust-fix",
    Declaration(decl) {
      if (decl.prop === "-webkit-text-size-adjust") {
        // Insert standard property and drop the vendor-only one
        decl.cloneBefore({ prop: "text-size-adjust", value: decl.value });
        decl.remove();
      }
    },
  };
}
textSizeAdjustFix.postcss = true;

// Plugin: ensure Safari supports user-select by adding -webkit-user-select
function userSelectPrefixFix() {
  return {
    postcssPlugin: "user-select-prefix-fix",
    Declaration(decl) {
      if (decl.prop === "user-select") {
        const siblings = decl.parent.nodes || [];
        const hasWebkit = siblings.some(
          (n) => n.type === "decl" && n.prop === "-webkit-user-select",
        );
        if (!hasWebkit) {
          decl.cloneBefore({ prop: "-webkit-user-select", value: decl.value });
        }
      }
    },
  };
}
userSelectPrefixFix.postcss = true;

export default {
  plugins: [
    // combine multiple css files
    postcssImport(),
    // nesting support compatible with Tailwind
    postcssNesting(),
    // Tailwind (emits preflight/base + utilities)
    tailwindcss(),
    // Generic vendor prefixer based on Browserslist
    autoprefixer(),
    // then fix text-size-adjust for audits without losing preflight
    textSizeAdjustFix(),
    // and ensure -webkit-user-select is present for Safari
    userSelectPrefixFix(),
  ],
};
