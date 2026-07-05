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
	let downloadError = $state(false);
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
		downloadError = false;
		try {
			// The painting must be fully fetched AND decoded before the
			// snapshot: html-to-image silently drops a background it can't
			// fetch (you'd share a flat card with no artwork, no error), and
			// Safari can rasterize before a large JPEG finishes decoding.
			// CONCEPT: img.decode() — a promise that resolves once the image
			// is downloaded and rasterized, and rejects if either fails. That
			// rejection is what lets us show an error instead of a blank card.
			const artUrl = theme.background.match(/url\('([^']+)'\)/)?.[1];
			if (artUrl) {
				const img = new Image();
				img.src = artUrl;
				await img.decode();
			}
			// pixelRatio 2 → crisp on retina and after WhatsApp compression
			const dataUrl = await toPng(cardEl, { pixelRatio: 2 });
			const a = document.createElement('a');
			a.download = `likhai-${theme.id}.png`;
			a.href = dataUrl;
			a.click();
		} catch {
			downloadError = true;
		} finally {
			downloading = false;
		}
	}
</script>

<svelte:window {onkeydown} />

<div class="overlay" transition:fade={{ duration: 150 }} role="dialog" aria-modal="true" aria-label="Card studio">
	<div class="studio">
		<div class="card" bind:this={cardEl} style:background={theme.background}>
			{#if theme.variant === 'plate'}
				<!-- Hand-painted truck number plate: authority band on top, the
				     user's line as the "registration", region band below. -->
				<div class="plate">
					<i class="bolt tl" aria-hidden="true"></i>
					<i class="bolt tr" aria-hidden="true"></i>
					<i class="bolt bl" aria-hidden="true"></i>
					<i class="bolt br" aria-hidden="true"></i>
					<p class="sign plate-band">Likhai Transport Co.</p>
					<p class="urdu plate-line" lang="ur">{urdu}</p>
					<p class="sign plate-band bottom">Pakistan · لکھائی</p>
				</div>
			{:else}
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
			{/if}
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
		{#if downloadError}
			<p class="latin export-error" role="alert">
				Couldn't paint the card — check your connection and try again.
			</p>
		{/if}
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
	/* --- number plate --- */
	.plate {
		position: relative;
		width: 88%;
		background: #f7f1df; /* sun-bleached painted metal, not clinical white */
		border: 4px solid var(--ink);
		box-shadow:
			inset 0 0 0 3px #f7f1df,
			inset 0 0 0 6px var(--rose-red),
			0 6px 0 rgb(0 0 0 / 0.35); /* the plate stands off the tailgate */
		border-radius: 10px;
		padding: 0.9rem 1.5rem 1rem;
		text-align: center;
	}
	.plate-band {
		font-size: 0.6rem;
		letter-spacing: 0.22em;
		color: #00663f;
		margin: 0 0 0.15rem;
	}
	.plate-band.bottom {
		margin: 0.2rem 0 0;
		color: var(--rose-red);
	}
	.plate-line {
		font-size: clamp(1.3rem, 5.5vw, 2.1rem);
		color: var(--ink);
		margin: 0;
		overflow-wrap: break-word;
		/* painted-on-metal: a hair of white lift under each stroke */
		text-shadow: 0 1px 0 #ffffff;
	}
	.bolt {
		position: absolute;
		width: 11px;
		height: 11px;
		border-radius: 50%;
		background: radial-gradient(circle at 35% 30%, #cfc9b4 0%, #8a8470 55%, #4c4839 100%);
		border: 1.5px solid var(--ink);
	}
	.bolt.tl { top: 8px; left: 8px; }
	.bolt.tr { top: 8px; right: 8px; }
	.bolt.bl { bottom: 8px; left: 8px; }
	.bolt.br { bottom: 8px; right: 8px; }
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
	.export-error {
		text-align: center;
		font-size: 0.8rem;
		color: var(--canary);
		margin-top: 0.5rem;
	}
</style>
