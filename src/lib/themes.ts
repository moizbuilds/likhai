// Card themes: each pairs a background with text colors tuned to it.
// One source of truth — the studio, previews, and exports all read this list.
//
// `background` is CSS (a gradient recipe or an image url). The current values
// are hand-built "chamak patti" CSS patterns; when the AI-painted artwork is
// generated and curated, each becomes url('/art/theme-<id>.png') — nothing
// else in the app changes. That's the point of keeping themes in one file.
export type CardTheme = {
	id: string;
	label: string;
	background: string; // any valid CSS background value
	textColor: string;
	shadowColor: string; // text-shadow for painted-letter depth
	// Busy backgrounds get a painted text panel (cartouche) — exactly how real
	// trucks put poetry on top of chamak patti tape-work.
	panel?: { background: string; border: string };
};

export const CARD_THEMES: CardTheme[] = [
	{
		id: 'raat',
		label: 'Raat · رات',
		// night drive: canary pinstripes over midnight ground (first layer
		// paints on top, so the semi-transparent stripes come first)
		background:
			'repeating-linear-gradient(90deg, transparent 0 38px, rgba(255, 209, 0, 0.1) 38px 42px), radial-gradient(90% 60% at 50% 0%, #1d2a66 0%, #101636 60%, #0a0e24 100%)',
		textColor: '#ffd100',
		shadowColor: '#000000',
	},
	{
		id: 'gulab',
		label: 'Gulab · گلاب',
		// rose-red lacquer with magenta bloom
		background:
			'radial-gradient(70% 50% at 50% 15%, #e5007d33 0%, transparent 60%), radial-gradient(120% 100% at 50% 100%, #7a0016 0%, #a3001f 55%, #e4002b 100%)',
		textColor: '#fff8ea',
		shadowColor: '#4a000d',
	},
	{
		id: 'morr',
		label: 'Morr · مور',
		// peacock: emerald ground, electric-blue iridescence
		background:
			'radial-gradient(80% 55% at 50% 10%, #00a3e044 0%, transparent 55%), linear-gradient(180deg, #003c2a 0%, #00663f 55%, #00a651 130%)',
		textColor: '#fff8ea',
		shadowColor: '#00281c',
	},
	{
		id: 'chamak',
		label: 'Chamak · چمک',
		// Karachi tape-work: loud diagonal vinyl stripes
		background:
			'repeating-linear-gradient(45deg, #e4002b 0 26px, #ffd100 26px 52px, #00a651 52px 78px, #00a3e0 78px 104px)',
		textColor: '#14100c',
		shadowColor: '#fff8ea00', // no shadow — the panel does the separating
		panel: { background: '#fff8ea', border: '#14100c' },
	},
];
