import { TypstFileComponent } from "../typst/components/tfile.mjs";
import { TypstSvgComponent } from "../typst/components/tsvg.mjs";
import { AdmonitionComponent } from "./rehype-component-admonition.mjs";
import { GithubCardComponent } from "./rehype-component-github-card.mjs";

export const componentMap = {
  github: GithubCardComponent,
  tfile: TypstFileComponent,
  tsvg: TypstSvgComponent,
  note: (x, y) => AdmonitionComponent(x, y, "note"),
  tip: (x, y) => AdmonitionComponent(x, y, "tip"),
  important: (x, y) => AdmonitionComponent(x, y, "important"),
  caution: (x, y) => AdmonitionComponent(x, y, "caution"),
  warning: (x, y) => AdmonitionComponent(x, y, "warning"),
};
