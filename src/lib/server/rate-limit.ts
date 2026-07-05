// Per-IP sliding-window rate limit for endpoints that spend money.
// In-memory: state is per server instance, which caps burst abuse without
// needing a database. The naive alternative (no limit) means one bored
// script kiddie drains the API budget.
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;
const SWEEP_EVERY = 1000;
const hits = new Map<string, number[]>();
let callsSinceSweep = 0;

// Without this, one Map entry per distinct client IP lives forever — a slow
// scan from rotating IPs becomes an attacker-controlled memory leak.
function sweepExpired(now: number): void {
	for (const [ip, stamps] of hits) {
		if (now - stamps[stamps.length - 1] >= WINDOW_MS) hits.delete(ip);
	}
}

export function checkRateLimit(ip: string, now: number = Date.now()): boolean {
	if (++callsSinceSweep >= SWEEP_EVERY) {
		callsSinceSweep = 0;
		sweepExpired(now);
	}
	const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
	const allowed = recent.length < MAX_REQUESTS;
	if (allowed) recent.push(now);
	hits.set(ip, recent);
	return allowed;
}
