// Per-IP sliding-window rate limit for endpoints that spend money.
// In-memory: resets when the serverless instance recycles. That's acceptable —
// it caps burst abuse per instance without needing a database. The naive
// alternative (no limit) means one bored script kiddie drains the API budget.
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;
const hits = new Map<string, number[]>();

export function checkRateLimit(ip: string, now: number = Date.now()): boolean {
	const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
	if (recent.length >= MAX_REQUESTS) {
		hits.set(ip, recent);
		return false;
	}
	recent.push(now);
	hits.set(ip, recent);
	return true;
}
