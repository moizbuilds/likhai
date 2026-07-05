// Server-only conversion endpoint. The Anthropic key lives here and NEVER
// reaches the browser. CONCEPT: API route — code that runs on the server;
// the browser can call it but can't read its source or its secrets.
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import { claudeEngineFromKey } from '$lib/engines/claude';
import { checkRateLimit } from '$lib/server/rate-limit';

const MAX_INPUT_CHARS = 500;

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	// Fail closed: no key means no service — never a degraded fake answer.
	if (!env.ANTHROPIC_API_KEY) {
		return json({ ok: false, reason: 'engine_error' }, { status: 500 });
	}
	if (!checkRateLimit(getClientAddress())) {
		return json({ ok: false, reason: 'rate_limited' }, { status: 429 });
	}

	const body = await request.json().catch(() => null);
	const text = typeof body?.text === 'string' ? body.text.trim() : '';
	if (!text || text.length > MAX_INPUT_CHARS) {
		return json({ ok: false, reason: 'invalid_input' }, { status: 400 });
	}

	const result = await claudeEngineFromKey(env.ANTHROPIC_API_KEY).convert(text);
	return json(result, { status: result.ok ? 200 : 422 });
};
