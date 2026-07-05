// Stores one consented Roman↔Urdu pair. No user data, no IP stored —
// the rate limiter sees the IP transiently but never writes it.
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { checkRateLimit } from '$lib/server/rate-limit';

const MAX_CHARS = 500;

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	if (!checkRateLimit(getClientAddress())) {
		return json({ ok: false }, { status: 429 });
	}
	const db = getDb();
	if (!db) return json({ ok: false }, { status: 503 });

	const body = await request.json().catch(() => null);
	const roman = typeof body?.roman === 'string' ? body.roman.trim() : '';
	const urdu = typeof body?.urdu === 'string' ? body.urdu.trim() : '';
	const engine = typeof body?.engine === 'string' ? body.engine : '';
	// Server-side validation — the client is a suggestion, not a guarantee.
	if (!roman || !urdu || roman.length > MAX_CHARS || urdu.length > MAX_CHARS || !['claude', 'dictionary'].includes(engine)) {
		return json({ ok: false }, { status: 400 });
	}

	await db.execute({
		// CONCEPT: parameterized query — values go in as data (?), never pasted
		// into the SQL string, which is what blocks SQL injection.
		sql: 'INSERT INTO corpus_pairs (roman_text, urdu_text, engine) VALUES (?, ?, ?)',
		args: [roman, urdu, engine],
	});
	return json({ ok: true }, { status: 201 });
};
