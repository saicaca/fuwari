import type {
  LicenseConfig,
  NavBarConfig,
  ProfileConfig,
  SiteConfig,
} from './types/config'
import { LinkPreset } from './types/config'

export const siteConfig: SiteConfig = {
  title: 'Fuwari',
  subtitle: 'Demo Site',
  siteUrl: 'https://fuwari.vercel.app',
  lang: 'en',
  themeHue: 250,
  banner: {
    enable: true,
    src: 'assets/images/demo-banner.png',
  },
  license: "x备xxxxxxxx号-1"
}

export const navBarConfig: NavBarConfig = {
  links: [
    LinkPreset.Home,
    LinkPreset.Archive,
    LinkPreset.About,
    {
      name: 'GitHub',
      url: 'https://github.com/saicaca/fuwari',
      external: true,
    },
  ],
}

/**
 * @description website profiles, add new two options
 */
export const profileConfig: ProfileConfig = {
  avatar: 'assets/images/demo-avatar.png',
  name: 'Lorem Ipsum',
  bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  links: [
    // {
    //   name: 'Twitter',
    //   icon: 'fa6-brands:twitter',
    //   url: 'https://twitter.com',
    // },
    // {
    //   name: 'Steam',
    //   icon: 'fa6-brands:steam',
    //   url: 'https://store.steampowered.com',
    // },
    {
      name: 'GitHub',
      icon: 'fa6-brands:github',
      url: 'https://github.com/',
    },
    {
      name: 'E-mail',
      icon: 'material-symbols:mail',
      url: 'mailto:frostisle@163.com',
    },
    {
      name: 'BIliBili',
      icon: 'fa6-brands:bilibili',
      url: 'https://www.bilibili.com/',
    },
  ],
}

export const licenseConfig: LicenseConfig = {
  name: 'CC BY-NC-SA 4.0',
  url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
}