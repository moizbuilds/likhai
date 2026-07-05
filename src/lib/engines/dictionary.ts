// The baseline engine: word-by-word dictionary lookup, nothing clever.
// It exists to LOSE — it makes the Claude engine's benchmark score meaningful.
import type { ConversionEngine, ConversionResult } from './types';
import { WORD_MAP } from './dictionary-data';

// Lookup keys are lowercase with punctuation stripped; apostrophes kept ("ma'an").
function normalizeToken(token: string): string {
	return token.toLowerCase().replace(/[^a-z']/g, '');
}

export const dictionaryEngine: ConversionEngine = {
	name: 'dictionary',
	async convert(roman: string): Promise<ConversionResult> {
		const trimmed = roman.trim();
		if (!trimmed) return { ok: false, reason: 'not_roman_urdu' };

		let matched = 0;
		const words = trimmed.split(/\s+/).map((token) => {
			const hit = WORD_MAP[normalizeToken(token)];
			if (hit) {
				matched++;
				return hit;
			}
			return token; // unknown words pass through — an honest baseline doesn't guess
		});

		if (matched === 0) return { ok: false, reason: 'not_roman_urdu' };
		return { ok: true, urdu: words.join(' ') };
	},
};
