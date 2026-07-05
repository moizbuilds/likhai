<script lang="ts">
	// The payoff screen: the user's Urdu line on a truck-art card. Real DOM
	// (real Nastaliq font) layered over the theme background, snapshotted to
	// PNG for WhatsApp/Instagram/LinkedIn.
	// CONCEPT: DOM-to-image — html-to-image draws the live DOM onto a canvas;
	// we use it because the browser is the only renderer that shapes Nastaliq
	// correctly (AI image models garble Urdu letter-joining).
	import { toPng } from 'html-to-image';
	import { CARD_THEMES } from '$lib/themes';
	import Jhalar from '$lib/components/Jhalar.svelte';
	import { fade } from 'svelte/transition';

	let { urdu, onclose }: { urdu: string; onclose: () => void } = $props();

	let theme = $state(CARD_THEMES[0]);
	let cardEl: HTMLDivElement | undefined = $state();
	let downloading = $state(false);
	let closeBtn: HTMLButtonElement | undefined = $state();

	// A dialog must trap attention: focus moves in on open, Escape closes.
	$effect(() => {
		closeBtn?.focus();
	});

	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onclose();
	}

	async function download() {
		if (!cardEl) return;
		downloading = true;
		try {
			// pixelRatio 2 → crisp on retina and after WhatsApp compression
			const dataUrl = await toPng(cardEl, { pixelRatio: 2 });
			const a = document.createElement('a');
			a.download = `likhai-${theme.id}.png`;
			a.href = dataUrl;
			a.click();
		} finally {
			downloading = false;
		}
	}
</script>

<svelte:window {onkeydown} />

<div class="overlay" transition:fade={{ duration: 150 }} role="dialog" aria-modal="true" aria-label="Card studio">
	<div class="studio">
		<div class="card" bind:this={cardEl} style:background={theme.background}>
			<p
				class="urdu line"
				class:on-panel={!!theme.panel}
				lang="ur"
				style:color={theme.textColor}
				style:--shadow={theme.shadowColor}
				style:--panel-bg={theme.panel?.background ?? 'transparent'}
				style:--panel-border={theme.panel?.border ?? 'transparent'}
			>
				{urdu}
			</p>
			<span class="sign watermark">likhai</span>
		</div>
		<Jhalar />

		<div class="themes" role="radiogroup" aria-label="Art theme">
			{#each CARD_THEMES as t (t.id)}
				<button
					class="sign theme-btn"
					class:active={t.id === theme.id}
					role="radio"
					aria-checked={t.id === theme.id}
					onclick={() => (theme = t)}
				>{t.label}</button>
			{/each}
		</div>

		<div class="actions">
			<button class="sign primary" onclick={download} disabled={downloading}>
				{downloading ? 'Painting…' : 'Download PNG'}
			</button>
			<button class="sign" bind:this={closeBtn} onclick={onclose}>Close</button>
		</div>
	</div>
</div>

<style>
	.overlay {
		position: fixed;
		inset: 0;
		background: rgb(10 14 36 / 0.93);
		display: grid;
		place-items: center;
		padding: 1rem;
		z-index: 10;
		overscroll-behavior: contain;
	}
	.studio {
		display: grid;
		gap: 0.75rem;
		max-width: 420px;
		width: 100%;
	}
	.card {
		aspect-ratio: 4 / 5;
		border: 4px solid var(--bone);
		border-radius: 10px;
		box-shadow: inset 0 0 0 5px var(--ink), inset 0 0 0 7px var(--canary);
		display: grid;
		place-items: center;
		padding: 2rem;
		position: relative;
		overflow: hidden;
	}
	.line {
		font-size: clamp(1.4rem, 6vw, 2.4rem);
		text-align: center;
		margin: 0;
		overflow-wrap: break-word;
		max-width: 100%;
		/* double offset shadow = painted letters with depth, truck style */
		text-shadow:
			2px 2px 0 var(--shadow),
			-1px -1px 0 var(--shadow);
	}
	.line.on-panel {
		background: var(--panel-bg);
		border: 3px solid var(--panel-border);
		border-radius: 8px;
		padding: 0.75rem 1.5rem;
	}
	.watermark {
		position: absolute;
		bottom: 0.7rem;
		right: 1rem;
		font-size: 0.7rem;
		opacity: 0.75;
		color: var(--bone);
		text-shadow: 1px 1px 0 var(--ink);
	}
	.themes {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		justify-content: center;
	}
	.theme-btn {
		border: 2px solid var(--bone);
		background: transparent;
		color: var(--bone);
		border-radius: 6px;
		padding: 0.35rem 0.75rem;
		font-size: 0.7rem;
		cursor: pointer;
		touch-action: manipulation;
	}
	.theme-btn.active {
		background: var(--canary);
		color: var(--ink);
		border-color: var(--canary);
	}
	.actions {
		display: flex;
		gap: 0.75rem;
		justify-content: center;
	}
	.actions button {
		cursor: pointer;
		border: 2px solid var(--bone);
		border-radius: 6px;
		background: var(--lacquer-deep);
		color: var(--bone);
		padding: 0.55rem 1.4rem;
		font-size: 0.8rem;
		touch-action: manipulation;
	}
	.actions button.primary {
		background: var(--rose-red);
		border-color: var(--canary);
		font-weight: 700;
	}
	.actions button:disabled {
		opacity: 0.6;
		cursor: wait;
	}
</style>
