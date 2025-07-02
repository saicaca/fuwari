import eslint from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import eslintPluginAstro from "eslint-plugin-astro";

export default [
	eslint.configs.recommended,
	{
		files: ["**/*.{js,mjs,cjs,ts,tsx}"],
		languageOptions: {
			parser: tsparser,
			parserOptions: {
				ecmaVersion: "latest",
				sourceType: "module",
			},
			globals: {
				// 浏览器全局变量
				window: "readonly",
				document: "readonly",
				localStorage: "readonly",
				HTMLElement: "readonly",
				NodeListOf: "readonly",
				URL: "readonly",
				Response: "readonly",
				ImageMetadata: "readonly", // Astro 图片类型
			},
		},
		plugins: {
			"@typescript-eslint": tseslint,
		},
		rules: {
			// 基础 TypeScript 规则
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
				},
			],
			"@typescript-eslint/no-explicit-any": "off", // 临时允许 any 类型
			"no-console": "warn",
			// 对于某些特殊情况，放宽规则
			"no-unused-vars": [
				"warn",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_|^[A-Z]", // 允许大写开头的变量（通常是类型或枚举）
					ignoreRestSiblings: true,
				},
			],
			"no-undef": "off", // 关闭未定义变量检查，TypeScript 会处理这个
		},
	},
	// Astro 文件配置
	...eslintPluginAstro.configs["flat/recommended"],
	{
		files: ["**/*.astro"],
		rules: {
			// 对 Astro 文件的特殊规则
			"@typescript-eslint/no-unused-vars": "off", // Astro 组件中的变量可能在模板中使用
			"no-unused-vars": "off", // Astro 组件中的变量可能在模板中使用
			"astro/no-unused-define-vars-in-style": "warn", // 降级为警告
		},
	},
	// 忽略文件
	{
		ignores: [
			"dist/",
			".astro/",
			"node_modules/",
			"*.config.js",
			"*.config.mjs",
			"*.config.ts",
		],
	},
];
