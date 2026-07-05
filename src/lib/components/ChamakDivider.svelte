<script lang="ts">
	// Chamak patti — Karachi's reflective-tape mosaic — as a section divider.
	// Alternating triangles in the four loudest truck colors, each outlined
	// in ink so the hues never touch (the phool patti separation rule).
	let { height = 14 }: { height?: number } = $props();
</script>

<svg width="100%" {height} aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 560 14">
	{#each Array.from({ length: 28 }) as _, i (i)}
		<polygon
			points="{i * 20},14 {i * 20 + 10},0 {i * 20 + 20},14"
			fill={['var(--rose-red)', 'var(--canary)', 'var(--emerald)', 'var(--electric-blue)'][i % 4]}
			stroke="var(--ink)"
			stroke-width="1"
		/>
	{/each}
</svg>
