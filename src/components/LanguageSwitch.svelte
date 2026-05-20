<script lang="ts">
import I18nKey from "@i18n/i18nKey";
import Icon from "@iconify/svelte";
import { onMount } from "svelte";
import {
	applyLanguage,
	language,
	setLanguage,
	supportedLanguages,
	translate,
	type SupportedLanguage,
} from "@/i18n/client";

onMount(() => {
	applyLanguage($language);

	const handlePointerDown = (event: PointerEvent) => {
		const target = event.target;
		if (!(target instanceof Node)) return;
		const wrapper = document.querySelector("#language-switch-wrapper");
		if (!wrapper?.contains(target)) {
			hidePanel();
		}
	};

	document.addEventListener("pointerdown", handlePointerDown);
	return () => {
		document.removeEventListener("pointerdown", handlePointerDown);
	};
});

function getPanel(): Element | null {
	return document.querySelector("#language-panel");
}

function showPanel() {
	const panel = getPanel();
	panel?.classList.remove("float-panel-closed");
}

function hidePanel() {
	const panel = getPanel();
	panel?.classList.add("float-panel-closed");
}

function togglePanel() {
	const panel = getPanel();
	if (!panel) return;
	panel.classList.toggle("float-panel-closed");
}

function chooseLanguage(lang: SupportedLanguage) {
	setLanguage(lang);
	hidePanel();
}
</script>

<div id="language-switch-wrapper" class="relative z-50" role="menu" tabindex="-1">
	<button
		aria-label={translate(I18nKey.language, $language)}
		data-i18n-aria-key={I18nKey.language}
		role="menuitem"
		class="relative btn-plain scale-animation rounded-lg h-11 w-11 active:scale-90"
		id="language-switch"
		onclick={togglePanel}
	>
		<Icon icon="material-symbols:translate-rounded" class="text-[1.25rem]"></Icon>
	</button>

	<div
		id="language-panel"
		class="absolute transition float-panel-closed top-11 -right-2 pt-5"
	>
		<div class="card-base float-panel p-2 min-w-36">
			{#each supportedLanguages as item}
				<button
					class="flex transition whitespace-nowrap items-center !justify-start w-full btn-plain scale-animation rounded-lg h-9 px-3 font-medium active:scale-95 mb-0.5"
					class:current-theme-btn={$language === item.code}
					onclick={() => chooseLanguage(item.code)}
				>
					<span class="w-5 mr-2 text-[var(--primary)]">
						{#if $language === item.code}
							<Icon icon="material-symbols:check-rounded" class="text-[1.1rem]"></Icon>
						{/if}
					</span>
					{item.label}
				</button>
			{/each}
		</div>
	</div>
</div>
