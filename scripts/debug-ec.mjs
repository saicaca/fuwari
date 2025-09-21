import { ExpressiveCodeEngine } from "ec/core";
import { loadShikiTheme } from "ec/shiki";
import {
  ecDefaultProps,
  ecEnginePlugins,
  ecStyleOverrides,
  ecTheme,
} from "../src/plugins/expressive-code/shared-config.ts";

const themeObj = await loadShikiTheme(ecTheme);
const engine = new ExpressiveCodeEngine({
  themes: [themeObj, themeObj],
  plugins: ecEnginePlugins(),
  defaultProps: ecDefaultProps,
  styleOverrides: ecStyleOverrides,
});

const result = await engine.render({
  code: 'echo "This terminal frame has no title"',
  language: "bash",
  props: { frame: "terminal" },
});
console.dir(result.renderedGroupContents[0].codeBlock.props, { depth: 5 });
console.log(JSON.stringify(result.renderedGroupAst, null, 2));
