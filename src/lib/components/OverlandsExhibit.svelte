<script lang="ts">
	/** Where the game runs, and where its code lives. */
	const GAME_URL = 'https://thejanusstream.github.io/symbios-overlands';
	const SOURCE_URL = 'https://github.com/TheJanusStream/symbios-overlands';

	/** A link into someone's world, landing where its owner set the arrival. */
	function worldLink(did: string): string {
		return `${GAME_URL}?did=${encodeURIComponent(did)}`;
	}

	/**
	 * The clips play on their own, so for a visitor who asked their system for
	 * less motion they stand still on their first frame, with the player's
	 * controls to start them.
	 */
	function calmForReducedMotion(video: HTMLVideoElement) {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			video.autoplay = false;
			video.pause();
			video.controls = true;
		}
	}

	const pillars = [
		{
			title: 'Creative',
			text: "The moment you sign in, you have a world of your own, unlike anyone else's: its own land, weather, village and music. Then make it yours with simple tools. Reshape the land, drag in houses and trees from a catalogue of hundreds, and shape an avatar that looks the way you want."
		},
		{
			title: 'Social',
			text: "Every world has a gateway. Step into it and it shows you your friends' worlds; walk out into one of them, with no loading screen in between. Meet people there, chat, wave, and give each other things you have made."
		},
		{
			title: 'Free and open source',
			text: 'Nothing to install and nothing to pay: it runs in your web browser. Sign in with your Bluesky account, and the app never sees your password. What you build is saved in your own account, not on a game server, and anyone can read and improve the code.'
		}
	];

	/**
	 * What a visitor can do, shown: clips of the game's own editor and stills
	 * rendered by its own render tool, all in /overlands/. A clip is there twice:
	 * a VP9 WebM, which every browser plays, open-source builds without H.264
	 * included, and an H.264 MP4 for the rest.
	 */
	type GalleryItem =
		| { kind: 'clip'; name: string; caption: string }
		| { kind: 'still'; name: string; caption: string; alt: string };

	const gallery: GalleryItem[] = [
		{
			kind: 'clip',
			name: 'editor-catalogue',
			caption: 'Drag a building out of the catalogue of hundreds, and it is built where you let go.'
		},
		{
			kind: 'clip',
			name: 'editor-move',
			caption: 'Pick up anything in your world and move it. Changed your mind? Undo.'
		},
		{
			kind: 'still',
			name: 'cattrees',
			caption:
				'Build big: in Purlieu, a forest of cat trees joined by bridges, with a lounge on every top.',
			alt: 'Seven sisal towers on a meadow, joined by plank bridges and ringed by jump pads, with a slide, a parasol and a pergola on their tops'
		},
		{
			kind: 'still',
			name: 'friends',
			caption: 'Come as a person, a cat or a bird, and explore together.',
			alt: 'Two people, a brown tabby cat and a small white bird walking together along a path through a flowering meadow, a gateway with lanterns behind them'
		},
		{
			kind: 'clip',
			name: 'walker',
			caption: "Every world has a gateway. Walk through it into your friends' worlds."
		},
		{
			kind: 'still',
			name: 'village',
			caption: 'A whole village grown from a recipe: nothing in Ashmere is hand-modelled.',
			alt: 'Ashmere from above: thatched houses along a village street, a mere beyond them and strip fields to the right'
		}
	];

	const worlds = [
		{
			name: 'Ashmere',
			builder: 'Reeve',
			profile: 'https://bsky.app/profile/reeve-ai.bsky.social',
			did: 'did:plc:dwhgmzz27dllc3k2nmlznv3n',
			image: '/overlands/ashmere.webp',
			alt: 'The village street of Ashmere between thatched houses, smoke rising from their chimneys, the mere beyond',
			text: 'A village of about 1300: thatched houses along one street, a church with a round tower, red cattle by the mere.'
		},
		{
			name: 'The Understory',
			builder: 'Hypha',
			profile: 'https://bsky.app/profile/hypha-ai.bsky.social',
			did: 'did:plc:ghkcajvgtvvfxavllty3pr57',
			image: '/overlands/understory.webp',
			alt: 'The still pool at the heart of the Understory, the sun glittering on it, glowing threads along its shore and giant mushrooms over the trees',
			text: 'An old forest as its fungus knows it: a still pool at its heart, glowing threads in the ground, giant mushrooms over the trees.'
		},
		{
			name: 'Purlieu',
			builder: 'Catoid',
			profile: 'https://bsky.app/profile/catoid-ai.bsky.social',
			did: 'did:plc:hl3tauh5rilw2baafaco2b5u',
			image: '/overlands/purlieu.webp',
			alt: 'The Lee in Purlieu: a fire ringed by logs and straw nests, a lean-to with lanterns, blossom trees and the lake beyond',
			text: 'A meadow by a lake, made for four-legged visitors: a fire with straw nests, a cat cottage and a forest of cat trees.'
		}
	];
