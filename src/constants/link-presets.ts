import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { BangumiConfig } from "@/config";
import { LinkPreset, type NavBarLink } from "@/types/config";

export const LinkPresets: { [key in LinkPreset]: NavBarLink } = {
	[LinkPreset.Home]: {
		name: i18n(I18nKey.home),
		url: "/",
		i18nKey: I18nKey.home,
	},
	[LinkPreset.About]: {
		name: i18n(I18nKey.about),
		url: "/about/",
		i18nKey: I18nKey.about,
	},
	[LinkPreset.Archive]: {
		name: i18n(I18nKey.archive),
		url: "/archive/",
		i18nKey: I18nKey.archive,
	},
	[LinkPreset.Links]: {
		name: i18n(I18nKey.links),
		url: "/links/",
		i18nKey: I18nKey.links,
	},
	[LinkPreset.Bangumi]: {
		name: i18n(
			BangumiConfig.type === 2 ? I18nKey.bangumiDrama : I18nKey.bangumi,
		),
		url: "/bangumi/",
		i18nKey: BangumiConfig.type === 2 ? I18nKey.bangumiDrama : I18nKey.bangumi,
	},
	[LinkPreset.Music]: {
		name: i18n(I18nKey.music),
		url: "/music/",
		i18nKey: I18nKey.music,
	},
	[LinkPreset.Moments]: {
		name: i18n(I18nKey.moments),
		url: "/moments/",
		i18nKey: I18nKey.moments,
	},
	[LinkPreset.Follows]: {
		name: i18n(I18nKey.follows),
		url: "/follows/",
		i18nKey: I18nKey.follows,
	},
	[LinkPreset.Fans]: {
		name: i18n(I18nKey.fans),
		url: "/fans/",
		i18nKey: I18nKey.fans,
	},
	[LinkPreset.Dynamic]: {
		name: i18n(I18nKey.dynamic),
		url: "/dynamic/",
		i18nKey: I18nKey.dynamic,
	},
	[LinkPreset.Favorites]: {
		name: i18n(I18nKey.favs),
		url: "/favs/",
		i18nKey: I18nKey.favs,
	},
};
