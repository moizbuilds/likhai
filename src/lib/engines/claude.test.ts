// CONCEPT: dependency injection — the engine receives its API client instead of
// creating one, so tests hand it a fake and never touch the network or spend money.
import { describe, it, expect } from 'vitest';
import { createClaudeEngine, type MessagesClient } from './claude';

function fakeClient(reply: string | Error): MessagesClient {
	return {
		messages: {
			async create() {
				if (reply instanceof Error) throw reply;
				return { content: [{ type: 'text', text: reply }] };
			},
		},
	};
}

describe('createClaudeEngine', () => {
	it('returns urdu when Claude replies with ok JSON', async () => {
		const engine = createClaudeEngine(fakeClient('{"ok": true, "urdu": "کیا حال ہے"}'));
		expect(await engine.convert('kya haal hai')).toEqual({ ok: true, urdu: 'کیا حال ہے' });
	});

	it('maps a not_roman_urdu reply through', async () => {
		const engine = createClaudeEngine(fakeClient('{"ok": false, "reason": "not_roman_urdu"}'));
		expect(await engine.convert('asdfgh')).toEqual({ ok: false, reason: 'not_roman_urdu' });
	});

	it('returns engine_error on malformed JSON', async () => {
		const engine = createClaudeEngine(fakeClient('Sure! Here is the conversion:'));
		expect(await engine.convert('kya haal hai')).toEqual({ ok: false, reason: 'engine_error' });
	});

	it('returns engine_error when the API throws', async () => {
		const engine = createClaudeEngine(fakeClient(new Error('529 overloaded')));
		expect(await engine.convert('kya haal hai')).toEqual({ ok: false, reason: 'engine_error' });
	});
});
