import type { AUTO_MODE, DARK_MODE, LIGHT_MODE } from "@constants/constants";
import type I18nKey from "@i18n/i18nKey";

export type SiteConfig = {
	title: string;
	subtitle: string;

	lang:
		| "en"
		| "zh_CN"
		| "zh_TW"
		| "ja"
		| "ko"
		| "es"
		| "th"
		| "vi"
		| "tr"
		| "id";

	themeColor: {
		hue: number;
		fixed: boolean;
	};
	banner: {
		enable: boolean;
		src: string;
		position?: "top" | "center" | "bottom";
		credit: {
			enable: boolean;
			text: string;
			url?: string;
		};
	};
	toc: {
		enable: boolean;
		depth: 1 | 2 | 3;
	};

	favicon: Favicon[];
};

export type Favicon = {
	src: string;
	theme?: "light" | "dark";
	sizes?: string;
};

export enum LinkPreset {
	Home = 0,
	Archive = 1,
	About = 2,
	Links = 3,
	Bangumi = 4,
	Music = 5,
	Moments = 6,
	Follows = 7,
	Fans = 8,
	Dynamic = 9,
	Favorites = 10,
}

export type NavBarLink = {
	name: string;
	url: string;
	external?: boolean;
	i18nKey?: I18nKey;
};

export type NavBarConfig = {
	links: (NavBarLink | LinkPreset)[];
};

export type FriendLink = {
	name: string;
	url: string;
	avatar: string;
	desc: string;
	descI18nKey?: I18nKey;
};

export type BangumiConfig = {
	enable: boolean;
	source: "json" | "api";
	uid: string | number;
	type: 1 | 2;
	pn: number;
	ps: number;
	jsonPath: string;
	pageSize: number;
	hidePaginationWhenSinglePage: boolean;
};

export type MusicConfig = {
	enable: boolean;
	source: "json" | "api";
	jsonPath: string;
	apiUrl?: string;
	defaultVolume: number;
};

export type MomentsFeedSource = {
	name: string;
	url: string;
	homepage?: string;
	avatar?: string;
};

export type MomentsConfig = {
	enable: boolean;
	limit: number;
	pageSize: number;
	hidePaginationWhenSinglePage: boolean;
	sources: MomentsFeedSource[];
};

export type FollowsConfig = {
	enable: boolean;
	source: "json" | "api";
	uid: string | number;
	pn: number;
	ps: number;
	jsonPath: string;
	pageSize: number;
	hidePaginationWhenSinglePage: boolean;
};

export type FansConfig = {
	enable: boolean;
	source: "json" | "api";
	uid: string | number;
	pn: number;
	ps: number;
	jsonPath: string;
	pageSize: number;
	hidePaginationWhenSinglePage: boolean;
};

export type DynamicConfig = {
	enable: boolean;
	source: "json" | "api";
	uid: string | number;
	jsonPath: string;
	pageSize: number;
	hidePaginationWhenSinglePage: boolean;
};

export type FavoritesConfig = {
	enable: boolean;
	uid: string | number;
	listSource: "json" | "api";
	listJsonPath: string;
	detailSource: "json" | "api";
	detailJsonDir: string;
	foldersPageSize: number;
	resourcesPageSize: number;
	apiPageSize: number;
	hidePaginationWhenSinglePage: boolean;
};

export type ProfileConfig = {
	avatar?: string;
	name: string;
	bio?: string;
	links: {
		name: string;
		url: string;
		icon: string;
	}[];
};

export type LicenseConfig = {
	enable: boolean;
	name: string;
	url: string;
};

export type LIGHT_DARK_MODE =
	| typeof LIGHT_MODE
	| typeof DARK_MODE
	| typeof AUTO_MODE;

export type BlogPostData = {
	body: string;
	title: string;
	published: Date;
	description: string;
	tags: string[];
	draft?: boolean;
	image?: string;
	category?: string;
	prevTitle?: string;
	prevSlug?: string;
	nextTitle?: string;
	nextSlug?: string;
};

export type ExpressiveCodeConfig = {
	theme: string;
};
