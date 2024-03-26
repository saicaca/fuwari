import type {
  LicenseConfig,
  NavBarConfig,
  ProfileConfig,
  SiteConfig,
} from './types/config'
import { LinkPreset } from './types/config'

export const siteConfig: SiteConfig = {
  title: 'Yash Rahurikar',
  subtitle: 'Personal blog',
  lang: 'en',
  themeHue: 250,
  banner: {
    enable: false,
    src: 'assets/images/demo-banner.png',
  },
}

export const navBarConfig: NavBarConfig = {
  links: [
    LinkPreset.Home,
    LinkPreset.Archive,
    LinkPreset.About,
    // {
    //   name: 'GitHub',
    //   url: 'https://github.com/saicaca/fuwari',
    //   external: true,
    // },
  ],
}

export const profileConfig: ProfileConfig = {
  avatar: 'assets/images/profile_avatar.png',
  name: 'Yash Rahurikar',
  bio: 'Product Engineer',
  links: [
    {
      name: 'Twitter',
      icon: 'fa6-brands:twitter',
      url: 'https://twitter.com/rahurikar_yash',
    },
    {
      name: 'Linkedin',
      icon: 'fa6-brands:linkedin',
      url: 'https://www.linkedin.com/in/yash-rahurikar-aa445a44/',
    },
    {
      name: 'GitHub',
      icon: 'fa6-brands:github',
      url: 'https://github.com/yashrahurikar23',
    },
  ],
}

export const licenseConfig: LicenseConfig = {
  enable: true,
  name: 'CC BY-NC-SA 4.0',
  url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
}
