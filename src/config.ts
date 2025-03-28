import type {
  LicenseConfig,
  NavBarConfig,
  ProfileConfig,
  SiteConfig,
} from './types/config'
import { LinkPreset } from './types/config'

export const siteConfig: SiteConfig = {
  title: '孔大夫',
  subtitle: '分享博客',
  lang: 'zh_CN',         // 'en', 'zh_CN', 'zh_TW', 'ja', 'ko', 'es', 'th'
  themeColor: {
    hue: 250,         // Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345
    fixed: false,     // Hide the theme color picker for visitors
  },
  banner: {
    enable: false,
    src: 'https://s21.ax1x.com/2025/03/27/pEDvNqK.png',   // Relative to the /src directory. Relative to the /public directory if it starts with '/'
    position: 'center',      // Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default
    credit: {
      enable: true,         // Display the credit text of the banner image
      text: '欢迎光临',              // Credit text to be displayed
      url: ''                // (Optional) URL link to the original artwork or artist's page
    }
  },
  toc: {
    enable: true,           // Display the table of contents on the right side of the post
    depth: 2                // Maximum heading depth to show in the table, from 1 to 3
  },
  favicon: [    // Leave this array empty to use the default favicon
    // {
    //   src: '/favicon/icon.png',    // Path of the favicon, relative to the /public directory
    //   theme: 'light',              // (Optional) Either 'light' or 'dark', set only if you have different favicons for light and dark mode
    //   sizes: '32x32',              // (Optional) Size of the favicon, set only if you have favicons of different sizes
    // }
  ]
}

export const navBarConfig: NavBarConfig = {
  links: [
    LinkPreset.Home,
    LinkPreset.Archive,
    LinkPreset.About,
    {
      name: 'GitHub',
      url: '/posts/vpn/new/',     // Internal links should not include the base path, as it is automatically added
      external: false,                               // Show an external link icon and will open in a new tab
    },
    {
      name: '技术博客',
      url: 'https://blog.kongdf.com',     // Internal links should not include the base path, as it is automatically added
      external: true,                               // Show an external link icon and will open in a new tab
    },
  ],
}

export const profileConfig: ProfileConfig = {
  avatar: 'https://s21.ax1x.com/2025/03/27/pEDOOde.jpg',  // Relative to the /src directory. Relative to the /public directory if it starts with '/'
  name: '孔大夫',
  bio: '热爱互联网的一切.',
  links: [
    {
      name: 'GitHub',
      icon: 'fa6-brands:github',
      url: 'https://github.com/kongdf',
    }, {
      name: '技术博客',
      icon: 'logos:blogger',
      url: 'https://blog.kongdf.com',
    },

    // Visit https://icones.js.org/ for icon codes
    // You will need to install the corresponding icon set if it's not already included
    // `pnpm add @iconify-json/<icon-set-name>`
  ], links2: [
    {
      name: 'GitHub',
      icon: 'fa6-brands:github',
      url: 'https://github.com/kongdf',
    }, {
      name: '技术博客',
      icon: 'logos:blogger',
      url: 'https://blog.kongdf.com',
    },

    // Visit https://icones.js.org/ for icon codes
    // You will need to install the corresponding icon set if it's not already included
    // `pnpm add @iconify-json/<icon-set-name>`
  ],
}

export const licenseConfig: LicenseConfig = {
  enable: true,
  name: 'CC BY-NC-SA 4.0',
  url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
}
