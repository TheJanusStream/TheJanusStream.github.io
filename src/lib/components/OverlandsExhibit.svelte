<script lang="ts">
	/** Where the game runs, and where its code lives. */
	const GAME_URL = 'https://thejanusstream.github.io/symbios-overlands';
	const SOURCE_URL = 'https://github.com/TheJanusStream/symbios-overlands';

	/** A link into someone's world, landing where its owner set the arrival. */
	function worldLink(did: string): string {
		return `${GAME_URL}?did=${encodeURIComponent(did)}`;
	}

	/** Whether the visitor asked their system for less motion. */
	function wantsLessMotion(): boolean {
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}

	/**
	 * The header's clip plays on its own; for a visitor who asked for less
	 * motion it stands still on its poster, with the player's controls to start
	 * it.
	 */
	function calmForReducedMotion(video: HTMLVideoElement) {
		if (wantsLessMotion()) {
			video.autoplay = false;
			video.pause();
			video.controls = true;
		}
	}

	/**
	 * A gallery clip loads nothing until it is on screen (preload="none" shows
	 * its poster), then plays while at least a quarter of it is in view and
	 * pauses when it leaves. A visitor who asked for less motion, or whose
	 * browser refuses to start it, gets the player's controls instead.
	 */
	function playWhenVisible(video: HTMLVideoElement) {
		if (wantsLessMotion()) {
			video.controls = true;
			return;
		}
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					video.play().catch(() => {
						video.controls = true;
					});
				} else {
					video.pause();
				}
			},
			{ threshold: 0.25 }
		);
		observer.observe(video);
		return { destroy: () => observer.disconnect() };
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
	 * What a visitor can do, shown: clips and stills rendered by the game's own
	 * render tool, all in /overlands/. A clip is there twice, a VP9 WebM, which
	 * every browser plays, open-source builds without H.264 included, and an
	 * H.264 MP4 for the rest, with a poster of its first frame.
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
			name: 'blocks',
			caption:
				'Make things of your own from building blocks. This cat cottage is 161 simple shapes, boxes, balls, cylinders and rings, nested in one tree.',
			alt: "The World Editor's Items tab open on the Cat Cottage, its tree of shapes listed beside the cottage standing in a meadow"
		},
		{
			kind: 'clip',
			name: 'catalogue',
			caption:
				'Hundreds of buildings and plants across two dozen themes, each one grown from a small recipe.'
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
			name: 'village',
			caption: 'A whole village grown from a recipe: nothing in Ashmere is hand-modelled.',
			alt: 'Ashmere from above: thatched houses along a village street, a mere beyond them and strip fields to the right'
		},
		{
			kind: 'still',
			name: 'friends',
			caption: 'Come as a person, a cat or a bird, and explore together.',
			alt: 'Two people, a brown tabby cat and a small white bird walking together along a path through a flowering meadow, a gateway with lanterns behind them'
		},
		{
			kind: 'clip',
			name: 'vehicles',
			caption: 'Or come as a vehicle: a boat, a balloon, a wagon, a helicopter or a plane.'
		},
		{
			kind: 'clip',
			name: 'jink-jump',
			caption:
				"Vehicles drive and fly on the game's own physics: Jink's car through the ring of fire in Parabola Flats."
		},
		{
			kind: 'clip',
			name: 'gateway',
			caption: "Every world has a gateway. Walk through it into your friends' worlds."
		},
		{
			kind: 'still',
			name: 'isoline-night',
			caption:
				'Every world keeps its own time and weather: warm noons, rain, snow, and nights full of lit windows.',
			alt: 'Isoline at night across its bay: a neon downtown of lit towers behind a twisted glass spire, the shore drawn in cyan light'
		},
		{
			kind: 'still',
			name: 'berlin',
			caption:
				"Or start from a real place: a square kilometre of Berlin, built from the city's open data.",
			alt: "A square of Berlin from above, in Friedrichshain-Kreuzberg: rows of apartment blocks with lit windows along its streets, dressed in the region's theme"
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
			alt: 'A dead tree in the Understory hung with glowing ghost fungus, glowing threads running through the grass, a hazy sun behind',
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
		},
		{
			name: 'Parabola Flats',
			builder: 'Jink',
			profile: 'https://bsky.app/profile/jink-ai.bsky.social',
			did: 'did:plc:lr2ocunor73lfqpwtgvt274o',
			image: '/overlands/parabola.webp',
			alt: 'A red jump ramp in Parabola Flats leading to a ring of fire over wrecked cars, flags and a judges tower, dunes and cacti behind',
			text: 'A stunt park on a dry lake in red mesa country: a jump line with a ring of fire, a crowd in the stands, a drift circle and a circuit round a rock spire.'
		},
		{
			name: 'Tempelhof-Schöneberg',
			builder: 'Kairos',
			profile: 'https://bsky.app/profile/kairos-ai.bsky.social',
			did: 'did:plc:aeblnmu75y5jnntjrllo3ouq',
			image: '/overlands/tempelhof.webp',
			alt: 'A white spaceship hull half built in its cradle under orange gantry cranes, welding arms and floodlights round it',
			text: "A real square kilometre of Berlin, built from the city's open data: an open-air workshop, a giant robot arm, and a 63 m spaceship half built under tower cranes."
		},
		{
			name: 'Isoline',
			builder: 'Eigen',
			profile: 'https://bsky.app/profile/eigen-ai.bsky.social',
			did: 'did:plc:7po3qshysor5djaxoy7zme4s',
			image: '/overlands/isoline.webp',
			alt: 'Isoline across its bay: towers with lit windows behind a twisted glass spire standing in the water, the shore drawn in cyan light',
			text: 'A city on a slope above a lake, its streets laid along the lie of the land: a neon downtown round the waterfront and a twisted glass spire in the bay.'
		}
	];
</script>

<section class="border-glow-teal relative overflow-hidden rounded-lg border bg-black/40">
	<!-- The world itself, moving, with what it is and the way in -->
	<div class="relative">
		<video
			autoplay
			muted
			loop
			playsinline
			poster="/overlands/hero-pool-poster.webp"
			aria-label="The still pool at the heart of the Understory in gentle rain under a warm sky, glowing threads along its shore"
			use:calmForReducedMotion
			class="block aspect-video w-full object-cover"
		>
			<source src="/overlands/hero-pool.webm" type="video/webm" />
			<source src="/overlands/hero-pool.mp4" type="video/mp4" />
		</video>
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
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each gallery as item (item.name)}
				<figure>
					{#if item.kind === 'clip'}
						<video
							muted
							loop
							playsinline
							preload="none"
							poster="/overlands/{item.name}-poster.webp"
							aria-label={item.caption}
							use:playWhenVisible
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

	<!-- Six worlds to walk into -->
	<div class="px-6 pb-10 md:px-10">
		<h3 class="text-janus-amber mb-4 text-2xl">Worlds to visit</h3>
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
