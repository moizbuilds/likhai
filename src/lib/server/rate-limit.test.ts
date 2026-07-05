// Tests for the per-IP rate limiter. Time is injected (the `now` param)
// so tests never sleep — they just claim "it is now t+60001ms".
import { describe, it, expect } from 'vitest';
import { checkRateLimit } from './rate-limit';

describe('checkRateLimit', () => {
	it('allows 10 requests then blocks the 11th within a minute', () => {
		const ip = 'test-ip-1';
		for (let i = 0; i < 10; i++) expect(checkRateLimit(ip, 1000 + i)).toBe(true);
		expect(checkRateLimit(ip, 1011)).toBe(false);
	});

	it('frees the window after 60s', () => {
		const ip = 'test-ip-2';
		for (let i = 0; i < 10; i++) checkRateLimit(ip, 1000 + i);
		expect(checkRateLimit(ip, 1000 + 60_001)).toBe(true);
	});

	it('tracks IPs independently', () => {
		for (let i = 0; i < 10; i++) checkRateLimit('ip-a', 1000 + i);
		expect(checkRateLimit('ip-b', 1010)).toBe(true);
	});
});