</script>

<section class="border-glow-teal relative overflow-hidden rounded-lg border bg-black/40">
	<!-- The world itself, with what it is and the way in -->
	<div class="relative">
		<img
			src="/overlands.webp"
			alt="Ashmere at sunset in Symbios Overlands: thatched houses and trees in silhouette beyond a still mere, chimney smoke rising into a pink sky"
			width="1920"
			height="1080"
			fetchpriority="high"
			class="block aspect-video w-full object-cover"
		/>
		<div
			class="from-janus-bg via-janus-bg/50 pointer-events-none absolute inset-0 hidden bg-linear-to-t to-transparent md:block"
		></div>
		<div class="p-6 md:absolute md:inset-x-0 md:bottom-0 md:p-10">
			<h2 class="mb-3 text-4xl md:text-6xl">Symbios Overlands</h2>
			<p class="font-sans text-xl text-gray-100 md:text-2xl">
				A free and open creative virtual world.
			</p>
			<p class="mb-6 font-sans text-lg text-gray-300">Build yours, then walk into your friends'.</p>
			<div class="flex flex-wrap gap-3">
				<a
					href={GAME_URL}
					target="_blank"
					rel="external noopener noreferrer"
					class="bg-janus-amber hover:bg-janus-amber/80 border-janus-amber rounded border px-6 py-3 text-sm font-bold tracking-widest text-black uppercase transition-colors"
					>Enter the Overlands</a
				>
				<a
					href={SOURCE_URL}
					target="_blank"
					rel="external noopener noreferrer"
					class="hover:bg-janus-teal/20 bg-janus-teal/10 text-janus-teal border-janus-teal rounded border px-6 py-3 text-sm tracking-widest uppercase transition-colors"
					>Source code</a
				>
			</div>
			<p class="mt-3 font-sans text-sm text-gray-400">
				Runs in your web browser. Sign in with the Bluesky account you already have.
			</p>
		</div>
	</div>

	<!-- What it is, in three words -->
	<div class="grid gap-6 p-6 md:grid-cols-3 md:p-10">
		{#each pillars as pillar (pillar.title)}
			<div class="border-janus-teal/30 rounded border bg-black/40 p-5">
				<h3 class="text-janus-teal mb-3 text-xl">{pillar.title}</h3>
				<p class="font-sans leading-relaxed text-gray-300">{pillar.text}</p>
			</div>
		{/each}
	</div>

	<!-- What you can do there, shown -->
	<div class="px-6 pb-6 md:px-10 md:pb-10">
		<h3 class="text-janus-teal mb-4 text-2xl">What you can do</h3>
		<div class="grid gap-6 md:grid-cols-3">
			{#each gallery as item (item.name)}
				<figure>
					{#if item.kind === 'clip'}
						<video
							autoplay
							muted
							loop
							playsinline
							aria-label={item.caption}
							use:calmForReducedMotion
							class="border-janus-slate/40 aspect-video w-full rounded border object-cover"
						>
							<source src="/overlands/{item.name}.webm" type="video/webm" />
							<source src="/overlands/{item.name}.mp4" type="video/mp4" />
						</video>
					{:else}
						<img
							src="/overlands/{item.name}.webp"
							alt={item.alt}
							width="960"
							height="540"
							loading="lazy"
							class="border-janus-slate/40 block aspect-video w-full rounded border object-cover"
						/>
					{/if}
					<figcaption class="mt-2 font-sans text-sm text-gray-400">{item.caption}</figcaption>
				</figure>
			{/each}
		</div>
	</div>

	<!-- Three worlds to walk into -->
	<div class="px-6 pb-10 md:px-10">
		<h3 class="text-janus-amber mb-4 text-2xl">Worlds to visit</h3>
		<div class="grid gap-6 md:grid-cols-3">
			{#each worlds as world (world.did)}
				<div class="border-janus-amber/40 overflow-hidden rounded border bg-black/40">
					<img
						src={world.image}
						alt={world.alt}
						width="960"
						height="540"
						loading="lazy"
						class="block aspect-video w-full object-cover"
					/>
					<div class="p-4">
						<p class="mb-1">
							<span class="text-lg text-gray-100">{world.name}</span>
							<span class="text-janus-slate text-sm">
								built by
								<a
									href={world.profile}
									target="_blank"
									rel="external noopener noreferrer"
									class="hover:text-janus-amber underline">{world.builder}</a
								>
							</span>
						</p>
						<p class="mb-3 font-sans text-sm text-gray-400">{world.text}</p>
						<a
							href={worldLink(world.did)}
							target="_blank"
							rel="external noopener noreferrer"
							class="text-janus-amber text-xs tracking-widest uppercase hover:underline"
							>Walk into {world.name}</a
						>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
