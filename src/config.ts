import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "1zyq1 Blog - 技术博客与编程分享",
	subtitle: "分享技术心得、编程经验与个人成长 | Protect What You Love",
	lang: "zh_CN",
	themeColor: {
		hue: 360,
		fixed: false,
	},
	banner: {
		enable: false,
		src: "https://t.alcy.cc/ycy",
		position: "center",
		credit: {
			enable: false,
			text: "",
			url: "",
		},
	},
	// 添加背景配置
	background: {
		enable: true, // 启用背景图片
		src: "https://t.alcy.cc/ycy", // 背景图片URL
		position: "center", // 背景位置
		size: "cover", // 背景大小
		repeat: "no-repeat", // 背景重复
		attachment: "fixed", // 背景附着
		opacity: 0.95, // 95% 不透明，背景清晰但仍有层次感 - 注意：此属性会影响整个元素的透明度，包括其内容。
	},
	toc: {
		enable: true,
		depth: 2,
	},
	favicon: [],

	officialSites: [
		{ url: "https://www.1zyq1.com", alias: "EdgeOne" }, // 添加官方站点
		{ url: "https://vercel.blog.1zyq1.com", alias: "Vercel" }, // vercel 站点
		{ url: "https://netlify.blog.1zyq1.com", alias: "Netlify" }, // netlify 站点
	],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.About,
		{
			name: "友链",
			url: "friends/",
			external: false,
		},
		{
			name: "统计",
			url: "https://cloud.umami.is/share/grZsgWAQzr0s5BVo",
			external: true,
		},
		{
			name: "服务状态",
			url: "https://uptimekuma.1zyq1.com/status/default",
			external: true,
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "https://q1.qlogo.cn/g?b=qq&nk=2289308183&s=640",
	name: "1zyq1",
	bio: "Protect What You Love./爱你所爱！",
	links: [
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/1zyq1",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	theme: "github-dark",
};
