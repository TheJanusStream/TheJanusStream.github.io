<script lang="ts">
    import { onMount } from 'svelte';
    import { DEPENDENCY_MAP, APP_NAMES, BEVY_NAMES } from '$lib/config';

    interface CrateData {
        version?: string;
        downloads?: number;
        recent_downloads?: number;
        description?: string;
        repository?: string;
        documentation?: string;
        homepage?: string;
        license?: string;
        keywords?: string[];
        categories?: string[];
        crate_size?: number;
        rust_lines?: number;
        rust_files?: number;
        created_at?: string;
        updated_at?: string;
    }

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

    let { cratesData, githubData }: { cratesData: Record<string, CrateData>; githubData: Record<string, GitHubData> } = $props();

    const dependencyMap = DEPENDENCY_MAP;

    /** Collect all transitive dependencies of a node */
    function resolveDeps(node: string): string[] {
        const visited: string[] = [];
        const stack = [node];
        while (stack.length > 0) {
            const current = stack.pop()!;
            if (visited.includes(current)) continue;
            visited.push(current);
            for (const dep of dependencyMap[current] ?? []) {
                stack.push(dep);
            }
        }
        return visited.filter(n => n !== node);
    }

    /** Collect all direct edges reachable from a node (for SVG highlighting) */
    function resolveEdges(node: string): Array<[string, string]> {
        const edges: Array<[string, string]> = [];
        const visited: string[] = [];
        const stack = [node];
        while (stack.length > 0) {
            const current = stack.pop()!;
            if (visited.includes(current)) continue;
            visited.push(current);
            for (const dep of dependencyMap[current] ?? []) {
                edges.push([current, dep]);
                stack.push(dep);
            }
        }
        return edges;
    }

    // --- Hover state ---
    let hoveredNode: string | null = $state(null);

    const activeDeps = $derived(hoveredNode ? resolveDeps(hoveredNode) : null);
    const activeEdges = $derived(hoveredNode ? resolveEdges(hoveredNode) : null);

    function isHighlighted(name: string): boolean {
        if (!hoveredNode) return true; // no hover → all visible
        if (name === hoveredNode) return true;
        return activeDeps?.includes(name) ?? false;
    }

    // --- SVG path computation ---
    let containerEl: HTMLDivElement | undefined = $state(undefined);
    let gridWrapperEl: HTMLDivElement | undefined = $state(undefined);
    let svgEl: SVGSVGElement | undefined = $state(undefined);
    let cardEls: Record<string, HTMLElement> = {};
    let svgPaths: Array<{ d: string; from: string; to: string }> = $state([]);

    /** Determine which layer a node belongs to for correct edge selection */
    function getLayer(name: string): number {
        if ((APP_NAMES as readonly string[]).includes(name)) return 3;
        if ((BEVY_NAMES as readonly string[]).includes(name)) return 2;
        return 1;
    }

    function computePaths() {
        if (!gridWrapperEl || !svgEl) return;
        const wrapperRect = gridWrapperEl.getBoundingClientRect();
        const paths: Array<{ d: string; from: string; to: string }> = [];

        for (const [parent, deps] of Object.entries(dependencyMap)) {
            const parentEl = cardEls[parent];
            if (!parentEl) continue;
            for (const dep of deps) {
                const depEl = cardEls[dep];
                if (!depEl) continue;

                const pRect = parentEl.getBoundingClientRect();
                const dRect = depEl.getBoundingClientRect();

                const parentLayer = getLayer(parent);
                const depLayer = getLayer(dep);

                let x1: number, y1: number, x2: number, y2: number;

                if (parentLayer > depLayer) {
                    // Parent is in a higher layer (visually above) → draw from bottom edge down to top edge
                    x1 = pRect.left + pRect.width / 2 - wrapperRect.left;
                    y1 = pRect.bottom - wrapperRect.top;
                    x2 = dRect.left + dRect.width / 2 - wrapperRect.left;
                    y2 = dRect.top - wrapperRect.top;
                } else {
                    // Same layer (intra-layer dep) → connect right edge to left edge
                    const pCenterY = pRect.top + pRect.height / 2 - wrapperRect.top;
                    const dCenterY = dRect.top + dRect.height / 2 - wrapperRect.top;

                    if (pRect.left < dRect.left) {
                        x1 = pRect.right - wrapperRect.left;
                        x2 = dRect.left - wrapperRect.left;
                    } else {
                        x1 = pRect.left - wrapperRect.left;
                        x2 = dRect.right - wrapperRect.left;
                    }
                    y1 = pCenterY;
                    y2 = dCenterY;
                }

                const dx = x2 - x1;
                const dy = y2 - y1;

                let d: string;
                if (parentLayer > depLayer) {
                    // Vertical bezier: smooth S-curve
                    const cpOffset = Math.abs(dy) * 0.4;
                    d = `M ${x1} ${y1} C ${x1} ${y1 + cpOffset}, ${x2} ${y2 - cpOffset}, ${x2} ${y2}`;
                } else {
                    // Horizontal bezier for same-layer
                    const cpOffset = Math.abs(dx) * 0.4;
                    d = `M ${x1} ${y1} C ${x1 + Math.sign(dx) * cpOffset} ${y1}, ${x2 - Math.sign(dx) * cpOffset} ${y2}, ${x2} ${y2}`;
                }

                paths.push({ d, from: parent, to: dep });
            }
        }
        svgPaths = paths;
    }

    function isEdgeActive(from: string, to: string): boolean {
        if (!activeEdges) return false;
        return activeEdges.some(([f, t]) => f === from && t === to);
    }

    onMount(() => {
        // Initial computation after layout settles
        const timer = setTimeout(() => computePaths(), 100);

        const onResize = () => computePaths();
        window.addEventListener('resize', onResize);

        // Recompute when the group hover reveals the content (opacity transition)
        const observer = new MutationObserver(() => {
            requestAnimationFrame(() => computePaths());
        });
        if (gridWrapperEl) {
            observer.observe(gridWrapperEl, { attributes: true, subtree: true, attributeFilter: ['class', 'style'] });
        }

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', onResize);
            observer.disconnect();
        };
    });

    function extractGitHubSlug(url: string | null): string | null {
        if (!url) return null;
        const match = url.match(/github\.com\/([^/]+\/[^/]+)/);
        return match ? match[1].replace(/\.git$/, '') : null;
    }

    function formatBytes(bytes: number | null): string {
        if (!bytes) return '—';
        if (bytes < 1024) return `${bytes} B`;
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    function formatNumber(n: number | null): string {
        if (n == null) return '—';
        if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
        return n.toString();
    }

    const canvasApps = [
        { slug: 'TheJanusStream/lsystem-explorer', name: 'lsystem-explorer', fallbackDesc: 'Interactive Evolutionary Computation workbench.', appUrl: 'https://thejanusstream.github.io/lsystem-explorer' },
        { slug: 'TheJanusStream/symbios-ground-lab', name: 'symbios-ground-lab', fallbackDesc: 'Procedural terraforming & urban tensor mapping.', appUrl: 'https://thejanusstream.github.io/symbios-ground-lab' },
        { slug: 'TheJanusStream/symbios-robot-lab', name: 'symbios-robot-lab', fallbackDesc: 'Robots with evolving bodies & brains.', appUrl: 'https://thejanusstream.github.io/symbios-robot-lab' }
    ];

    const getRepo = (slug: string) => githubData?.[slug] ?? null;

    const getCrate = (name: string) => {
        const c = cratesData?.[name];
        if (!c) return { name, version: '—', desc: 'Loading...', downloads: null, repository: null, documentation: null, license: null, keywords: [] as string[], crate_size: null, rust_lines: null, stars: null };
        const slug = extractGitHubSlug(c.repository ?? null);
        const gh = slug ? githubData?.[slug] : null;
        return {
            name,
            version: c.version ?? '—',
            desc: c.description ?? 'No description.',
            downloads: c.downloads ?? null,
            repository: c.repository ?? null,
            documentation: c.documentation ?? null,
            license: c.license ?? null,
            keywords: c.keywords ?? [],
            crate_size: c.crate_size ?? null,
            rust_lines: c.rust_lines ?? null,
            stars: gh?.stars ?? null
        };
    };
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<section class="group relative border border-glow-teal rounded-lg overflow-hidden">
    <div class="absolute inset-0 bg-[url('/symbios.png')] bg-center bg-no-repeat bg-cover transition-opacity duration-500 group-hover:opacity-20 pointer-events-none"></div>
    <div class="absolute inset-0 bg-janus-bg/80 backdrop-blur-md opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none"></div>

    <div class="relative z-10 p-8 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
         bind:this={containerEl}
         onmouseleave={() => { hoveredNode = null; }}>
        <h2 class="text-3xl text-janus-teal mb-2">The Symbios Ecosystem</h2>
        <p class="text-gray-400 mb-12">Morphogenetic engineering mapped from pure logic to interactive WASM canvases. Data flows bottom to top.</p>

        <!-- SVG substrate behind the grid -->
        <div class="relative" bind:this={gridWrapperEl}>
            <svg bind:this={svgEl}
                 class="absolute inset-0 w-full h-full pointer-events-none z-0"
                 style="overflow: visible;">
                {#each svgPaths as path (path.from + '->' + path.to)}
                    <path d={path.d}
                          fill="none"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          class="transition-all duration-300"
                          style="stroke: {hoveredNode && isEdgeActive(path.from, path.to) ? 'var(--color-janus-amber)' : 'var(--color-janus-slate)'}; opacity: {hoveredNode ? (isEdgeActive(path.from, path.to) ? 0.7 : 0.04) : 0.1};" />
                {/each}
            </svg>

            <div class="flex flex-col-reverse gap-6 relative z-10">

                <!-- Layer 1 (bottom): Sovereign Logic -->
                <div>
                    <h3 class="text-lg text-janus-slate border-b border-janus-slate pb-2 mb-4">1. Game-engine agnostic (Rust)</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {#each ['symbios-genetics', 'symbios','symbios-turtle-3d', 'symbios-robot', 'symbios-ground', 'symbios-tensor', 'symbios-shape', 'symbios-neat'] as crate (crate)}
                            {@const c = getCrate(crate)}
                            <div bind:this={cardEls[crate]}
                                 class="p-4 border rounded bg-black/50 flex flex-col transition-all duration-300 cursor-default {isHighlighted(crate) ? 'border-janus-teal/60' : 'border-janus-slate/10 opacity-20'} {hoveredNode === crate ? 'border-janus-teal shadow-[0_0_12px_rgba(57,197,207,0.3)]' : ''}"
                                 onmouseenter={() => { hoveredNode = crate; computePaths(); }}
                                 role="listitem">
                                <div class="flex justify-between items-start mb-2">
                                    <span class="font-bold text-gray-200 text-sm leading-tight">{c.name}</span>
                                    <span class="text-xs text-janus-teal shrink-0 ml-2">{c.version}</span>
                                </div>

                                <p class="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{c.desc}</p>

                                <div class="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-janus-slate mb-3">
                                    {#if c.downloads != null}
                                        <span title="Total downloads">&#x2B07; {formatNumber(c.downloads)}</span>
                                    {/if}
                                    {#if c.stars != null}
                                        <span title="GitHub stars">&#x2605; {c.stars}</span>
                                    {/if}
                                    {#if c.license}
                                        <span title="License">{c.license}</span>
                                    {/if}
                                    {#if c.rust_lines != null}
                                        <span title="Lines of Rust">{formatNumber(c.rust_lines)} loc</span>
                                    {/if}
                                    {#if c.crate_size != null}
                                        <span title="Crate size">{formatBytes(c.crate_size)}</span>
                                    {/if}
                                </div>

                                {#if c.keywords.length > 0}
                                    <div class="flex flex-wrap gap-1 mb-3">
                                        {#each c.keywords.slice(0, 4) as kw (kw)}
                                            <span class="text-[9px] px-1.5 py-0.5 rounded bg-janus-teal/10 text-janus-teal/70">{kw}</span>
                                        {/each}
                                    </div>
                                {/if}

                                <div class="mt-auto flex gap-2 pt-1">
                                    <a href="https://crates.io/crates/{c.name}" target="_blank" rel="noopener" class="text-[10px] uppercase tracking-widest text-janus-teal/70 hover:text-janus-teal transition-colors">crates.io</a>
                                    {#if c.repository}
                                        <a href={`${c.repository}`} target="_blank" rel="external noopener noreferrer" class="text-[10px] uppercase tracking-widest text-janus-teal/70 hover:text-janus-teal transition-colors">github</a>
                                    {/if}
                                    {#if c.documentation}
                                        <a href={c.documentation} target="_blank" rel="external noopener noreferrer" class="text-[10px] uppercase tracking-widest text-janus-teal/70 hover:text-janus-teal transition-colors">docs</a>
                                    {/if}
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>

                <!-- Layer 2 (middle): Bevy Integration -->
                <div>
                    <h3 class="text-lg text-janus-slate border-b border-janus-slate pb-2 mb-4">2. Integration Layer (for Bevy)</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {#each ['bevy_symbios', 'bevy_symbios_texture', 'bevy_symbios_ground', 'bevy_symbios_shape'] as crate (crate)}
                            {@const c = getCrate(crate)}
                            <div bind:this={cardEls[crate]}
                                 class="p-4 border rounded bg-black/50 flex flex-col transition-all duration-300 cursor-default {isHighlighted(crate) ? 'border-janus-purple/60' : 'border-janus-slate/10 opacity-20'} {hoveredNode === crate ? 'border-janus-purple shadow-[0_0_12px_rgba(163,113,247,0.3)]' : ''}"
                                 onmouseenter={() => { hoveredNode = crate; computePaths(); }}
                                 role="listitem">
                                <div class="flex justify-between items-start mb-2">
                                    <span class="font-bold text-gray-200 text-sm leading-tight">{c.name}</span>
                                    <span class="text-xs text-janus-purple shrink-0 ml-2">{c.version}</span>
                                </div>

                                <p class="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{c.desc}</p>

                                <div class="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-janus-slate mb-3">
                                    {#if c.downloads != null}
                                        <span title="Total downloads">&#x2B07; {formatNumber(c.downloads)}</span>
                                    {/if}
                                    {#if c.stars != null}
                                        <span title="GitHub stars">&#x2605; {c.stars}</span>
                                    {/if}
                                    {#if c.license}
                                        <span title="License">{c.license}</span>
                                    {/if}
                                    {#if c.rust_lines != null}
                                        <span title="Lines of Rust">{formatNumber(c.rust_lines)} loc</span>
                                    {/if}
                                    {#if c.crate_size != null}
                                        <span title="Crate size">{formatBytes(c.crate_size)}</span>
                                    {/if}
                                </div>

                                {#if c.keywords.length > 0}
                                    <div class="flex flex-wrap gap-1 mb-3">
                                        {#each c.keywords.slice(0, 4) as kw (kw)}
                                            <span class="text-[9px] px-1.5 py-0.5 rounded bg-janus-purple/10 text-janus-purple/70">{kw}</span>
                                        {/each}
                                    </div>
                                {/if}

                                <div class="mt-auto flex gap-2 pt-1">
                                    <a href="https://crates.io/crates/{c.name}" target="_blank" rel="noopener" class="text-[10px] uppercase tracking-widest text-janus-purple/70 hover:text-janus-purple transition-colors">crates.io</a>
                                    {#if c.repository}
                                        <a href={`${c.repository}`} target="_blank" rel="external noopener noreferrer" class="text-[10px] uppercase tracking-widest text-janus-purple/70 hover:text-janus-purple transition-colors">github</a>
                                    {/if}
                                    {#if c.documentation}
                                        <a href={c.documentation} target="_blank" rel="external noopener noreferrer" class="text-[10px] uppercase tracking-widest text-janus-purple/70 hover:text-janus-purple transition-colors">docs</a>
                                    {/if}
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>

                <!-- Layer 3 (top): Applications -->
                <div>
                    <h3 class="text-lg text-janus-slate border-b border-janus-slate pb-2 mb-4">3. Interactive Canvases (as WASM)</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {#each canvasApps as app (app.slug)}
                            {@const gh = getRepo(app.slug)}
                            <div bind:this={cardEls[app.name]}
                                 class="p-4 border rounded flex flex-col transition-all duration-300 cursor-default {isHighlighted(app.name) ? 'border-janus-amber/60 bg-janus-amber/5' : 'border-janus-slate/10 bg-transparent opacity-20'} {hoveredNode === app.name ? 'border-janus-amber shadow-[0_0_12px_rgba(253,195,73,0.3)]' : ''}"
                                 onmouseenter={() => { hoveredNode = app.name; computePaths(); }}
                                 role="listitem">
                                <span class="font-bold text-janus-amber block mb-2">{app.name}</span>
                                <p class="text-xs text-gray-400 mb-3">{gh?.description ?? app.fallbackDesc}</p>

                                {#if gh}
                                    <div class="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-janus-slate mb-3">
                                        {#if gh.stars != null}
                                            <span title="GitHub stars">&#x2605; {gh.stars}</span>
                                        {/if}
                                        {#if gh.forks != null}
                                            <span title="Forks">&#x2442; {gh.forks}</span>
                                        {/if}
                                        {#if gh.language}
                                            <span title="Primary language">{gh.language}</span>
                                        {/if}
                                        {#if gh.license}
                                            <span title="License">{gh.license}</span>
                                        {/if}
                                    </div>

                                    {#if gh.topics && gh.topics.length > 0}
                                        <div class="flex flex-wrap gap-1 mb-3">
                                            {#each gh.topics.slice(0, 4) as topic (topic)}
                                                <span class="text-[9px] px-1.5 py-0.5 rounded bg-janus-amber/10 text-janus-amber/70">{topic}</span>
                                            {/each}
                                        </div>
                                    {/if}
                                {/if}

                                <div class="mt-auto flex gap-2 pt-1">
                                    <a href={app.appUrl} target="_blank" rel="external noopener noreferrer" class="flex-1 block text-center py-2 bg-janus-amber/10 text-gray-200 text-xs uppercase tracking-widest border border-janus-amber rounded hover:bg-janus-amber hover:text-black transition-colors">Launch App</a>
                                    <a href="https://github.com/{app.slug}" target="_blank" rel="noopener" class="flex-none flex items-center px-3 py-2 bg-janus-amber/10 text-gray-200 text-xs uppercase tracking-widest border border-janus-amber rounded hover:bg-janus-amber hover:text-black transition-colors">Source</a>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
