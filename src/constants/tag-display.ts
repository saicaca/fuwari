/**
 * Tag 显示名称映射表
 *
 * key: 文章 frontmatter 中的 tag slug（英文小写，用于 URL）
 * value: 页面上显示的名称（中文或可读形式）
 *
 * 不在映射表中的 tag 会直接显示原值（fallback）。
 * 后期新增 tag 时只需在此文件添加一行映射即可。
 */
export const tagDisplayMap: Record<string, string> = {
	// ── 环境配置 ──
	"env-setup": "环境配置",

	// ── 摄影 ──
	photography: "摄影",
	"photo-set": "照片集",
	camera: "相机",

	// ── 算法 / 刷题 ──
	algorithm: "算法",
	note: "笔记",

	// ── 教程 / 演示 ──
	demo: "演示",
	tutorial: "教程",
	guide: "指南",

	// ── 安全 ──
	security: "安全",
	steganography: "文件隐写",
	file: "文件",
	openpgp: "OpenPGP",
	yubikey: "YubiKey",
	gnupg: "GnuPG",

	// ── Web / 网络 ──
	web: "Web",
	cdn: "CDN",
	cloudflare: "Cloudflare",
	proxy: "代理",
	clash: "Clash",
	"mobile-network": "移动网络",
	esim: "eSIM",
	voxi: "VOXI",
	giffgaff: "giffgaff",

	// ── 工具 / 工程化 ──
	tooling: "工程化",
	"claude-code": "Claude Code",
	codex: "Codex",
	ai: "AI",
	ssh: "SSH",
	sftp: "SFTP",
	rclone: "rclone",
	fuse: "FUSE",
	android: "Android",
	kotlin: "Kotlin",
	gradle: "Gradle",
	adb: "ADB",

	// ── 大小写修正（英文工具名保持原样，仅纠正拼写） ──
	cpp: "C++",
	python: "Python",
	micromamba: "micromamba",
	markdown: "Markdown",
	macos: "macOS",
	ntfs: "NTFS",
	storage: "磁盘存储",
	vscode: "VS Code",
	shell: "Shell",
	ml: "机器学习",
	leetcode: "LeetCode",
	pta: "PTA",
	video: "视频",
	"expressive-code": "Expressive Code",
	"oh-my-zsh": "Oh My Zsh",
	linux: "Linux",
	windows: "Windows",
	tailcat: "Tailcat",

	// ── iOS 侧载 ──
	ios: "iOS",
	iphone: "iPhone",
	sidestore: "SideStore",
	livecontainer: "LiveContainer",
	sideload: "侧载",
	// ── 环境与工具 ──
	conda: "Conda",
	zsh: "Zsh",
	astro: "Astro",
	mihomo: "Mihomo",
	p10k: "Powerlevel10k",
	docker: "Docker",
	orbstack: "OrbStack",
	"apple-container": "Apple Container",
	devops: "DevOps",
};

/**
 * 根据 tag slug 获取显示名称。
 * 如果映射表中没有对应的键，返回原值作为 fallback。
 */
export function getTagDisplayName(tag: string): string {
	return tagDisplayMap[tag] ?? tag;
}
