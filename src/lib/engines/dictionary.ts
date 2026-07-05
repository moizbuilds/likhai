// The baseline engine: word-by-word dictionary lookup, nothing clever.
// It exists to LOSE — it makes the Claude engine's benchmark score meaningful.
import type { ConversionEngine, ConversionResult } from './types';
import { WORD_MAP } from './dictionary-data';

// Lookup keys are lowercase a-z only; punctuation and digits are stripped.
function normalizeToken(token: string): string {
	return token.toLowerCase().replace(/[^a-z]/g, '');
}

// Object.hasOwn guards against JavaScript's prototype chain: without it,
// WORD_MAP['constructor'] would "find" a built-in Object function and the
// engine would happily output it as Urdu.
function lookup(key: string): string | undefined {
	return key && Object.hasOwn(WORD_MAP, key) ? WORD_MAP[key] : undefined;
}

export const dictionaryEngine: ConversionEngine = {
	name: 'dictionary',
	// CONCEPT: async/await — convert returns a Promise (a value that arrives
	// later). The dictionary answers instantly, but the shared interface is
	// async because the Claude engine has to wait on the network.
	async convert(roman: string): Promise<ConversionResult> {
		const trimmed = roman.trim();
		if (!trimmed) return { ok: false, reason: 'not_roman_urdu' };

		let matched = 0;
		const words = trimmed.split(/\s+/).map((token) => {
			// Peel off surrounding punctuation, convert the core, put it back —
			// "hai?" becomes "ہے?" instead of silently eating the "?".
			const lead = token.match(/^[^a-zA-Z]*/)![0];
			const trail = token.match(/[^a-zA-Z]*$/)![0];
			const core = token.slice(lead.length, token.length - trail.length);
			const hit = lookup(normalizeToken(core));
			if (hit) {
				matched++;
				return lead + hit + trail;
			}
			return token; // unknown words pass through — an honest baseline doesn't guess
		});

		if (matched === 0) return { ok: false, reason: 'not_roman_urdu' };
		return { ok: true, urdu: words.join(' ') };
	},
};
