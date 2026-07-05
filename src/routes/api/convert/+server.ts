// Server-only conversion endpoint. The Anthropic key lives here and NEVER
// reaches the browser. CONCEPT: API route — code that runs on the server;
// the browser can call it but can't read its source or its secrets.
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import { claudeEngineFromKey } from '$lib/engines/claude';
import type { ApiConvertResponse, ConversionEngine } from '$lib/engines/types';
import { checkRateLimit } from '$lib/server/rate-limit';

const MAX_INPUT_CHARS = 500;

// Which HTTP status each failure maps to. engine_error is a 502 (upstream
// fault, retryable) — NOT a 4xx, or monitoring would show "healthy" during
// an Anthropic outage while every user request fails.
const FAIL_STATUS: Record<string, number> = {
	not_roman_urdu: 422,
	engine_error: 502,
	rate_limited: 429,
	invalid_input: 400,
};

// One SDK client per server instance, not per request — created lazily so the
// fail-closed key check below still runs first.
let engine: ConversionEngine | null = null;

function reply(body: ApiConvertResponse) {
	return json(body, { status: body.ok ? 200 : FAIL_STATUS[body.reason] });
}

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	// Fail closed: no key means no service — never a degraded fake answer.
	if (!env.ANTHROPIC_API_KEY) {
		return reply({ ok: false, reason: 'engine_error' });
	}
	if (!checkRateLimit(getClientAddress())) {
		return reply({ ok: false, reason: 'rate_limited' });
	}

	const body = await request.json().catch(() => null);
	const text = typeof body?.text === 'string' ? body.text.trim() : '';
	if (!text || text.length > MAX_INPUT_CHARS) {
		return reply({ ok: false, reason: 'invalid_input' });
	}

	engine ??= claudeEngineFromKey(env.ANTHROPIC_API_KEY);
	return reply(await engine.convert(text));
};
