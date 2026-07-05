// Server-only database client for the corpus.
// CONCEPT: Turso — SQLite (the single-file database that runs the world's
// phones) hosted at the edge; @libsql/client speaks to it over HTTP. The same
// client also opens plain local files (file:local.db), which is how we
// develop without touching production.
import { createClient, type Client } from '@libsql/client';
import { env } from '$env/dynamic/private';

export function getDb(): Client | null {
	const url = env.TURSO_DATABASE_URL;
	if (!url) return null; // fail closed — the route answers 503, never fakes a save
	// Local file databases need no auth token; remote Turso does.
	if (!url.startsWith('file:') && !env.TURSO_AUTH_TOKEN) return null;
	return createClient({ url, authToken: env.TURSO_AUTH_TOKEN });
}
