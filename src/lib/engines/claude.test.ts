// Tests for the Claude engine. The injected fake client (see MessagesClient
// in claude.ts) lets us simulate every API response shape without spending
// money or touching the network.
import { describe, it, expect } from 'vitest';
import { createClaudeEngine, type MessagesClient } from './claude';

type ContentBlock = { type: string; text?: string };

function fakeClient(reply: ContentBlock[] | Error): MessagesClient {
	return {
		messages: {
			async create() {
				if (reply instanceof Error) throw reply;
				return { content: reply };
			},
		},
	};
}

const textBlock = (text: string): ContentBlock => ({ type: 'text', text });

describe('createClaudeEngine', () => {
	it('returns urdu when Claude replies with ok JSON', async () => {
		const engine = createClaudeEngine(fakeClient([textBlock('{"ok": true, "urdu": "کیا حال ہے"}')]));
		expect(await engine.convert('kya haal hai')).toEqual({ ok: true, urdu: 'کیا حال ہے' });
	});

	it('finds the text block even when a thinking block comes first', async () => {
		// claude-sonnet-5 thinks adaptively by default — the text is NOT
		// guaranteed to be content[0]. This was a real bug caught in review.
		const engine = createClaudeEngine(
			fakeClient([{ type: 'thinking' }, textBlock('{"ok": true, "urdu": "زندگی"}')]),
		);
		expect(await engine.convert('zindagi')).toEqual({ ok: true, urdu: 'زندگی' });
	});

	it('maps a not_roman_urdu reply through', async () => {
		const engine = createClaudeEngine(fakeClient([textBlock('{"ok": false, "reason": "not_roman_urdu"}')]));
		expect(await engine.convert('asdfgh')).toEqual({ ok: false, reason: 'not_roman_urdu' });
	});

	it('returns engine_error on malformed JSON', async () => {
		const engine = createClaudeEngine(fakeClient([textBlock('Sure! Here is the conversion:')]));
		expect(await engine.convert('kya haal hai')).toEqual({ ok: false, reason: 'engine_error' });
	});

	it('returns engine_error when there is no text block at all', async () => {
		const engine = createClaudeEngine(fakeClient([{ type: 'thinking' }]));
		expect(await engine.convert('kya haal hai')).toEqual({ ok: false, reason: 'engine_error' });
	});

	it('returns engine_error when the API throws', async () => {
		const engine = createClaudeEngine(fakeClient(new Error('529 overloaded')));
		expect(await engine.convert('kya haal hai')).toEqual({ ok: false, reason: 'engine_error' });
	});
});
