<script lang="ts">
	// Public benchmark: dictionary baseline vs Claude, from committed eval
	// results. The data is static at build time — no runtime cost, and anyone
	// can re-run `npm run eval` against the committed test set to reproduce it.
	import results from '$lib/data/benchmark-results.json';
	import PhoolPattiFrame from '$lib/components/PhoolPattiFrame.svelte';
	import ChamakDivider from '$lib/components/ChamakDivider.svelte';

	const TIER_LABELS: Record<string, string> = {
		clean: 'Clean',
		chaotic: 'Chaotic spelling',
		slang: 'Slang',
		code_switching: 'Code-switching',
		poetry: 'Poetry',
	};
	const ENGINE_META: Record<string, { label: string; color: string }> = {
		dictionary: { label: 'Dictionary baseline', color: 'var(--electric-blue)' },
		claude: { label: 'Claude', color: 'var(--canary)' },
	};
	const pct = (x: number) => Math.round(x * 100);
</script>

<svelte:head>
	<title>Likhai — the benchmark</title>
	<meta name="description" content="Dictionary baseline vs Claude on 60 Roman Urdu sentences. Real numbers, reproducible." />
	<meta name="theme-color" content="#0a0e24" />
</svelte:head>

<main>
	<header>
		<p class="sign eyebrow">The Benchmark</p>
		<p class="latin sub">
			60 Roman Urdu sentences with hand-verified references, across 5 difficulty
			tiers. Two engines: a 982-word dictionary (the honest baseline) and Claude.
			Higher word accuracy is better.
		</p>
	</header>

	<ChamakDivider />

	{#each results.engines as engine (engine.name)}
		<PhoolPattiFrame accent={ENGINE_META[engine.name].color}>
			<h2 class="sign engine-name">{ENGINE_META[engine.name].label}</h2>
			<p class="latin big" style:color={ENGINE_META[engine.name].color}>
				{pct(engine.overall.wordAccuracy)}<span class="unit">% word accuracy</span>
			</p>
			<p class="latin small">
				CER {engine.overall.cer.toFixed(3)} · {engine.overall.failures}
				{engine.overall.failures === 1 ? 'refusal' : 'refusals'}
			</p>

			{#each Object.entries(engine.byTier) as [tier, s] (tier)}
				<div class="row">
					<span class="latin tier">{TIER_LABELS[tier] ?? tier} ({s.count})</span>
					<svg height="18" role="img" aria-label="{TIER_LABELS[tier]}: {pct(s.wordAccuracy)} percent word accuracy">
						<rect x="0" y="3" width="100%" height="12" fill="var(--lacquer)" stroke="var(--bone)" stroke-width="1" />
						<rect x="0" y="3" width="{pct(s.wordAccuracy)}%" height="12" fill={ENGINE_META[engine.name].color} />
					</svg>
					<span class="latin val">{pct(s.wordAccuracy)}%</span>
				</div>
			{/each}
		</PhoolPattiFrame>
	{/each}

	<p class="latin small footer-note">
		Last run {new Date(results.ranAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
		· test set + runner live in the repo — same input, same numbers
	</p>
	<p class="latin small footer-note"><a href="/">← back to Likhai</a></p>
</main>

<style>
	main {
		max-width: 640px;
		margin: 0 auto;
		padding: 3rem 1.25rem 4rem;
		display: grid;
		gap: 1.5rem;
	}
	header {
		text-align: center;
		display: grid;
		gap: 0.6rem;
	}
	.eyebrow {
		color: var(--canary);
		font-size: 1.4rem;
		margin: 0;
	}
	.sub {
		opacity: 0.85;
		margin: 0;
		line-height: 1.5;
	}
	.engine-name {
		font-size: 0.9rem;
		margin: 0 0 0.25rem;
		color: var(--bone);
	}
	.big {
		font-size: 2.8rem;
		font-weight: 700;
		margin: 0;
		font-variant-numeric: tabular-nums;
	}
	.unit {
		font-size: 1rem;
		font-weight: 400;
		opacity: 0.8;
		color: var(--bone);
	}
	.small {
		font-size: 0.85rem;
		opacity: 0.75;
		margin: 0 0 0.75rem;
	}
	.row {
		display: grid;
		grid-template-columns: minmax(7rem, 10rem) 1fr 3rem;
		gap: 0.6rem;
		align-items: center;
		margin: 0.4rem 0;
	}
	.row svg {
		width: 100%;
	}
	.tier {
		font-size: 0.85rem;
	}
	.val {
		text-align: right;
		font-size: 0.85rem;
		font-variant-numeric: tabular-nums;
	}
	.footer-note {
		text-align: center;
		margin: 0;
	}
	a {
		color: var(--electric-blue);
	}
</style>
