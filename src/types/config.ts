export type SiteConfig = {
  title: string
  subtitle: string

  lang: string

  themeColor: {
    hue: number
    fixed: boolean
  }
  banner: {
    enable: boolean
    src: string
  }

  /**
   * Generate Open Graph images dynamically for markdown posts.
   * - You can view the example fuwari post to view more information and customize the OG content.
   */
  dynamicOGImage: {
    /** A flag indicating whether to enable dynamic Open Graph generation (defaults to false). */
    enable: boolean
    /** Optional customization for the Open Graph image generation. Merged with defaults.
     * ```js
     * // This is the default configuration
     * { title: data.title, description: data.description }
     * ```
     * @see https://github.com/delucis/astro-og-canvas/tree/latest/packages/astro-og-canvas
     */
    config: Record<string, any>
  }

  favicon: Favicon[]
}

export type Favicon = {
  src: string,
  theme?: 'light' | 'dark'
  sizes?: string
}

export enum LinkPreset {
  Home = 0,
  Archive = 1,
  About = 2,
}

export type NavBarLink = {
  name: string
  url: string
  external?: boolean
}

export type NavBarConfig = {
  links: (NavBarLink | LinkPreset)[]
}

export type ProfileConfig = {
  avatar?: string
  name: string
  bio?: string
  links: {
    name: string
    url: string
    icon: string
  }[]
}

export type LicenseConfig = {
  enable: boolean
  name: string
  url: string
}
