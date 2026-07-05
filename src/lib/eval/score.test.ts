// Tests for the benchmark scoring functions. The kitten/sitting case is the
// classic textbook edit-distance example (3 edits: k→s, e→i, +g).
import { describe, it, expect } from 'vitest';
import { editDistance, characterErrorRate, wordAccuracy } from './score';

describe('editDistance', () => {
	it('is 0 for identical sequences', () => {
		expect(editDistance([...'کیا'], [...'کیا'])).toBe(0);
	});
	it('counts substitutions, insertions, deletions', () => {
		expect(editDistance([...'kitten'], [...'sitting'])).toBe(3);
	});
	it('handles empty sequences', () => {
		expect(editDistance([], [...'abc'])).toBe(3);
	});
});

describe('characterErrorRate', () => {
	it('is 0 for a perfect conversion', () => {
		expect(characterErrorRate('کیا حال ہے', 'کیا حال ہے')).toBe(0);
	});
	it('is 1 when reference is empty but hypothesis is not', () => {
		expect(characterErrorRate('', 'x')).toBe(1);
	});
	it('scales by reference length', () => {
		expect(characterErrorRate('abcd', 'abce')).toBeCloseTo(0.25);
	});
});

describe('wordAccuracy', () => {
	it('is 1 for identical sentences', () => {
		expect(wordAccuracy('کیا حال ہے', 'کیا حال ہے')).toBe(1);
	});
	it('drops proportionally for one wrong word of three', () => {
		expect(wordAccuracy('کیا حال ہے', 'کیا حال تھا')).toBeCloseTo(2 / 3);
	});
	it('never goes below 0', () => {
		expect(wordAccuracy('ہے', 'یہ بالکل مختلف لمبا جملہ ہے')).toBe(0);
	});
	it('ignores extra whitespace between words', () => {
		expect(wordAccuracy('کیا حال ہے', 'کیا  حال   ہے')).toBe(1);
	});
});
