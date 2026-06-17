<script lang="ts">
import Icon from "@iconify/svelte";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/style.css";
import type { ActionType } from "photoswipe";
import { onDestroy, onMount } from "svelte";

interface Props {
	images?: { src: string; alt: string }[];
	bindTo?: string;
}

let { images = [], bindTo }: Props = $props();

let inlineIndex = $state(0);
let mainImageEl: HTMLImageElement | undefined = $state();
let lightbox: PhotoSwipeLightbox;
const lightboxOptions = {
	pswpModule: () => import("photoswipe"),
	closeSVG:
		'<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M480-424 284-228q-11 11-28 11t-28-11q-11-11-11-28t11-28l196-196-196-196q-11-11-11-28t11-28q11-11 28-11t28 11l196 196 196-196q11-11 28-11t28 11q11 11 11 28t-11 28L536-480l196 196q11 11 11 28t-11 28q-11 11-28 11t-28-11L480-424Z"/></svg>',
	zoomSVG:
		'<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff"><path d="M340-540h-40q-17 0-28.5-11.5T260-580q0-17 11.5-28.5T300-620h40v-40q0-17 11.5-28.5T380-700q17 0 28.5 11.5T420-660v40h40q17 0 28.5 11.5T500-580q0 17-11.5 28.5T460-540h-40v40q0 17-11.5 28.5T380-460q-17 0-28.5-11.5T340-500v-40Zm40 220q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l224 224q11 11 11 28t-11 28q-11 11-28 11t-28-11L532-372q-30 24-69 38t-83 14Zm0-80q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg>',
	padding: { top: 20, bottom: 40, left: 20, right: 20 },
	wheelToZoom: true,
	arrowPrev: true,
	arrowNext: true,
	imageClickAction: "close" as ActionType,
	tapAction: "close" as ActionType,
	doubleTapAction: "zoom" as ActionType,
};

function registerCaption(lightbox: PhotoSwipeLightbox) {
	lightbox.on("uiRegister", () => {
		lightbox.pswp?.ui?.registerElement({
			name: "custom-caption",
			order: 9,
			isButton: false,
			appendTo: "root",
			html: "Caption text",
			onInit: (el: HTMLElement, pswp) => {
				lightbox.pswp?.on("change", () => {
					const currSlideElement = pswp.currSlide?.data.element;
					let captionText = "";
					if (currSlideElement) {
						captionText = currSlideElement.getAttribute("alt") || "";
					} else {
						captionText = pswp.currSlide?.data.alt || "";
					}
					el.innerHTML = captionText
						? `<div class="bg-black/80 backdrop-blur-md text-white/90 text-center p-4 w-full absolute bottom-0 left-0">${captionText}</div>`
						: "";
				});
			},
		});
	});
}

function setupGlobalLightbox() {
	if (!bindTo) return;

	const init = () => {
		if (lightbox) lightbox.destroy();
		lightbox = new PhotoSwipeLightbox({
			gallery: bindTo,
			...lightboxOptions,
		});

		registerCaption(lightbox);

		lightbox.addFilter("domItemData", (itemData, element) => {
			if (element instanceof HTMLImageElement) {
				itemData.src = element.src;
				itemData.w = Number(element.naturalWidth || window.innerWidth);
				itemData.h = Number(element.naturalHeight || window.innerHeight);
				itemData.msrc = element.src;
			}
			return itemData;
		});

		lightbox.init();
	};

	init();

	const w = window as Window;

	if (w.swup) {
		w.swup.hooks.on("page:view", init);
		w.swup.hooks.on(
			"content:replace",
			() => {
				if (lightbox) lightbox.destroy();
			},
			{ before: true },
		);
	}
}

async function openPhotoSwipe(index: number) {
	if (lightbox) lightbox.destroy();
	const dataSource = await Promise.all(
		images.map(async (img, i) => {
			const image = new Image();
			image.src = img.src;
			await image.decode(); // Wait for the image to decode
			return {
				src: img.src,
				msrc: img.src,
				alt: img.alt,
				w: image.naturalWidth,
				h: image.naturalHeight,
				element: i === inlineIndex ? mainImageEl : undefined,
			};
		}),
	);

	lightbox = new PhotoSwipeLightbox({
		dataSource,
		...lightboxOptions,
	});

	registerCaption(lightbox);
	lightbox.init();

	lightbox.loadAndOpen(index);
}
onMount(() => {
	if (bindTo) {
		setupGlobalLightbox();
	}
});

onDestroy(() => {
	if (lightbox) {
		lightbox.destroy();
	}
});
</script>

<!-- Inline Image Strip -->
{#if images.length > 0}
	<div class="flex flex-col gap-4 w-full items-center my-8 not-prose">
		<!-- Main Display Image -->
		<!-- biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore event_directive_deprecated -->
		<div
			class="relative w-full overflow-hidden rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 group select-none"
			on:click={() => openPhotoSwipe(inlineIndex)}
			role="button"
			tabindex="0"
		>
			<img
				bind:this={mainImageEl}
				src={images[inlineIndex].src}
				alt={images[inlineIndex].alt}
				class="w-full h-auto object-contain max-h-[70vh] mx-auto transition-transform duration-500 carouselImg"
			/>
			<!-- Hover Overlay -->
			<div
				class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100"
			>
				<div
					class="transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-black/50 backdrop-blur-sm rounded-full p-3 text-white"
				>
					<Icon icon="fa6-solid:expand" class="text-xl" />
				</div>
			</div>

			{#if images.length > 1}
				<div
					class="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-md font-medium"
				>
					{inlineIndex + 1} / {images.length}
				</div>
			{/if}
		</div>

		<!-- Inline Thumbnails -->
		{#if images.length > 1}
			<div
				class="flex gap-2 overflow-x-auto w-full max-w-full justify-start md:justify-center scrollbar-hide py-1 px-1"
			>
				{#each images as img, i}
					<!-- svelte-ignore event_directive_deprecated -->
					<button
						class="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all {i ===
						inlineIndex
							? 'border-primary ring-2 ring-primary/20 opacity-100 scale-105'
							: 'border-transparent opacity-50 hover:opacity-100'}"
						on:click={(e) => {
							e.stopPropagation();
							inlineIndex = i;
						}}
						aria-label={`View image ${i + 1}`}
						type="button"
					>
						<img src={img.src} alt={img.alt} class="h-full w-full object-cover carouselImg" />
					</button>
				{/each}
			</div>
		{/if}
	</div>
{/if}

<style>
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>