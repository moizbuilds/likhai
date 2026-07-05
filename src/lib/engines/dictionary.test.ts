// Tests for the dictionary baseline engine. It is deliberately dumb:
// word-by-word lookup, unknown words pass through unchanged.
import { describe, it, expect } from 'vitest';
import { dictionaryEngine } from './dictionary';

describe('dictionaryEngine', () => {
	it('converts a known everyday sentence', async () => {
		const r = await dictionaryEngine.convert('kya haal hai');
		expect(r).toEqual({ ok: true, urdu: 'کیا حال ہے' });
	});

	it('passes unknown words through unchanged', async () => {
		const r = await dictionaryEngine.convert('kya zeitgeist hai');
		expect(r).toEqual({ ok: true, urdu: 'کیا zeitgeist ہے' });
	});

	it('normalizes case and strips punctuation for lookup', async () => {
		const r = await dictionaryEngine.convert('Kya haal hai?');
		expect(r.ok).toBe(true);
		if (r.ok) expect(r.urdu).toContain('کیا');
	});

	it('rejects input with zero recognizable Urdu words', async () => {
		const r = await dictionaryEngine.convert('the quick brown fox');
		expect(r).toEqual({ ok: false, reason: 'not_roman_urdu' });
	});

	it('rejects empty input', async () => {
		const r = await dictionaryEngine.convert('   ');
		expect(r).toEqual({ ok: false, reason: 'not_roman_urdu' });
	});
});
