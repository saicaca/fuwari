/** Main configuration for Fuwari. */
export type SiteConfig = {
  /** Site title. Shown in site tab, site */
  title: string
  /** Site subtitle. Shown in site tab */
  subtitle: string

  /** The language code (e.g., 'en', 'ja', 'zh_CN') */
  lang: string

  /** The site theme hue */
  themeColor: {
    /** Default hue for the theme color, from 0 to 360.
     * - e.g. red: 0, teal: 200, cyan: 250, pink: 345 */
    hue: number
    /** Hide the theme color picker for visitors */
    fixed: boolean
  }

  /** The main site banner */
  banner: {
    /** Whether to display the banner */
    enable: boolean
    /** The URL of the banner image
     * - Relative to the /src directory.
     * - Relative to the /public directory if it starts with '/' */
    src: string
  }

  /** A flag indicating whether to enable the Open Graph image. */
  siteOGImage: {
    /** A flag indicating whether to enable the Open Graph image. */
    enable: boolean,
    /** The URL of the site OG image
     * - This image SHOULD be in the public folder.
     * - Public assets can be referenced directly using a / . */
    src: string
  }

  /** A flag indicating whether to enable dynamic Open Graph generation (defaults to false). */
  postOGImageDynamic: boolean


  /** The favicon fo the site */
  favicon: Favicon[]
}

/** Represents the Favicon of the blog */
export type Favicon = {
  /** Path of the favicon, relative to the /public directory */
  src: string,
  /** Either 'light' or 'dark'.
   * - Set only if you have different favicons for light and dark mode */
  theme?: 'light' | 'dark'
  /** Size of the favicon, set only if you have favicons of different sizes */
  sizes?: string
}

/** Integrated link presets */
export enum LinkPreset {
  /** A link to the home page */
  Home = 0,
  /** A link to the archive page */
  Archive = 1,
  /** A link to the about page */
  About = 2,
}

/** Represents a navbar link */
export type NavBarLink = {
  /** The text displayed for the link in the navbar */
  name: string
  /** The URL that the link points to.
   * - Internal links should not include the base path, as it is automatically added */
  url: string
  /** Show an external link icon and will open in a new tab */
  external?: boolean
}

/** Represents the navbar configuration */
export type NavBarConfig = {
  /** An array of navigation bar links or link presets */
  links: (NavBarLink | LinkPreset)[]
}

/** Represents the main profile/author */
export type ProfileConfig = {
  /** An optional URL to the user's avatar image
   * - Relative to the /src directory.
   * - Relative to the /public directory if it starts with '/'
   */
  avatar?: string
  /** Author name  */
  name: string
  /** An optional bio or description of the author */
  bio?: string
  /** An array of author social media/other links */
  links: {
    /** The name of the resource */
    name: string
    /** The URL of the resource */
    url: string
    /** The icon to be shown for the resource
     * - Visit https://icones.js.org/ for icon codes
     * - You will need to install the corresponding icon set if it's not already included
     * - Examples: 'fa6-brands:twitter', 'fa6-brands:steam', 'fa6-brands:github'
     * 
     * pnpm add \@iconify-json\/\<icon-set-name\>
     */
    icon: string
  }[]
}

/** Represents the license preference for posts */
export type LicenseConfig = {
  /** Whether to display the license information at the end of the page */
  enable: boolean
  /** The name of the license */
  name: string
  /** The URL of the license document */
  url: string
}