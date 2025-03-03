---
title: 增强Fuwari的代码块功能
published: 2025-02-26
updated: 2025-02-28
description: '安装Expressive Code插件'
image: 'https://expressive-code.com/open-graph/index.png'
tags: [Fuwari, Astro, Shiki, 博客]
category: '前端'
draft: false 
lang: ''
series: "改造博客"
---

:::note[前言]
这是代替[旧方案](/posts/frontend/old_code_block/)的新方案<br>
`Expressive Code`是 shiki 代码块的一个增强插件<br>
:::

https://expressive-code.com/

:::important[重要]
Fuwari的版本不同可能会导致代码位置和本博文中描述的不一致
:::

## 去除Fuwari自带的代码块样式

注释掉以下代码

```astro title="src\components\misc\Markdown.astro"
<!-- <script>
  const observer = new MutationObserver(addPreCopyButton);
  observer.observe(document.body, { childList: true, subtree: true });
  
  document.addEventListener("DOMContentLoaded", addPreCopyButton);

  function addPreCopyButton() {
    observer.disconnect();
    
    let codeBlocks = Array.from(document.querySelectorAll("pre"));

    for (let codeBlock of codeBlocks) {
      if (codeBlock.parentElement?.nodeName === "DIV" && codeBlock.parentElement?.classList.contains("code-block")) continue

      let wrapper = document.createElement("div");
      wrapper.className = "relative code-block";

      let copyButton = document.createElement("button");
      copyButton.className = "copy-btn btn-regular-dark absolute active:scale-90 h-8 w-8 top-2 right-2 opacity-75 text-sm p-1.5 rounded-lg transition-all ease-in-out";

      codeBlock.setAttribute("tabindex", "0");
      if (codeBlock.parentNode) {
        codeBlock.parentNode.insertBefore(wrapper, codeBlock);
      }

      let copyIcon = `<svg class="copy-btn-icon copy-icon" xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px"><path d="M368.37-237.37q-34.48 0-58.74-24.26-24.26-24.26-24.26-58.74v-474.26q0-34.48 24.26-58.74 24.26-24.26 58.74-24.26h378.26q34.48 0 58.74 24.26 24.26 24.26 24.26 58.74v474.26q0 34.48-24.26 58.74-24.26 24.26-58.74 24.26H368.37Zm0-83h378.26v-474.26H368.37v474.26Zm-155 238q-34.48 0-58.74-24.26-24.26-24.26-24.26-58.74v-515.76q0-17.45 11.96-29.48 11.97-12.02 29.33-12.02t29.54 12.02q12.17 12.03 12.17 29.48v515.76h419.76q17.45 0 29.48 11.96 12.02 11.97 12.02 29.33t-12.02 29.54q-12.03 12.17-29.48 12.17H213.37Zm155-238v-474.26 474.26Z"/></svg>`
      let successIcon = `<svg class="copy-btn-icon success-icon" xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px"><path d="m389-377.13 294.7-294.7q12.58-12.67 29.52-12.67 16.93 0 29.61 12.67 12.67 12.68 12.67 29.53 0 16.86-12.28 29.14L419.07-288.41q-12.59 12.67-29.52 12.67-16.94 0-29.62-12.67L217.41-430.93q-12.67-12.68-12.79-29.45-.12-16.77 12.55-29.45 12.68-12.67 29.62-12.67 16.93 0 29.28 12.67L389-377.13Z"/></svg>`
      copyButton.innerHTML = `<div>${copyIcon} ${successIcon}</div>
      `

      wrapper.appendChild(codeBlock);
      wrapper.appendChild(copyButton);

      let timeout: ReturnType<typeof setTimeout>;
      copyButton.addEventListener("click", async () => {
        if (timeout) {
            clearTimeout(timeout);
        }
        let text = codeBlock?.querySelector("code")?.innerText;
        if (text === undefined) return;
        await navigator.clipboard.writeText(text);
        copyButton.classList.add("success");
        timeout = setTimeout(() => {
          copyButton.classList.remove("success");
        }, 1000);
      });
    }
    
    observer.observe(document.body, { childList: true, subtree: true });
  }
</script> -->
```
```css title="src\styles\markdown.css"
  /* pre {
        @apply bg-[var(--codeblock-bg)] !important;
        @apply rounded-xl px-5;

        code {
            @apply bg-transparent text-inherit text-sm p-0;

            ::selection {
                @apply bg-[var(--codeblock-selection)];
            }
        }
    } */
