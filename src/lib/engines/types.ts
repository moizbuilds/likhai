// The contract every conversion engine signs. The app, the API route, and
// the eval harness all talk to THIS, never to a specific engine.
// CONCEPT: strategy pattern — swappable implementations behind one interface;
// the naive alternative is if/else branches on engine name scattered everywhere.

// A closed list of engine names, so a typo like 'claud' fails to compile
// instead of silently producing an empty benchmark column.
export type EngineName = 'dictionary' | 'claude';

export type ConversionResult =
	| { ok: true; urdu: string }
	| { ok: false; reason: 'not_roman_urdu' | 'engine_error' };

export interface ConversionEngine {
	name: EngineName;
	convert(roman: string): Promise<ConversionResult>;
}

// The /api/convert wire contract: everything an engine can say, plus the two
// failures only the HTTP layer can produce. One source of truth — the server
// route and the UI both import this, so the reason strings can never drift.
export type ApiConvertResponse =
	| ConversionResult
	| { ok: false; reason: 'rate_limited' | 'invalid_input' };
