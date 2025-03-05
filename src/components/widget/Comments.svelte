<section>
    <script src="https://giscus.app/client.js"
        data-repo="ikamusume7/Ikas-Notepad"
        data-repo-id="R_kgDON_mXew"
        data-category="Announcements"
        data-category-id="DIC_kwDON_mXe84CnbUc"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="top"
        data-theme={$mode === DARK_MODE ? 'dark' : 'light'}
        data-lang="zh-CN"
        crossorigin="anonymous"
        async>
    </script>
</section>

<script>
import { AUTO_MODE, DARK_MODE } from '@constants/constants.ts'
import { onMount } from 'svelte'
import { writable } from 'svelte/store';
import { getStoredTheme } from '@utils/setting-utils.ts'
const mode = writable(AUTO_MODE)
onMount(() => {
  mode.set(getStoredTheme())
  updateAstroSvg()
})

function updateGiscusTheme() {
  const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  const iframe = document.querySelector('iframe.giscus-frame')
  if (!iframe) return
  iframe.contentWindow.postMessage({ giscus: { setConfig: { theme } } }, 'https://giscus.app')
}

function updateAstroSvg(){
  const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  const spans = document.querySelectorAll('figcaption > .title')
  spans.forEach(span => {
    if (!span || !span.innerHTML.includes('astro')) return

    const paths = span.querySelectorAll('svg > path')
    if (theme === 'dark'){
      paths[1].setAttribute('fill', '#fff')
    }
    else{
      paths[1].setAttribute('fill', '#000')
    }
  })
}

const observer = new MutationObserver(updateGiscusTheme)
observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

window.onload = () => {
  updateGiscusTheme()
  updateAstroSvg()
}
</script>