```
```astro title="src\layouts\Layout.astro" collapse={2-19}
function initCustomScrollbar() {
  const bodyElement = document.querySelector('body');
	if (!bodyElement) return;
	OverlayScrollbars(
		// docs say that a initialization to the body element would affect native functionality like window.scrollTo
		// but just leave it here for now
		{
			target: bodyElement,
			cancel: {
				nativeScrollbarsOverlaid: true,    // don't initialize the overlay scrollbar if there is a native one
			}
		}, {
		scrollbars: {
			theme: 'scrollbar-base scrollbar-auto py-1',
			autoHide: 'move',
			autoHideDelay: 500,
			autoHideSuspend: false,
		},
	});

	// const preElements = document.querySelectorAll('pre');
	// preElements.forEach((ele) => {
  // OverlayScrollbars(ele, {
	// 		scrollbars: {
	// 			theme: 'scrollbar-base scrollbar-dark px-2',
	// 			autoHide: 'leave',
	// 			autoHideDelay: 500,
	// 			autoHideSuspend: false
	// 		}
	// 	});
	// });

  const katexElements = document.querySelectorAll('.katex-display') as NodeListOf<HTMLElement>;
	katexElements.forEach((ele) => {
		OverlayScrollbars(ele, {
			scrollbars: {
				theme: 'scrollbar-base scrollbar-auto py-1',
			}
		});
	});
}
```

## 导入Expressive Code
直接参考 https://expressive-code.com/installation/#astro

## 添加代码块的黑暗模式

> 官方主题：https://expressive-code.com/guides/themes/

在配置文件中添加双主题

```js title="astro.config.mjs" ins={6}
export default defineConfig({
  // ...
  integrations: [
    // ...
    expressiveCode({
      themes: ["catppuccin-frappe", "light-plus"],
    })
  ]
})
```

修改`LightDarkSwitch.svelte`文件中的`onMount`和`switchScheme`方法
```svelte title="src\components\LightDarkSwitch.svelte" ins={4-8}
onMount(() => {
  mode = getStoredTheme()

  if (mode === DARK_MODE) {
    document.documentElement.setAttribute("data-theme", "catppuccin-frappe");
  } else {
    document.documentElement.setAttribute("data-theme", "light-plus");
  }
  
  const darkModePreference = window.matchMedia('(prefers-color-scheme: dark)')
  const changeThemeWhenSchemeChanged: Parameters<
    typeof darkModePreference.addEventListener<'change'>
  >[1] = e => {
    applyThemeToDocument(mode)
  }
  darkModePreference.addEventListener('change', changeThemeWhenSchemeChanged)
  return () => {
    darkModePreference.removeEventListener(
      'change',
      changeThemeWhenSchemeChanged,
    )
  }
})
```
```svelte title="src\components\LightDarkSwitch.svelte" ins={5-9}
function switchScheme(newMode: LIGHT_DARK_MODE) {
  mode = newMode
  setTheme(newMode)

  if (mode === DARK_MODE) {
    document.documentElement.setAttribute("data-theme", "catppuccin-frappe");
  } else {
    document.documentElement.setAttribute("data-theme", "light-plus");
  }
}
```
:::note
需要重启项目才能应用
:::

## 部分功能测试

### 代码块标题
````text
```js title="demo.js"
function demo() {

}
```
````

```js title="demo.js"
function demo() {
  
}
```
### 行标记
````text
```text {1, 5-6} ins={2-3} del={8}
第1行
第2行
第3行
第4行
第5行
第6行
第7行
第8行
``` 
````

```text {1, 5-6} ins={2-3} del={8}
第1行
第2行
第3行
第4行
第5行
第6行
第7行
第8行
``` 

### 文本标记

````text
```text "c" ins="csharp" del="ruby"
c c++ java
javascript python csharp
rust ruby golang
```
````

```text "c c++" ins="csharp" del="ruby"
c c++ java
javascript python csharp
rust ruby golang
```

### 代码折叠

:::note
需要额外安装 https://expressive-code.com/plugins/collapsible-sections/
:::

````text
```csharp collapse={4-5, 6-8} title="Demo.cs"
public int Demo()
{
  var i = 1 + 1;

  //折叠区域
  //折叠区域
  //折叠区域

  return i;
}
```
````

```csharp collapse={4-5, 6-8} title="Demo.cs"
public int Demo()
{
  var i = 1 + 1;

  //折叠区域
  //折叠区域
  //折叠区域

  return i;
}
```

### 显示代码行数

:::note
需要额外安装 https://expressive-code.com/plugins/line-numbers/
:::

````text
```text startLineNumber=5
第5行
第6行
```
````

```text startLineNumber=5
第5行
第6行
```