// Scoring for the benchmark. Two views of "how wrong":
// CER (character error rate) is forgiving of small slips; word accuracy is
// the blunt "how many words came out right".
// CONCEPT: edit distance (Levenshtein) — the minimum number of single-item
// insertions/deletions/substitutions to turn one sequence into another,
// computed with dynamic programming (a table of best-so-far subproblem answers).
export function editDistance<T>(a: readonly T[], b: readonly T[]): number {
	const rows = a.length + 1;
	const cols = b.length + 1;
	const d: number[][] = Array.from({ length: rows }, (_, i) =>
		Array.from({ length: cols }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
	);
	for (let i = 1; i < rows; i++) {
		for (let j = 1; j < cols; j++) {
			const cost = a[i - 1] === b[j - 1] ? 0 : 1;
			d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
		}
	}
	return d[rows - 1][cols - 1];
}

// Orthographic normalization before scoring — standard transliteration-eval
// practice: strip what native writers treat as optional garnish (punctuation,
// diacritics), collapse whitespace, and apply accepted spelling equivalences,
// so the numbers measure the words rather than styling choices.
const ARABIC_DIACRITICS = /[ً-ٰٟ]/g;
const PUNCTUATION = /[۔؟،٬!?.,;:'"“”‘’…()[\]{}«»\-—]/g;

export function normalizeForScoring(s: string): string {
	return s
		.replace(ARABIC_DIACRITICS, '')
		.replace(PUNCTUATION, ' ')
		.replace(/پتہ/g, 'پتا') // both spellings of "pata" are correct (Moiz's ruling)
		.replace(/\s+/g, ' ')
		.trim();
}

// [...str] splits into real characters (code points), not UTF-16 halves —
// it matters for Urdu, where naive .split('') can shear characters apart.
export function characterErrorRate(reference: string, hypothesis: string): number {
	const ref = normalizeForScoring(reference);
	const hyp = normalizeForScoring(hypothesis);
	if (ref.length === 0) return hyp.length === 0 ? 0 : 1;
	return editDistance([...ref], [...hyp]) / [...ref].length;
}

export function wordAccuracy(reference: string, hypothesis: string): number {
	const ref = normalizeForScoring(reference).split(' ').filter(Boolean);
	const hyp = normalizeForScoring(hypothesis).split(' ').filter(Boolean);
	if (ref.length === 0) return hyp.length === 0 ? 1 : 0;
	return Math.max(0, 1 - editDistance(ref, hyp) / ref.length);
}
