// One-shot schema setup for the corpus database. Run with: npm run migrate
// Works against remote Turso (TURSO_DATABASE_URL + TURSO_AUTH_TOKEN in .env)
// or a local file database (TURSO_DATABASE_URL=file:local.db).
import 'dotenv/config';
import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL;
if (!url) throw new Error('Set TURSO_DATABASE_URL in .env (file:local.db works for dev)');
if (!url.startsWith('file:') && !process.env.TURSO_AUTH_TOKEN) {
	throw new Error('Remote Turso needs TURSO_AUTH_TOKEN in .env');
}

const db = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
await db.execute(`
	CREATE TABLE IF NOT EXISTS corpus_pairs (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		roman_text TEXT NOT NULL,
		urdu_text TEXT NOT NULL,
		engine TEXT NOT NULL,
		created_at TEXT NOT NULL DEFAULT (datetime('now'))
	)
`);
console.log('corpus_pairs ready on', url.startsWith('file:') ? 'local file db' : 'Turso');
