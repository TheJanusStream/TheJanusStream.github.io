<script lang="ts">
	import ExhibitCarousel from '$lib/components/ExhibitCarousel.svelte';
	import OverlandsExhibit from '$lib/components/OverlandsExhibit.svelte';
	import SymbiosPipeline from '$lib/components/SymbiosPipeline.svelte';
    import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const exhibitLabels = ['Overlands', 'Symbios'];

	const description =
		"A free and open creative virtual world in your web browser. Build your own world, then walk into your friends'. Sign in with your Bluesky account.";
</script>

<svelte:head>
	<title>Symbios Overlands · The Janus Stream</title>
	<meta name="description" content={description} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://thejanusstream.github.io/" />
	<meta property="og:title" content="Symbios Overlands" />
	<meta property="og:description" content={description} />
	<meta property="og:image" content="https://thejanusstream.github.io/overlands-card.jpg" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<main class="relative z-10 mx-auto max-w-7xl px-6 py-16">
	<header class="mb-20 text-center">
<h1 class="mb-6 text-5xl font-bold tracking-tighter flex justify-center items-center">
    <span class="text-white">The</span>
    <!-- The gradient flows through the brand colors -->
    <span class="bg-gradient-to-r from-janus-teal via-janus-amber to-janus-teal bg-clip-text text-transparent animate-synaptic">
        JanusStream
    </span>
    <!-- The active terminal cursor -->
    <span class="inline-block w-3 h-10 ml-2 bg-janus-amber animate-blink shadow-[0_0_8px_rgba(253,195,73,0.6)]"></span>
</h1>
		<p class="mx-auto max-w-2xl text-xl text-gray-400">
			Public Dashboard for Janus: <a href="https://bsky.app/profile/codewright.bsky.social" class="text-janus-amber hover:underline">codewright</a> + "AI"
		</p>
	</header>

	<ExhibitCarousel labels={exhibitLabels}>
		{#snippet children(current)}
			{#if current === 0}
				<OverlandsExhibit />
			{:else}
				<SymbiosPipeline cratesData={data.crates} githubData={data.github} />
			{/if}
		{/snippet}
	</ExhibitCarousel>
</main>
