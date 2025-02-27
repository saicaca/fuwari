---
title: 添加Expressive Code插件
published: 2025-02-26
description: '代码块增强'
image: ''
tags: [Fuwari, Astro, Shiki, 博客]
category: '前端'
draft: false 
lang: ''
series: "改造博客"
---

> `Expressive Code`是 shiki 代码块的一个增强插件<br>
> 官网：https://expressive-code.com/installation/

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
```astro title="src\layouts\Layout.astro"
	// const preElements = document.querySelectorAll('pre');
	// preElements.forEach((ele) => {
	// 	OverlayScrollbars(ele, {
	// 		scrollbars: {
	// 			theme: 'scrollbar-base scrollbar-dark px-2',
	// 			autoHide: 'leave',
	// 			autoHideDelay: 500,
	// 			autoHideSuspend: false
	// 		}
	// 	});
	// });
```

## 添加代码块的暗黑模式

修改`LightDarkSwitch.svelte`文件中的`onMount`和`switchScheme`方法
```svelte title="src\components\LightDarkSwitch.svelte" ins={4-8}
onMount(() => {
  mode = getStoredTheme()

  if (mode === DARK_MODE) {
    document.documentElement.setAttribute("data-theme", "github-dark");
  } else {
    document.documentElement.setAttribute("data-theme", "github-light");
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
    document.documentElement.setAttribute("data-theme", "github-dark");
  } else {
    document.documentElement.setAttribute("data-theme", "github-light");
  }
}
```
