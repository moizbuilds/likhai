// The real engine: prompt-engineered Claude call that transliterates AND
// normalizes grammar/spelling. The prompt is the product here — this is the
// FDE craft the benchmark measures.
import Anthropic from '@anthropic-ai/sdk';
import type { ConversionEngine, ConversionResult } from './types';

export const SYSTEM_PROMPT = `You convert Roman Urdu (Urdu typed in Latin letters) into correct Urdu script.

Rules:
- Reply with strict JSON only, no prose: {"ok": true, "urdu": "..."} or {"ok": false, "reason": "not_roman_urdu"}.
- Transliterate into Urdu script and fix spelling/grammar so it reads as natural written Urdu.
- Roman Urdu spelling is chaotic: "nahi", "nhi", "nai" are all نہیں. Resolve by context and meaning.
- Code-switched English words Urdu speakers use ("meeting", "office") become their standard Urdu transliteration (میٹنگ، آفس).
- Preserve meaning and tone exactly. Never add, remove, or translate content.
- If the input is not Roman Urdu (gibberish, pure English prose, another language), return {"ok": false, "reason": "not_roman_urdu"}.`;

// Typed request params so a typo like `max_token` fails to compile instead of
// becoming a runtime 400 swallowed by the catch below.
type CreateParams = {
	model: string;
	max_tokens: number;
	system: string;
	messages: Array<{ role: 'user'; content: string }>;
};

// The minimal slice of the Anthropic SDK the engine actually uses. Tests
// implement this with a fake; production passes the real SDK client.
// CONCEPT: dependency injection — the engine receives its API client instead
// of creating one, so tests hand it a fake and never touch the network.
export type MessagesClient = {
	messages: {
		create(params: CreateParams): Promise<{ content: Array<{ type: string; text?: string }> }>;
	};
};

export function createClaudeEngine(client: MessagesClient): ConversionEngine {
	return {
		name: 'claude',
		async convert(roman: string): Promise<ConversionResult> {
			try {
				const msg = await client.messages.create({
					model: 'claude-sonnet-5',
					// Generous cap: on claude-sonnet-5 this budget also covers the
					// model's (adaptive) thinking tokens, not just the JSON reply.
					max_tokens: 2000,
					system: SYSTEM_PROMPT,
					messages: [{ role: 'user', content: roman }],
				});
				// The reply can contain a thinking block before the text block —
				// find the text, never assume it's first.
				const block = msg.content.find((b) => b.type === 'text');
				if (!block?.text) return { ok: false, reason: 'engine_error' };
				// Models sometimes wrap JSON in a ```json fence despite "strict
				// JSON only" — take everything between the outermost braces.
				const start = block.text.indexOf('{');
				const end = block.text.lastIndexOf('}');
				if (start === -1 || end <= start) return { ok: false, reason: 'engine_error' };
				const parsed = JSON.parse(block.text.slice(start, end + 1));
				if (parsed.ok === true && typeof parsed.urdu === 'string') return { ok: true, urdu: parsed.urdu };
				if (parsed.ok === false && parsed.reason === 'not_roman_urdu') return { ok: false, reason: 'not_roman_urdu' };
				return { ok: false, reason: 'engine_error' };
			} catch (err) {
				// One honest answer to the caller, full detail to the server log —
				// the operator can tell a bad key (401) from an outage (529).
				console.error('[likhai] claude engine error:', err);
				return { ok: false, reason: 'engine_error' };
			}
		},
	};
}

// Production wiring: real SDK client from an API key (the key comes from the
// server route's env — this function never runs in the browser). Tight bounds:
// a 500-char conversion has no business running 10 minutes or retrying twice.
export function claudeEngineFromKey(apiKey: string): ConversionEngine {
	return createClaudeEngine(
		new Anthropic({ apiKey, timeout: 15_000, maxRetries: 1 }) as unknown as MessagesClient,
	);
}
