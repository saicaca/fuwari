import { defineConfig } from 'astro/config';
import yaml from '@rollup/plugin-yaml';
import icon from "astro-icon";

import tailwind from "@astrojs/tailwind";
import {remarkReadingTime} from "./src/plugins/remark-reading-time.mjs";

import Color from 'colorjs.io';

// https://astro.build/config


const oklchToHex = function (str) {
  const DEFAULT_HUE = 250;
  const regex = /-?\d+(\.\d+)?/g;
  const matches = str.string.match(regex);
  const lch = [matches[0], matches[1], DEFAULT_HUE];
  return new Color("oklch", lch).to("srgb").toString({format: "hex"});
}

export default defineConfig({
  integrations: [
    tailwind(),
    icon({
      include: {
        'material-symbols': ['*'],
        'fa6-brands': ['*']
      }
    })
  ],
  markdown: {
    remarkPlugins: [remarkReadingTime],
  },
  redirects: {
    '/': '/page/1',
  },
  vite: {
    plugins: [yaml()],
    css: {
      preprocessorOptions: {
        stylus: {
          define: {
            oklchToHex: oklchToHex
          }
        }
      }
    }
  },
});