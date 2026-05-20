import I18nKey from "./i18n/i18nKey";
import type {
	BangumiConfig as BangumiConfigType,
	DynamicConfig as DynamicConfigType,
	ExpressiveCodeConfig,
	FansConfig as FansConfigType,
	FavoritesConfig as FavoritesConfigType,
	FollowsConfig as FollowsConfigType,
	FriendLink,
	LicenseConfig,
	MusicConfig as MusicConfigType,
	MomentsConfig as MomentsConfigType,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "Chenxi's Blog",
	subtitle: "114514",
	lang: "zh_CN", // 语言代码, e.g. 'en', 'zh_CN', 'ja', etc.
	themeColor: {
		hue: 250, // Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345
		fixed: false, // Hide the theme color picker for visitors
	},
	banner: {
		enable: false,
		src: "/gthlwp0.jpg", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
		position: "center", // Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default
		credit: {
			enable: false, // Display the credit text of the banner image
			text: "", // Credit text to be displayed
			url: "", // (Optional) URL link to the original artwork or artist's page
		},
	},
	toc: {
		enable: true, // Display the table of contents on the right side of the post
		depth: 2, // Maximum heading depth to show in the table, from 1 to 3
	},
	favicon: [
		// Leave this array empty to use the default favicon
		// {
		//   src: '/favicon/icon.png',    // Path of the favicon, relative to the /public directory
		//   theme: 'light',              // (Optional) Either 'light' or 'dark', set only if you have different favicons for light and dark mode
		//   sizes: '32x32',              // (Optional) Size of the favicon, set only if you have favicons of different sizes
		// }
	],
};

export const BangumiConfig: BangumiConfigType = {
	enable: true,
	source: "api", // json: 读取 src/data/bangumi.json；api: 构建时请求 B 站接口，目前风控不严重，建议使用 api
	uid: 3546871542843760,
	type: 1, // 1: 追番, 2: 追剧
	pn: 1, // 请求页码
	ps: 30, // 请求个数，必须在 30 及以下
	jsonPath: "src/data/bangumi.json", // B 站 API 原始返回格式，用于对抗风控
	pageSize: 8, // 每页展示数量
	hidePaginationWhenSinglePage: true, // 只有一页时隐藏底部分页
};

export const MusicConfig: MusicConfigType = {
	enable: true,
	source: "json", // json: 读取 src/data/music.json；api: 请求 MusicConfig.apiUrl
	jsonPath: "src/data/music.json",
	apiUrl: "",
	defaultVolume: 0.72,
};

export const MomentsConfig: MomentsConfigType = {
	enable: true,
	limit: 30, // 多个 RSS 源合并后的最大展示条数
	pageSize: 8, // 每页展示数量
	hidePaginationWhenSinglePage: true, // 只有一页时隐藏底部分页
	sources: [
		// {
		// 	name: "示例博客",
		// 	url: "https://example.com/rss.xml",
		// 	homepage: "https://example.com",
		// 	avatar: "https://example.com/avatar.png",
		// },
		{
			name: "CDNJS",
			url: "https://status.cdnjs.com/history.rss",
			homepage: "https://status.cdnjs.com/",
			avatar: "https://cdnjs.com/_/f7a2ebfb819c118086546e481876aef6.svg",
		},
	],
};

export const FollowsConfig: FollowsConfigType = {
	enable: true,
	source: "json", // json: 读取 src/data/follows.json；api: 构建时请求 B 站接口，容易触发风控失败
	uid: 3546871542843760, // 即 B 站 vmid
	pn: 1, // 构建时请求页码
	ps: 50, // 构建时请求个数
	jsonPath: "src/data/follows.json", // B 站 API 原始返回格式，用于对抗风控
	pageSize: 16, // 每页展示数量
	hidePaginationWhenSinglePage: true, // 只有一页时隐藏底部分页
};

export const FansConfig: FansConfigType = {
	enable: true,
	source: "json", // json: 读取 src/data/fans.json；api: 构建时请求 B 站接口，容易触发风控失败
	uid: 3546871542843760, // 即 B 站 vmid
	pn: 1, // 构建时请求页码
	ps: 50, // 构建时请求个数
	jsonPath: "src/data/fans.json", // B 站 API 原始返回格式，用于对抗风控
	pageSize: 16, // 每页展示数量
	hidePaginationWhenSinglePage: true, // 只有一页时隐藏底部分页
};

export const DynamicConfig: DynamicConfigType = {
	enable: true,
	source: "json", // json: 读取 src/data/dynamic.json；api: 构建时请求 B 站接口，容易触发风控失败
	uid: 3546871542843760, // 即 B 站 host_mid
	jsonPath: "src/data/dynamic.json", // B 站 API 原始返回格式，用于对抗风控
	pageSize: 8, // 每页展示数量
	hidePaginationWhenSinglePage: true, // 只有一页时隐藏底部分页
};

