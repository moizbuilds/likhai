// Runs every engine over the eval set, aggregates CER + word accuracy
// overall and per tier, writes committed JSON for the /benchmark page.
// Run with: npm run eval   (needs ANTHROPIC_API_KEY in .env; ~60 Claude calls ≈ pennies)
import 'dotenv/config';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dictionaryEngine } from '../src/lib/engines/dictionary';
import { claudeEngineFromKey } from '../src/lib/engines/claude';
import { characterErrorRate, wordAccuracy } from '../src/lib/eval/score';
import type { ConversionEngine } from '../src/lib/engines/types';

type Item = { id: number; tier: string; roman: string; reference: string };
const items: Item[] = JSON.parse(readFileSync('eval/testset.json', 'utf8'));

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) throw new Error('Set ANTHROPIC_API_KEY in .env');
const engines: ConversionEngine[] = [dictionaryEngine, claudeEngineFromKey(apiKey)];

type Score = { tier: string; cer: number; wa: number; failed: boolean };
const results = [];

for (const engine of engines) {
	const scores: Score[] = [];
	for (const item of items) {
		const r = await engine.convert(item.roman);
		if (r.ok) {
			scores.push({
				tier: item.tier,
				cer: characterErrorRate(item.reference, r.urdu),
				wa: wordAccuracy(item.reference, r.urdu),
				failed: false,
			});
		} else {
			// A refusal on a real sentence is a full miss — no partial credit.
			scores.push({ tier: item.tier, cer: 1, wa: 0, failed: true });
		}
		console.log(`${engine.name} #${item.id} ${r.ok ? 'ok' : 'FAIL'}`);
	}
	const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
	const tiers = [...new Set(items.map((i) => i.tier))];
	results.push({
		name: engine.name,
		overall: {
			cer: avg(scores.map((s) => s.cer)),
			wordAccuracy: avg(scores.map((s) => s.wa)),
			failures: scores.filter((s) => s.failed).length,
		},
		byTier: Object.fromEntries(
			tiers.map((t) => {
				const ts = scores.filter((s) => s.tier === t);
				return [t, { cer: avg(ts.map((s) => s.cer)), wordAccuracy: avg(ts.map((s) => s.wa)), count: ts.length }];
			}),
		),
	});
}

mkdirSync('src/lib/data', { recursive: true });
writeFileSync(
	'src/lib/data/benchmark-results.json',
	JSON.stringify({ ranAt: new Date().toISOString(), engines: results }, null, 2),
);
console.log('wrote src/lib/data/benchmark-results.json');
