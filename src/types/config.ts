import type Giscus from 'giscus'
import type { LIGHT_MODE, DARK_MODE, AUTO_MODE } from "@constants/constants"

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
    position?: string
  }

  favicon: Favicon[]
}

export type Favicon = {
  src: string
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

export type LIGHT_DARK_MODE = typeof LIGHT_MODE | typeof DARK_MODE | typeof AUTO_MODE

export type CommentConfig = {
  twikoo?: TwikooConfig
  disqus?: DisqusConfig
  giscus?: GiscusConfig
}

type TwikooConfig = {
  envId: string
  region?: string
  lang?: string
}

type DisqusConfig = {
  shortname: string
}

type GiscusConfig = {
  repo: Giscus.Repo
  repoId?: string
  category?: string
  categoryId?: string
  mapping?: Giscus.Mapping
  term?: string
  strict: Giscus.BooleanString
  reactionsEnabled: Giscus.BooleanString
  emitMetadata: Giscus.BooleanString
  inputPosition: Giscus.InputPosition
  theme: Giscus.Theme
  lang: Giscus.AvailableLanguage
  loading: Giscus.Loading
}
