<script lang="ts">
    import {onDestroy, onMount} from 'svelte'
    import 'giscus'

    import {commentConfig} from '@/config'

    if (!commentConfig || !commentConfig.giscus) {
        throw new Error('Giscus comments are not configured')
    }

    const giscus = commentConfig.giscus

    let hue: number
    let mode: string
    let theme: string
    import {getHue} from '@utils/setting-utils'
    function updateTheme() {
        const newMode = document.documentElement.classList.contains('dark')
            ? 'dark'
            : 'light'
        const newHue = getHue()
        if (mode !== newMode || hue !== newHue) {
            mode = newMode
            hue = newHue
            theme = getThemeValue()
            // 如果iframe已加载，使用postMessage API更新主题
            if (giscusFrame) {
                try {
                    const message = {
                        giscus: {
                            setConfig: {
                                theme: theme,
                            },
                        },
                    }
                    giscusFrame.contentWindow?.postMessage(message, 'https://giscus.app')
                } catch (error) {
                    console.error('Failed to update Giscus theme:', error)
                }
            }
        }
    }

    // 延迟导入CSS，按需加载
    let giscus_base: string
    let giscus_dark: string
    let giscus_light: string
    function getThemeValue() {
        const hue_style = `main { --hue: ${hue}; }`
        const css =
            mode === 'dark'
                ? hue_style + giscus_dark + giscus_base
                : hue_style + giscus_light + giscus_base
        // 将 CSS 编码为 data URI
        return `data:text/css;base64,${btoa(css)}`
    }

    let giscusFrame: HTMLIFrameElement | null = null
    let observer: MutationObserver
    onMount(async () => {
        if (giscus.theme !== 'reactive') {
            theme = giscus.theme
            return
        }
        // 查找Giscus iframe，添加最大重试次数
        const findGiscusFrame = (retries = 0, maxRetries = 10) => {
            giscusFrame = document.querySelector('.giscus-frame') as HTMLIFrameElement
            if (!giscusFrame && retries < maxRetries) {
                // 如果iframe还没有加载，稍后再尝试，使用指数退避策略
                setTimeout(
                    () => findGiscusFrame(retries + 1, maxRetries),
                    100 * Math.pow(1.5, retries),
                )
            }
        }
        findGiscusFrame()
        // 按需导入CSS
        const [baseModule, darkModule, lightModule] = await Promise.all([
            import('@styles/giscus-base.css?raw'),
            import('@styles/giscus-dark.css?raw'),
            import('@styles/giscus-light.css?raw'),
        ])
        giscus_base = baseModule.default
        giscus_dark = darkModule.default
        giscus_light = lightModule.default
        // 初始化响应式主题
        updateTheme()
        // 监听主题变化
        observer = new MutationObserver(() => {
            updateTheme()
        })
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class', 'style'],
        })
    })

    onDestroy(() => {
        observer?.disconnect()
    })
</script>

<giscus-widget
        id="comments"
        repo={giscus.repo}
        repoId={giscus.repoId}
        category={giscus.category}
        categoryId={giscus.categoryId}
        mapping={giscus.mapping}
        term={giscus.term}
        strict={giscus.strict}
        reactionsEnabled={giscus.reactionsEnabled}
        emitMetadata={giscus.emitMetadata}
        inputPosition={giscus.inputPosition}
        theme={theme}
        lang={giscus.lang}
        loading={giscus.loading}
>
</giscus-widget>