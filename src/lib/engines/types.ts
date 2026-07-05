// The contract every conversion engine signs. The app, the API route, and
// the eval harness all talk to THIS, never to a specific engine.
// CONCEPT: strategy pattern — swappable implementations behind one interface;
// the naive alternative is if/else branches on engine name scattered everywhere.
export type ConversionResult =
	| { ok: true; urdu: string }
	| { ok: false; reason: 'not_roman_urdu' | 'engine_error' };

export interface ConversionEngine {
	name: string;
	convert(roman: string): Promise<ConversionResult>;
}