export const FavoritesConfig: FavoritesConfigType = {
	enable: true,
	uid: 3546871542843760, // 即 B 站 up_mid
	listSource: "api", // json: 读取 src/data/favorites.json；api: 构建时请求收藏夹列表
	listJsonPath: "src/data/favorites.json",
	detailSource: "api", // json: 读取 src/data/favs/{mediaId}.json；api: 构建时请求收藏夹视频列表
	detailJsonDir: "src/data/favs",
	foldersPageSize: 12,
	resourcesPageSize: 12,
	apiPageSize: 40,
	hidePaginationWhenSinglePage: true,
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.About,
		LinkPreset.Links,
		/* ...(MomentsConfig.enable ? [LinkPreset.Moments] : []), */ // 朋友圈不建议放在导航栏
		/* ...(BangumiConfig.enable ? [LinkPreset.Bangumi] : []), */ // 追番不建议放在导航栏
		/* ...(FollowsConfig.enable ? [LinkPreset.Follows] : []), */ // B 站关注不建议放在导航栏
		/* ...(FansConfig.enable ? [LinkPreset.Fans] : []), */ // B 站粉丝不建议放在导航栏
		/* ...(DynamicConfig.enable ? [LinkPreset.Dynamic] : []), */ // B 站动态不建议放在导航栏
		/* ...(FavoritesConfig.enable ? [LinkPreset.Favorites] : []), */ // B 站收藏夹不建议放在导航栏
		{
			name: "其他",
			url: "/other/", // Internal links should not include the base path, as it is automatically added
			external: false, // Show an external link icon and will open in a new tab
			i18nKey: I18nKey.other,
		},
	],
};

export const linksConfig: FriendLink[] = [
	{
		name: "GitHub",
		url: "https://github.com",
		avatar: "https://github.com/github.png",
		desc: "GitHub 是一个面向开源及私有软件项目的托管平台",
		descI18nKey: I18nKey.friendGithubDescription,
	},
	{
		name: "OpenAI",
		url: "https://openai.com",
		avatar: "https://github.com/openai.png",
		desc: "ChatGPT",
		descI18nKey: I18nKey.friendOpenAIDescription,
	},
	{
		name: "哔哩哔哩",
		url: "https://www.bilibili.com",
		avatar: "https://www.bilibili.com/favicon.ico",
		desc: "哔哩哔哩",
		descI18nKey: I18nKey.friendBilibiliDescription,
	},
	{
		name: "X",
		url: "https://x.com",
		avatar: "https://x.com/favicon.ico",
		desc: "社交平台",
		descI18nKey: I18nKey.friendXDescription,
	},
	{
		name: "Discord",
		url: "https://discord.com",
		avatar:
			"https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/62fddf0fde45a8baedcc7ee5_847541504914fd33810e70a0ea73177e%20(2)-1.png",
		desc: "Discord 是一个流行的聊天和社交平台",
		descI18nKey: I18nKey.friendDiscordDescription,
	},
	{
		name: "Cloudflare",
		url: "https://cloudflare.com",
		avatar: "https://cloudflare.com/favicon.ico",
		desc: "赛博活佛",
		descI18nKey: I18nKey.friendCloudflareDescription,
	},
];

export const profileConfig: ProfileConfig = {
	avatar: "/avatar.jpg", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	name: "Chenxi",
	bio: "114514",
	links: [
		{
			name: "哔哩哔哩",
			icon: "fa6-brands:bilibili",
			url: "https://space.bilibili.com/3546871542843760",
		},
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/zjhcx",
		},
		{
			name: "X",
			icon: "fa6-brands:x-twitter", // Visit https://icones.js.org/ for icon codes
			// You will need to install the corresponding icon set if it's not already included
			// `pnpm add @iconify-json/<icon-set-name>`
			url: "https://x.com/zjhcx",
		},
		{
			name: "Discord",
			icon: "fa6-brands:discord",
			url: "https://discord.com/users/1498586217070202910",
		},
		{
			name: "Reddit",
			icon: "fa6-brands:reddit",
			url: "https://www.reddit.com/user/zjhcx/",
		},
		{
			name: "YouTube",
			icon: "fa6-brands:youtube",
			url: "https://www.youtube.com/@zjhcx",
		},
		{
			name: "TikTok",
			icon: "fa6-brands:tiktok",
			url: "https://www.tiktok.com/@zjhcx12",
		},
		{
			name: "Facebook",
			icon: "fa6-brands:facebook",
			url: "https://www.facebook.com/profile.php?id=61589201685052",
		},
		{
			name: "Instagram",
			icon: "fa6-brands:instagram",
			url: "https://www.instagram.com/zjhcx12/",
		},
		{
			name: "Threads",
			icon: "fa6-brands:threads",
			url: "https://www.threads.com/@zjhcx12",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// Note: Some styles (such as background color) are being overridden, see the astro.config.mjs file.
	// Please select a dark theme, as this blog theme currently only supports dark background color
	theme: "github-dark",
};
