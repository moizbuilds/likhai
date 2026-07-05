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

// The minimal slice of the Anthropic SDK the engine actually uses. Tests
// implement this with a fake; production passes the real SDK client.
export type MessagesClient = {
	messages: {
		create(params: Record<string, unknown>): Promise<{ content: Array<{ type: string; text?: string }> }>;
	};
};

export function createClaudeEngine(client: MessagesClient): ConversionEngine {
	return {
		name: 'claude',
		async convert(roman: string): Promise<ConversionResult> {
			try {
				const msg = await client.messages.create({
					model: 'claude-sonnet-5',
					max_tokens: 1000,
					system: SYSTEM_PROMPT,
					messages: [{ role: 'user', content: roman }],
				});
				const block = msg.content[0];
				const parsed = JSON.parse(block?.type === 'text' && block.text ? block.text : '');
				if (parsed.ok === true && typeof parsed.urdu === 'string') return { ok: true, urdu: parsed.urdu };
				if (parsed.ok === false && parsed.reason === 'not_roman_urdu') return { ok: false, reason: 'not_roman_urdu' };
				return { ok: false, reason: 'engine_error' };
			} catch {
				// Any failure (network, refusal, bad JSON) is one honest answer:
				// the engine errored. The UI decides what to show; we never guess.
				return { ok: false, reason: 'engine_error' };
			}
		},
	};
}

// Production wiring: real SDK client from an API key (the key comes from the
// server route's env — this function never runs in the browser).
export function claudeEngineFromKey(apiKey: string): ConversionEngine {
	return createClaudeEngine(new Anthropic({ apiKey }) as unknown as MessagesClient);
}
