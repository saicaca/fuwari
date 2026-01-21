<script lang="ts">
import I18nKey from "@i18n/i18nKey";
import { DEFAULT_LOCALE, i18n, SUPPORTED_LOCALES } from "@i18n/translation";
import Icon from "@iconify/svelte";
import { url } from "@utils/url-utils";
import { onMount } from "svelte";

let { lang: initialLang, ...props } = $props();

let currentLang = $state(initialLang || DEFAULT_LOCALE);
let isPanelOpen = $state(false);

onMount(() => {
	// If lang prop is not provided, fallback to URL detection
	if (!initialLang) {
		const pathname = window.location.pathname;
		const parts = pathname.split("/").filter(Boolean);
		const matchedLocale = (SUPPORTED_LOCALES as any).find(
			(l: string) => l.toLowerCase() === parts[0]?.toLowerCase(),
		);
		if (parts.length > 0 && matchedLocale) {
			currentLang = matchedLocale;
		} else {
			currentLang = DEFAULT_LOCALE;
		}
	}
});

function showPanel() {
	if (window.innerWidth < 1024) return;
	isPanelOpen = true;
}

function hidePanel() {
	if (window.innerWidth < 1024) return;
	isPanelOpen = false;
}

function togglePanel() {
	isPanelOpen = !isPanelOpen;
}

function setLang(targetLang: string) {
	if (targetLang === currentLang) return;

	const pathname = window.location.pathname;
	const search = window.location.search;
	const hash = window.location.hash;

	const parts = pathname.split("/").filter(Boolean);
	const hasLangPrefix =
		parts.length > 0 &&
		(SUPPORTED_LOCALES as readonly string[]).find(
			(l) => l.toLowerCase() === parts[0].toLowerCase(),
		);

	let newParts = [...parts];
	if (hasLangPrefix) {
		if (targetLang === DEFAULT_LOCALE) {
			newParts.shift();
		} else {
			newParts[0] = targetLang;
		}
	} else {
		if (targetLang !== DEFAULT_LOCALE) {
			newParts.unshift(targetLang);
		}
	}

	let newPath = `/${newParts.join("/")}`;
	if (pathname.endsWith("/") && !newPath.endsWith("/")) {
		newPath += "/";
	}
	if (newPath === "//") newPath = "/";

	window.location.href = url(newPath) + search + hash;
}
</script>

<!-- z-50 make the panel higher than other float panels -->
<div class="relative z-50" onmouseleave={hidePanel} role="none">
    <button aria-label="Language" aria-haspopup="menu" aria-expanded={isPanelOpen} class="relative btn-plain scale-animation rounded-lg h-11 w-11 active:scale-90" id="language-switch" onclick={togglePanel} onmouseenter={showPanel}>
        <div class="absolute">
            <Icon icon="material-symbols:translate-rounded" class="text-[1.25rem]"></Icon>
        </div>
    </button>

    <div id="language-panel" class="absolute transition top-11 -right-2 pt-5" class:float-panel-closed={!isPanelOpen} role="menu">
        <div class="card-base float-panel p-2">
            {#each SUPPORTED_LOCALES as lang}
                <button class="flex transition whitespace-nowrap items-center !justify-start w-full btn-plain scale-animation rounded-lg h-9 px-3 font-medium active:scale-95 mb-0.5"
                        role="menuitem"
                        class:current-theme-btn={currentLang === lang}
                        onclick={() => setLang(lang)}
                >
                    {i18n(I18nKey.langName, lang)}
                </button>
            {/each}
        </div>
    </div>
</div>
