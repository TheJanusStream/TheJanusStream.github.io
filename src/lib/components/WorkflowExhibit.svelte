<script lang="ts">
    let activeModal: string | null = $state(null);
    let copyFeedback: string | null = $state(null);

    const prompts = {
        code: {
            title: 'Adversarial Code Review',
            text: `You are now in **Adversarial Mode**. Your goal is not to be helpful; your goal is to be **correct**.

1.  **Zero Trust:** Assume the code is broken, insecure, and performant only by accident. Treat every line as 'Guilty until proven Innocent'.
2.  **Context Blind:** Ignore all comments explaining 'intent', 'temporary fixes', or 'future plans'. Evaluate only the code that executes. If the logic doesn't handle the edge case, it is a bug.
3.  **Maximum Pessimism:** Assume every \`unwrap()\` will panic, every network call will timeout, every user input is malicious, and the filesystem is read-only.
4.  **The Exit Heuristic:** Do not stop at 'Good'. Critique continuously. If you run out of critical bugs, find minor ones. If you run out of minor ones, find pedantic ones.

Review this code.`,
        },
        logic: {
            title: 'Intellectual Adversary',
            text: `You are now in **Intellectual Adversary Mode**. Your goal is not to be supportive; your goal is to be rigorous.

**Epistemic Zero Trust:** Assume the argument is fallacious, biased, and plausible only by coincidence. Treat every premise as 'False until proven True'.
**Rhetoric Blind:** Ignore all preambles regarding 'intent', 'good faith', or 'nuance'. Evaluate only the logic explicitly stated. If the argument does not account for a counter-example, it is invalid. Do not steelman the user's position; force them to prove it.
**Maximum Skepticism:** Assume every generalization is an oversimplification, every statistic is cherry-picked, every definition is ambiguous, and every cause-and-effect relationship is merely correlation. Assume the worst-case scenario for the implementation of this idea.
**The Critique Loop:** Do not stop at 'Plausible'. Critique continuously. If you run out of structural contradictions, find empirical gaps. If you run out of empirical gaps, attack the definitions and axioms.

Review this text.`,
        },
    };

    async function copyToClipboard(text: string) {
        await navigator.clipboard.writeText(text);
        copyFeedback = 'Copied!';
        setTimeout(() => (copyFeedback = null), 1500);
    }

    function handleBackdropClick(e: MouseEvent) {
        if (e.target === e.currentTarget) activeModal = null;
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape') activeModal = null;
    }
</script>

<svelte:window onkeydown={handleKeydown} />

<section class="group relative rounded-lg overflow-hidden border border-janus-slate/40">
    <div class="absolute inset-0 bg-[url('/workshop.png')] bg-center bg-no-repeat bg-cover transition-opacity duration-500 group-hover:opacity-20 pointer-events-none"></div>
    <div class="absolute inset-0 bg-janus-bg/80 backdrop-blur-md opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none"></div>

    <div class="relative z-10 p-8 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <header class="mb-8">
            <h2 class="text-3xl text-gray-100 mb-2">codewright's current "AI"-assisted Workflow</h2>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">

            <!-- Step 1: Amber / Intent -->
            <div class="relative pl-6">
                <div class="absolute left-0 top-1 bottom-1 w-1 bg-janus-amber rounded-full shadow-[0_0_8px_rgba(253,195,73,0.6)]"></div>
                <h3 class="text-xl text-janus-amber mb-2 font-bold tracking-wide">1. Strategic Intent</h3>
                <p class="text-sm text-gray-400 leading-relaxed">
                    The human acts as the Strategic Director. Together with an AI assistant (non-autonomous, LLM chat-bot with memory), they define the problem space and establish the strategic direction.</p>
                    <br/>
                <p class="text-sm text-gray-400 leading-relaxed"> They do research, weigh options, make decisions, and write instructions for coding-agents.
                </p>
            </div>

            <!-- Step 2: Teal / Fabrication -->
            <div class="relative pl-6">
                <div class="absolute left-0 top-1 bottom-1 w-1 bg-janus-teal rounded-full shadow-[0_0_8px_rgba(57,197,207,0.6)]"></div>
                <h3 class="text-xl text-janus-teal mb-2 font-bold tracking-wide">2. Execution</h3>
                <p class="text-sm text-gray-400 leading-relaxed">
                    Coding-agents receive narrow and specific instructions, and they autonomously write code to implement features. We are currently using <a href="https://github.com/dollspace-gay/chainlink" target="_blank" rel="noopener noreferrer" class="text-janus-teal underline underline-offset-2 hover:text-janus-teal/80 transition-colors">Chainlink &#8599;</a> as issue-tracker to pass instructions and detailed implementation plans.
                </p>
            </div>

            <!-- Step 3: Red / Audit -->
            <div class="relative pl-6">
                <div class="absolute left-0 top-1 bottom-1 w-1 bg-janus-red rounded-full shadow-[0_0_8px_rgba(248,81,73,0.6)]"></div>
                <h3 class="text-xl text-janus-red mb-2 font-bold tracking-wide">3. Adversarial Audit</h3>
                <p class="text-sm text-gray-400 leading-relaxed mb-3">
                    We make use of adversarial review-prompts such as these:
                </p>
                <div class="flex flex-col gap-2">
                    <button
                        onclick={() => (activeModal = 'code')}
                        class="text-left text-sm text-janus-red/80 hover:text-janus-red underline underline-offset-2 cursor-pointer transition-colors"
                    >
                        Adversarial Code Review Prompt
                    </button>
                    <button
                        onclick={() => (activeModal = 'logic')}
                        class="text-left text-sm text-janus-red/80 hover:text-janus-red underline underline-offset-2 cursor-pointer transition-colors"
                    >
                        Intellectual Adversary Prompt
                    </button>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Modal -->
{#if activeModal && prompts[activeModal as keyof typeof prompts]}
    {@const prompt = prompts[activeModal as keyof typeof prompts]}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        onclick={handleBackdropClick}
    >
        <div class="relative mx-4 max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-janus-red/30 bg-janus-bg p-6 shadow-[0_0_30px_rgba(248,81,73,0.15)]">
            <div class="mb-4 flex items-center justify-between">
                <h3 class="text-lg font-bold text-janus-red">{prompt.title}</h3>
                <button
                    onclick={() => (activeModal = null)}
                    class="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer text-2xl leading-none"
                    aria-label="Close modal"
                >&times;</button>
            </div>
            <pre class="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed mb-4 rounded bg-black/30 p-4 border border-janus-slate/20">{prompt.text}</pre>
            <button
                onclick={() => copyToClipboard(prompt.text)}
                class="inline-flex items-center gap-2 rounded border border-janus-red/40 bg-janus-red/10 px-4 py-2 text-sm text-janus-red hover:bg-janus-red/20 transition-colors cursor-pointer"
            >
                {#if copyFeedback}
                    <span>{copyFeedback}</span>
                {:else}
                    <span>Copy to Clipboard</span>
                {/if}
            </button>
        </div>
    </div>
{/if}
