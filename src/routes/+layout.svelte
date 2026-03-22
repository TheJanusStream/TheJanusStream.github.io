<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import ForgeParticles from '$lib/components/ForgeParticles.svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<div class="forge-glow" aria-hidden="true"></div>
<ForgeParticles />
{@render children()}
