<script>
import { getTagUrl } from "../utils/url-utils";
import Icon from "@iconify/svelte";

let { tags } = $props();

let prefLimitValue = $state(5);
let initialTagValue = $state(0);
let finalTagValue = $state(prefLimitValue);
let marginPattern = $state("-8px");

const handleClickRigth = () => {
  initialTagValue = initialTagValue + 1;
  finalTagValue = finalTagValue + 1;
}

const handleClickLeft = () => {
  initialTagValue = initialTagValue - 1;
  finalTagValue = finalTagValue - 1;
}

const visibleTags = $derived(tags.slice(initialTagValue, finalTagValue));
const canGoLeft = $derived(initialTagValue !== 0);
const canGoRight = $derived(finalTagValue < tags.length);
</script>

<div class="flex flex-row flex-nowrap items-center">
    {#if tags.length > prefLimitValue}
        <button
            onclick={handleClickLeft}
            class="transition"
            style:margin-left={`${marginPattern}`}
            class:opacity-0={!canGoLeft}
            class:pointer-events-none={!canGoLeft}
            class:hover:opacity-70={canGoLeft}
            disabled={!canGoLeft}
        >
            <Icon icon="material-symbols:chevron-left-rounded" class="text-xl" />
        </button>
        {#each visibleTags as tag, i}
            <div class:hidden={i == 0} class="mx-1.5 text-[var(--meta-divider)] text-sm">/</div>
            <a href={getTagUrl(tag)} aria-label={`View all posts with the ${tag.trim()} tag`}
               class="link-lg transition text-50 text-sm font-medium hover:text-[var(--primary)] dark:hover:text-[var(--primary)] whitespace-nowrap">
                {tag.trim()}
            </a>
        {/each}
        <button
            onclick={handleClickRigth}
            class="transition"
            class:opacity-0={!canGoRight}
            class:pointer-events-none={!canGoRight}
            class:hover:opacity-70={canGoRight}
            disabled={!canGoRight}
        >
            <Icon icon="material-symbols:chevron-right-rounded" class="text-xl" />
        </button>
    {:else}
        {#each tags as tag, i}
            <div class:hidden={i == 0} class="mx-1.5 text-[var(--meta-divider)] text-sm">/</div>
            <a href={getTagUrl(tag)} aria-label={`View all posts with the ${tag.trim()} tag`}
            class="link-lg transition text-50 text-sm font-medium hover:text-[var(--primary)] dark:hover:text-[var(--primary)] whitespace-nowrap">
                {tag.trim()}
            </a>
        {/each}
    {/if}
</div>

<style>
</style>
