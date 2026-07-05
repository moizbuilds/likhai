<script lang="ts">
	// Every surface on a Pakistani truck is a bordered panel — this component
	// is the app's version of that rule. Double border (bone outside, accent
	// pinstripe inside), scalloped top edging, and hand-painted corner dots.
	// Content goes in the slot; the accent color is the panel's personality.
	import type { Snippet } from 'svelte';

	let {
		accent = 'var(--canary)',
		children,
	}: { accent?: string; children: Snippet } = $props();
</script>

<div class="frame" style:--accent={accent}>
	<svg class="scallops" aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 400 10">
		{#each Array.from({ length: 20 }) as _, i (i)}
			<circle cx={10 + i * 20} cy="0" r="6" fill="var(--accent)" stroke="var(--bone)" stroke-width="1.5" />
		{/each}
	</svg>
	<i class="dot tl" aria-hidden="true"></i>
	<i class="dot tr" aria-hidden="true"></i>
	<i class="dot bl" aria-hidden="true"></i>
	<i class="dot br" aria-hidden="true"></i>
	<div class="inner">{@render children()}</div>
</div>

<style>
	.frame {
		position: relative;
		border: 3px solid var(--bone);
		border-radius: 10px;
		background: color-mix(in srgb, var(--lacquer-deep) 88%, var(--accent) 12%);
		padding: 1.75rem 1.5rem 1.5rem;
		/* accent pinstripe inside the bone border — nested borders are the
		   most truck-art thing a rectangle can do */
		box-shadow:
			inset 0 0 0 4px var(--lacquer-deep),
			inset 0 0 0 6px var(--accent);
	}
	.scallops {
		position: absolute;
		top: -2px;
		left: 8px;
		width: calc(100% - 16px);
		height: 10px;
	}
	.dot {
		position: absolute;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--accent);
		border: 2px solid var(--bone);
	}
	.tl { top: 10px; left: 10px; }
	.tr { top: 10px; right: 10px; }
	.bl { bottom: 10px; left: 10px; }
	.br { bottom: 10px; right: 10px; }
	.inner {
		position: relative;
		padding: 0 0.75rem;
	}
</style>
