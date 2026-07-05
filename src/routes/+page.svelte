<script lang="ts">
	// Likhai's main page: type Roman Urdu, watch real Urdu fade in, put it
	// on a truck. This file owns the whole conversion flow; the card studio
	// and corpus consent hook in here too.
	// CONCEPT: reactive state — `$state` variables re-render the page when
	// they change; Svelte compiles this away instead of shipping a diffing
	// engine to the browser like React does.
	import PhoolPattiFrame from '$lib/components/PhoolPattiFrame.svelte';
	import ChamakDivider from '$lib/components/ChamakDivider.svelte';
	import Jhalar from '$lib/components/Jhalar.svelte';
	import CardStudio from '$lib/components/CardStudio.svelte';
	import type { ApiConvertResponse } from '$lib/engines/types';
	import { fade } from 'svelte/transition';

	let roman = $state('');
	let urdu = $state('');
	let status = $state<'idle' | 'loading' | 'done' | 'error' | 'not_urdu' | 'rate_limited'>('idle');
	let consent = $state(false);
	let copied = $state(false);
	let showStudio = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	// CONCEPT: debounce — wait until the user pauses typing (800ms) before
	// calling the paid API, instead of firing on every keystroke.
	function onInput() {
		clearTimeout(timer);
		const text = roman.trim();
		if (!text) {
			status = 'idle';
			urdu = '';
			return;
		}
		timer = setTimeout(() => convert(text), 800);
	}

	async function convert(text: string) {
		status = 'loading';
		try {
			const res = await fetch('/api/convert', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ text }),
			});
			// The response type is shared with the server (types.ts) — the
			// reason strings below can't silently drift from what it sends.
			const data: ApiConvertResponse = await res.json();
			if (data.ok) {
				urdu = data.urdu;
				status = 'done';
			} else if (data.reason === 'not_roman_urdu') {
				status = 'not_urdu';
			} else if (data.reason === 'rate_limited') {
				status = 'rate_limited';
			} else {
				status = 'error';
			}
		} catch {
			status = 'error';
		}
	}

	async function copyUrdu() {
		await navigator.clipboard.writeText(urdu);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}
</script>

<svelte:head>
	<title>Likhai — Roman Urdu in, real Urdu out</title>
	<meta name="description" content="Type Roman Urdu, get real Urdu script — then put it on a truck." />
	<meta name="theme-color" content="#0a0e24" />
</svelte:head>

