<script lang="ts">
	// The jhalar: the scalloped valance with hanging bells that trims every
	// truck's bumper. Hangs off the bottom of the tailgate (result) panel —
	// this is Likhai's signature flourish, so it appears in exactly one place.
	let { width = '100%' }: { width?: string } = $props();
</script>

<svg style:width class="jhalar" aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 400 26" height="26">
	{#each Array.from({ length: 16 }) as _, i (i)}
		<path
			d="M {i * 25} 0 A 12.5 13 0 0 0 {i * 25 + 25} 0 Z"
			fill={['var(--rose-red)', 'var(--emerald)', 'var(--electric-blue)', 'var(--magenta)'][i % 4]}
			stroke="var(--bone)"
			stroke-width="1.5"
		/>
		<line x1={i * 25 + 12.5} y1="13" x2={i * 25 + 12.5} y2="18" stroke="var(--bone)" stroke-width="1" />
		<circle cx={i * 25 + 12.5} cy="20.5" r="2.5" fill="var(--canary)" stroke="var(--ink)" stroke-width="0.75" />
	{/each}
</svg>

<style>
	.jhalar {
		display: block;
		margin-top: -6px; /* tuck under the frame's bottom border */
	}
</style>
