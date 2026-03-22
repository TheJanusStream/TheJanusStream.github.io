<script lang="ts">
	// Packets: faint teal data fragments drifting along the 24px grid lines

	// Packets travel along grid-aligned rows/columns (multiples of 24px)
	const hPackets = [
		{ delay: 0, y: 192, dur: 9, left: -5 },
		{ delay: 5, y: 408, dur: 11, left: -8 },
		{ delay: 10, y: 120, dur: 8, left: -3 },
		{ delay: 16, y: 552, dur: 10, left: -6 },
		{ delay: 22, y: 312, dur: 8.5, left: -4 },
	];

	const vPackets = [
		{ delay: 3, x: 288, dur: 9.5, top: -5 },
		{ delay: 8, x: 576, dur: 10.5, top: -7 },
		{ delay: 14, x: 144, dur: 7.5, top: -4 },
		{ delay: 20, x: 720, dur: 9, top: -6 },
	];
</script>

<div class="forge-particles" aria-hidden="true">
	<!-- Horizontal data packets -->
	{#each hPackets as p}
		<div
			class="packet packet-h"
			style="
				top: {p.y}px;
				left: {p.left}vw;
				--dur: {p.dur}s;
				animation-delay: {p.delay}s;
			"
		></div>
	{/each}

	<!-- Vertical data packets -->
	{#each vPackets as p}
		<div
			class="packet packet-v"
			style="
				left: {p.x}px;
				top: {p.top}vh;
				--dur: {p.dur}s;
				animation-delay: {p.delay}s;
			"
		></div>
	{/each}
</div>

<style>
	.forge-particles {
		position: fixed;
		inset: 0;
		z-index: 1;
		pointer-events: none;
		overflow: hidden;
	}

	/* ── Data Packets ── */
	.packet {
		position: absolute;
		border-radius: 1px;
		opacity: 0;
	}

	/* Horizontal packet — slim, faint rectangle with soft trailing glow */
	.packet-h {
		width: 24px;
		height: 1px;
		background: linear-gradient(90deg, transparent, rgba(57, 197, 207, 0.6) 40%, rgba(57, 197, 207, 0.5));
		box-shadow:
			0 0 3px 1px rgba(57, 197, 207, 0.25),
			-6px 0 10px rgba(57, 197, 207, 0.1);
		animation: packet-flow-h var(--dur) linear infinite;
	}

	/* Vertical packet */
	.packet-v {
		width: 1px;
		height: 24px;
		background: linear-gradient(180deg, transparent, rgba(57, 197, 207, 0.6) 40%, rgba(57, 197, 207, 0.5));
		box-shadow:
			0 0 3px 1px rgba(57, 197, 207, 0.25),
			0 -6px 10px rgba(57, 197, 207, 0.1);
		animation: packet-flow-v var(--dur) linear infinite;
	}

	@keyframes packet-flow-h {
		0% {
			transform: translateX(0);
			opacity: 0;
		}
		3% {
			opacity: 0.35;
		}
		50% {
			opacity: 0.25;
		}
		92% {
			opacity: 0.15;
		}
		100% {
			transform: translateX(110vw);
			opacity: 0;
		}
	}

	@keyframes packet-flow-v {
		0% {
			transform: translateY(0);
			opacity: 0;
		}
		3% {
			opacity: 0.35;
		}
		50% {
			opacity: 0.25;
		}
		92% {
			opacity: 0.15;
		}
		100% {
			transform: translateY(110vh);
			opacity: 0;
		}
	}
</style>
