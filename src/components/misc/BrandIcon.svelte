<script lang="ts">
import Icon from "@iconify/svelte";

interface Props {
	icon: string;
	class?: string;
}

let { icon, class: className = "" }: Props = $props();
</script>

<Icon {icon} class={className}></Icon>