<script lang="ts">
import { onMount } from "svelte";
import { commentConfig } from "@/config";

let container: HTMLElement;

onMount(async () => {
	if (!commentConfig.enable || commentConfig.type !== "waline") return;
	const { init } = await import("@waline/client");
	await import("@waline/client/style");

	init({
		el: container,
		serverURL: commentConfig.waline.serverURL,
		lang: commentConfig.waline.lang,
		dark: "html.dark",
		pageSize: commentConfig.waline.pageSize,
		wordLimit: commentConfig.waline.wordLimit,
		pageview: commentConfig.waline.pageview,
		reaction: commentConfig.waline.reaction,
		requiredMeta: commentConfig.waline.requiredMeta,
		// 可以在这里自定义 emoji
		emoji: [
			"//unpkg.com/@waline/emojis@1.2.0/weibo",
			"//unpkg.com/@waline/emojis@1.2.0/bilibili",
		],
	});
});
</script>

<div class="waline-wrapper">
    <div bind:this={container}></div>
</div>

<style is:global>
  /* --- Waline 美化样式 --- */
  :root {
    /* 1. 颜色适配：让按钮和高亮色跟随主题 */
    --waline-theme-color: var(--primary);
    --waline-active-color: var(--primary);
    
    /* 2. 字体与背景适配 */
    --waline-font-size: 1rem;
    --waline-bg-color: transparent; /* 让它透出 card-base 的背景 */
    --waline-bg-color-light: var(--card-bg); 
    
    /* 3. 边框与圆角：跟随 Fuwari 的圆润风格 */
    --waline-border-color: var(--line-divider);
    --waline-avatar-radius: 50%;
    --waline-box-shadow: none; /* 去掉默认阴影，以免双重阴影 */
  }

  /* 暗黑模式适配微调 */
  html.dark {
    --waline-border-color: rgba(255, 255, 255, 0.1);
    --waline-bgcolor: #1e1e1e;
    --waline-bgcolor-light: #2a2a2a;
  }

  /* --- 细节修饰 --- */
  
  /* 输入框美化 */
  .wl-editor {
    transition: all 0.3s ease;
    border-radius: 1rem !important; /* 更大的圆角 */
    padding: 1rem !important;
    background: var(--btn-content) !important; /* 使用主题的淡色背景 */
  }
  .wl-editor:focus-within {
    background: var(--card-bg) !important;
    box-shadow: 0 0 0 2px var(--primary) !important;
  }

  /* 按钮美化 */
  .wl-btn.primary {
    border-radius: 0.75rem !important;
    border: none !important;
    background: var(--primary) !important;
    color: white !important;
    box-shadow: 0 4px 10px -2px var(--primary-20) !important;
  }

  /* 去掉多余的版权信息边距 */
  .wl-power {
    margin-top: 0.5rem !important;
    font-size: 0.75rem !important;
  }
  
  /* 调整卡片内部间距 */
  .waline-wrapper {
    margin-top: 0.5rem;
  }
</style>