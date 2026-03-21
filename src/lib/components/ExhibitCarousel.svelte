<script lang="ts">
    import type { Snippet } from 'svelte';

    let { children, labels }: { children: Snippet<[number]>; labels: string[] } = $props();

    let current = $state(0);
    const count = $derived(labels.length);

    function prev() {
        current = (current - 1 + count) % count;
    }

    function next() {
        current = (current + 1) % count;
    }

    function go(index: number) {
        current = index;
    }

    function onkeydown(e: KeyboardEvent) {
        if (e.key === 'ArrowLeft') prev();
        else if (e.key === 'ArrowRight') next();
    }
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div class="relative" role="region" aria-label="Exhibit carousel" tabindex="0" onkeydown={onkeydown}>


    <!-- Navigation: arrows + dots -->
    <div class="mt-6 flex items-center justify-center gap-6">
        <button
            onclick={prev}
            aria-label="Previous exhibit"
            class="flex h-10 w-10 items-center justify-center rounded-full border border-janus-slate/40 text-janus-slate transition-colors hover:border-janus-teal hover:text-janus-teal"
        >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
        </button>

        <div class="flex items-center gap-3">
            {#each labels as label, i}
                <button
                    onclick={() => go(i)}
                    aria-label="Go to {label}"
                    aria-current={i === current ? 'true' : undefined}
                    class="group/dot flex flex-col items-center gap-1.5 transition-all"
                >
                    <span
                        class="block h-2.5 w-2.5 rounded-full border transition-all duration-300 {i === current
                            ? 'border-janus-teal bg-janus-teal scale-125 shadow-[0_0_8px_rgba(57,197,207,0.6)]'
                            : 'border-janus-slate/60 bg-transparent hover:border-janus-teal/60'}"
                    ></span>
                    <span
                        class="text-[10px] uppercase tracking-widest transition-colors duration-300 {i === current
                            ? 'text-janus-teal'
                            : 'text-janus-slate/60 group-hover/dot:text-janus-slate'}"
                    >{label}</span>
                </button>
            {/each}
        </div>

        <button
            onclick={next}
            aria-label="Next exhibit"
            class="flex h-10 w-10 items-center justify-center rounded-full border border-janus-slate/40 text-janus-slate transition-colors hover:border-janus-teal hover:text-janus-teal"
        >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
        </button>
    </div>
<br/>
    <!-- Slide area -->
    <div class="overflow-hidden rounded-lg">
        {@render children(current)}
    </div>

</div>
