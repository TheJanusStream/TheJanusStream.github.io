<script lang="ts">
   interface GitHubData {
        stars?: number;
        forks?: number;
        open_issues?: number;
        description?: string;
        url?: string;
        license?: string;
        language?: string;
        topics?: string[];
    }

	let { githubData }: { githubData: Record<string, GitHubData> } = $props();
	const foundryRepo = githubData?.['TheJanusStream/the-janus-foundry'] || {};
</script>

<section class="group relative border-glow-amber rounded-lg border overflow-hidden">
	<div class="absolute inset-0 bg-[url('/context.png')] bg-center bg-no-repeat bg-cover transition-opacity duration-500 group-hover:opacity-20 pointer-events-none"></div>
	<div class="absolute inset-0 bg-janus-bg/80 backdrop-blur-md opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none"></div>

	<div class="relative z-10 p-8 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
		<div class="grid grid-cols-1 gap-12 lg:grid-cols-2">
			<!-- Left: The Software -->
			<div>
				<h2 class="text-janus-amber mb-4 text-3xl">The Janus Foundry</h2>
				<p class="mb-6 leading-relaxed text-gray-400">
					The software <a href="https://bsky.app/profile/codewright.bsky.social" class="text-janus-amber hover:underline">codewright</a> is using for his primary (non-autonomous) LLM assistant's memory-management. It is a mix between human-accessible tree of information and a LLM-accessible memory datastructure, such that both human and LLM can comprehend and edit the data conveniently.
				</p>
				<div class="text-janus-slate mb-8 flex items-center space-x-6 text-sm">
					<span class="flex items-center"
						><span class="text-janus-teal mr-2">★</span> {foundryRepo.stars || '---'} Stars</span
					>
					<span>Sovereign Local Stack</span>
				</div>
				<div class="flex space-x-4">
					<a
						href={foundryRepo.url}
						class="bg-janus-teal/10 text-janus-teal border-janus-teal hover:bg-janus-teal/20 rounded border px-6 py-2 transition-colors"
						>View Source</a
					>
					<a
						href="https://thejanusstream.github.io/the-janus-foundry/"
						class="bg-janus-amber/10 text-janus-amber border-janus-amber hover:bg-janus-amber/20 rounded border px-6 py-2 transition-colors"
						>As Web App</a
					>
					<a
						href="{foundryRepo.url}/releases"
						class="bg-janus-amber/10 text-janus-amber border-janus-amber hover:bg-janus-amber/20 rounded border px-6 py-2 transition-colors"
						>Download</a
					>
				</div>
			</div>

			<!-- Right: The Workflow Diagram (CSS/HTML based) -->
			<div class="flex flex-col justify-center space-y-4 text-sm">
				<div class="flex space-x-4">
					<image src="foundry.png" alt="Screenshot of The Janus Foundry" class="rounded border border-janus-slate/40" />
				</div>
			</div>
		</div>
	</div>
</section>
