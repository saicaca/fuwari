<script lang="ts">
import { AUTO_MODE, DARK_MODE, LIGHT_MODE } from "@constants/constants.ts";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import Icon, { addIcon } from "@iconify/svelte";
import icons from '@iconify-json/material-symbols/icons.json';

// Preload icons to avoid CDN requests
['wb-sunny-outline-rounded', 'dark-mode-outline-rounded', 'radio-button-partial-outline'].forEach(name => {
	if (icons.icons[name]) {
		addIcon(`material-symbols:${name}`, { body: icons.icons[name].body, width: icons.width, height: icons.height });
	}
});
import {
	applyThemeToDocument,
	getStoredTheme,
	setTheme,
} from "@utils/setting-utils.ts";
import { onMount } from "svelte";
import type { LIGHT_DARK_MODE } from "@/types/config.ts";

let {} = $props();

const seq: LIGHT_DARK_MODE[] = [LIGHT_MODE, DARK_MODE, AUTO_MODE];
let mode: LIGHT_DARK_MODE = $state(
	typeof document !== 'undefined'
		? (document.documentElement.getAttribute('data-theme-mode') as LIGHT_DARK_MODE || AUTO_MODE)
		: AUTO_MODE
);

onMount(() => {
	mode = getStoredTheme();
    document.documentElement.setAttribute('data-theme-mode', mode);
    
	// Wire up the button that's rendered in Navbar.astro
	const button = document.getElementById('scheme-switch');
	const wrapper = document.getElementById('theme-switch-wrapper');

	if (button) {
		button.onclick = toggleScheme;
		button.onmouseenter = showPanel;
	}

	if (wrapper) {
		wrapper.onmouseleave = hidePanel;
	}

	const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)");
	const changeThemeWhenSchemeChanged: Parameters<
		typeof darkModePreference.addEventListener<"change">
	>[1] = (_e) => {
		applyThemeToDocument(mode);
	};
	darkModePreference.addEventListener("change", changeThemeWhenSchemeChanged);
	return () => {
		darkModePreference.removeEventListener(
			"change",
			changeThemeWhenSchemeChanged,
		);
	};
});

function switchScheme(newMode: LIGHT_DARK_MODE) {
	mode = newMode;
	setTheme(newMode);
    document.documentElement.setAttribute('data-theme-mode', newMode);
}

function toggleScheme() {
	let i = 0;
	for (; i < seq.length; i++) {
		if (seq[i] === mode) {
			break;
		}
	}
	switchScheme(seq[(i + 1) % seq.length]);
}

function showPanel() {
	const panel = document.querySelector("#light-dark-panel");
	panel.classList.remove("float-panel-closed");
}

function hidePanel() {
	const panel = document.querySelector("#light-dark-panel");
	panel.classList.add("float-panel-closed");
}
</script>

<!-- Button is rendered in Navbar.astro for instant display -->
<div id="light-dark-panel" class="hidden lg:block absolute transition float-panel-closed top-11 -right-2 pt-5" role="menu" tabindex="-1">
    <div class="card-base float-panel p-2">
        <button class="flex transition whitespace-nowrap items-center !justify-start w-full btn-plain scale-animation rounded-lg h-9 px-3 font-medium active:scale-95 mb-0.5"
                class:current-theme-btn={mode === LIGHT_MODE}
                onclick={() => switchScheme(LIGHT_MODE)}
        >
            <Icon icon="material-symbols:wb-sunny-outline-rounded" class="text-[1.25rem] mr-3"></Icon>
            {i18n(I18nKey.lightMode)}
        </button>
        <button class="flex transition whitespace-nowrap items-center !justify-start w-full btn-plain scale-animation rounded-lg h-9 px-3 font-medium active:scale-95 mb-0.5"
                class:current-theme-btn={mode === DARK_MODE}
                onclick={() => switchScheme(DARK_MODE)}
        >
            <Icon icon="material-symbols:dark-mode-outline-rounded" class="text-[1.25rem] mr-3"></Icon>
            {i18n(I18nKey.darkMode)}
        </button>
        <button class="flex transition whitespace-nowrap items-center !justify-start w-full btn-plain scale-animation rounded-lg h-9 px-3 font-medium active:scale-95"
                class:current-theme-btn={mode === AUTO_MODE}
                onclick={() => switchScheme(AUTO_MODE)}
        >
            <Icon icon="material-symbols:radio-button-partial-outline" class="text-[1.25rem] mr-3"></Icon>
            {i18n(I18nKey.systemMode)}
        </button>
    </div>
</div>