import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { LinkPreset, type NavBarLink } from "@/types/config";

export const LinkPresets: { [key in LinkPreset]: NavBarLink } = {
	[LinkPreset.Home]: {
		name: i18n(I18nKey.home),
		url: "/",
	},
	[LinkPreset.About]: {
		name: i18n(I18nKey.profile),
		url: "/profile/",
	},
	[LinkPreset.Archive]: {
		name: i18n(I18nKey.archive),
		url: "/archive/",
	},
	[LinkPreset.Portfolio]: {
		name: i18n(I18nKey.portfolio),
		url: "/portfolio/",
	},
};