<main>
	<header>
		<p class="sign eyebrow" aria-hidden="true">— ● —</p>
		<h1 class="urdu" lang="ur" translate="no">لکھائی</h1>
		<p class="sign tagline">Roman Urdu in <span class="tagline-dot">●</span> real Urdu out</p>
	</header>

	<ChamakDivider />

	<PhoolPattiFrame accent="var(--canary)">
		<label class="sign input-label" for="roman-input">Likho</label>
		<textarea
			id="roman-input"
			name="roman"
			bind:value={roman}
			oninput={onInput}
			maxlength="500"
			rows="3"
			placeholder="kya haal hai yaar…"
			spellcheck="false"
			autocomplete="off"
		></textarea>
	</PhoolPattiFrame>

	<!-- aria-live: screen readers announce conversion results as they arrive -->
	<div class="status-region" aria-live="polite">
	{#if status === 'loading'}
		<p class="latin status" transition:fade={{ duration: 150 }}>رنگ چڑھ رہا ہے — painting…</p>
	{:else if status === 'done'}
		<div transition:fade={{ duration: 250 }}>
			<PhoolPattiFrame accent="var(--emerald)">
				<p class="urdu result" lang="ur">{urdu}</p>
				<div class="actions">
					<button class="sign" onclick={copyUrdu}>{copied ? 'Copied!' : 'Copy'}</button>
					<button class="sign primary urdu-btn" lang="ur" onclick={() => (showStudio = true)}>ٹرک پہ لگا دو</button>
				</div>
			</PhoolPattiFrame>
			<Jhalar />
			<label class="latin consent">
				<input type="checkbox" bind:checked={consent} />
				Add this conversion (anonymously) to an open Urdu dataset
			</label>
		</div>
	{:else if status === 'not_urdu'}
		<p class="latin status" transition:fade={{ duration: 150 }}>
			Yeh Roman Urdu nahi lag rahi — try something like “dil ki baat”
		</p>
	{:else if status === 'rate_limited'}
		<p class="latin status" transition:fade={{ duration: 150 }}>
			Thora aaram — you're converting faster than the painter can paint. Try again in a minute.
		</p>
	{:else if status === 'error'}
		<p class="latin status error" transition:fade={{ duration: 150 }}>
			Kuch garbar ho gayi — the paint shop didn't answer.
			<button class="sign retry" onclick={() => convert(roman.trim())}>Try again</button>
		</p>
	{/if}
	</div>
</main>

{#if showStudio}
	<CardStudio {urdu} onclose={() => (showStudio = false)} />
{/if}

<style>
	main {
		max-width: 640px;
		margin: 0 auto;
		padding: 3rem 1.25rem 4rem;
		display: grid;
		gap: 1.75rem;
	}
	header {
		text-align: center;
		display: grid;
		gap: 0.25rem;
	}
	.eyebrow {
		color: var(--canary);
		font-size: 0.8rem;
		margin: 0;
	}
	h1 {
		font-size: clamp(3.25rem, 12vw, 4.5rem);
		margin: 0;
		color: var(--canary);
		text-shadow:
			3px 3px 0 var(--rose-red),
			6px 6px 0 var(--lacquer-deep);
		line-height: 1.6;
	}
	.tagline {
		font-size: 0.85rem;
		color: var(--bone);
		margin: 0;
	}
	.tagline-dot {
		color: var(--rose-red);
	}
	.input-label {
		display: block;
		font-size: 0.8rem;
		color: var(--canary);
		margin-bottom: 0.5rem;
	}
	textarea {
		width: 100%;
		box-sizing: border-box;
		font-family: var(--font-latin);
		font-size: 1.2rem;
		background: transparent;
		color: var(--bone);
		border: none;
		outline: none; /* the frame is the visual boundary; focus ring below */
		resize: vertical;
	}
	textarea:focus-visible {
		outline: 3px solid var(--electric-blue);
		outline-offset: 6px;
	}
	textarea::placeholder {
		color: color-mix(in srgb, var(--bone) 45%, transparent);
	}
	.result {
		font-size: clamp(1.6rem, 5.5vw, 2.1rem);
		text-align: center;
		margin: 0.25rem 0 1.25rem;
		color: var(--bone);
		overflow-wrap: break-word; /* a 500-char unbroken paste must not blow the panel open */
	}
	.status-region {
		display: grid;
		gap: 1.75rem;
	}
	.actions {
		display: flex;
		gap: 0.75rem;
		justify-content: center;
		flex-wrap: wrap;
	}
	button {
		cursor: pointer;
		border: 2px solid var(--bone);
		border-radius: 6px;
		background: var(--lacquer-deep);
		color: var(--bone);
		padding: 0.55rem 1.4rem;
		font-size: 0.9rem;
		touch-action: manipulation; /* no 300ms double-tap delay on phones */
		transition: transform 120ms ease; /* transform only — compositor-friendly */
	}
	button:hover {
		transform: translateY(-1px);
		box-shadow: 0 3px 0 var(--ink);
	}
	button:active {
		transform: translateY(0);
		box-shadow: none;
	}
	button.primary {
		background: var(--rose-red);
		border-color: var(--canary);
		font-weight: 700;
	}
	/* The CTA is Urdu text — sign font doesn't cover Arabic script, so it
	   falls back to Nastaliq, which is exactly right for a painted tailgate. */
	button.urdu-btn {
		font-family: var(--font-urdu);
		font-size: 1.05rem;
		line-height: 1.9;
		text-transform: none;
		letter-spacing: 0;
	}
	.consent {
		display: flex;
		gap: 0.5rem;
		align-items: flex-start; /* checkbox hugs the first line when the label wraps */
		justify-content: center;
		font-size: 0.85rem;
		opacity: 0.85;
		margin-top: 1rem;
	}
	.consent input {
		accent-color: var(--emerald);
		width: 1rem;
		height: 1rem;
	}
	.status {
		text-align: center;
		margin: 0;
	}
	.error {
		color: var(--canary);
	}
	.retry {
		margin-left: 0.5rem;
		font-size: 0.75rem;
		padding: 0.3rem 0.8rem;
	}
</style>
