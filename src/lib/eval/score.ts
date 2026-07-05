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

// [...str] splits into real characters (code points), not UTF-16 halves —
// it matters for Urdu, where naive .split('') can shear characters apart.
export function characterErrorRate(reference: string, hypothesis: string): number {
	if (reference.length === 0) return hypothesis.length === 0 ? 0 : 1;
	return editDistance([...reference], [...hypothesis]) / [...reference].length;
}

export function wordAccuracy(reference: string, hypothesis: string): number {
	const ref = reference.split(/\s+/).filter(Boolean);
	const hyp = hypothesis.split(/\s+/).filter(Boolean);
	if (ref.length === 0) return hyp.length === 0 ? 1 : 0;
	return Math.max(0, 1 - editDistance(ref, hyp) / ref.length);
}
