// Card themes: each pairs a background with text colors tuned to it.
// One source of truth — the studio, previews, and exports all read this list.
//
// `background` is CSS (any valid `background` shorthand). The artwork is
// AI-painted once at build time (nano-banana-pro / z-image via Higgsfield),
// hand-curated, and shipped as static JPEGs in /static/art — no runtime image
// generation. Each value ends in a solid color: that's the fallback the
// browser paints instantly while the JPEG streams in, so the card never
// flashes white.
export type CardTheme = {
	id: string;
	label: string;
	background: string; // any valid CSS background value
	textColor: string;
	shadowColor: string; // text-shadow for painted-letter depth
	// Busy backgrounds get a painted text panel (cartouche) — exactly how real
	// trucks put poetry on top of chamak patti tape-work.
	panel?: { background: string; border: string };
	// 'plate' renders the text as a hand-painted truck number plate — bolts,
	// authority bands and all — instead of free-floating on the background.
	variant?: 'plate';
};

// One source of truth for the id → artwork mapping: the filename is derived
// from the theme id, so renaming one without the other can't silently ship a
// flat card. The trailing color is the instant-paint fallback while the JPEG
// streams in.
const art = (id: string, fallback: string) =>
	`url('/art/theme-${id}.jpg') center / cover no-repeat ${fallback}`;

export const CARD_THEMES: CardTheme[] = [
	{
		id: 'plate',
		label: 'Number Plate · نمبر پلیٹ',
		// AI-painted truck tailgate: enamel plank bands with rivets and phool
		// patti motifs — the plate component bolts on top of it.
		background: art('plate', '#003c6b'),
		textColor: '#14100c',
		shadowColor: '#14100c00',
		variant: 'plate',
	},
	{
		id: 'raat',
		label: 'Raat · رات',
		// night drive: AI-painted midnight panel — crescent moon and stars in
		// the border, amber truck lights along the bottom, calm dark center
		background: art('raat', '#0a0e24'),
		textColor: '#ffd100',
		shadowColor: '#000000',
	},
	{
		id: 'gulab',
		label: 'Gulab · گلاب',
		// AI-painted rose garland border on deep red lacquer, magenta bloom
		background: art('gulab', '#a3001f'),
		textColor: '#fff8ea',
		shadowColor: '#4a000d',
	},
	{
		id: 'morr',
		label: 'Morr · مور',
		// AI-painted twin peacocks pressed against the edges, marigold border,
		// wide calm emerald center for the text
		background: art('morr', '#00663f'),
		textColor: '#fff8ea',
		shadowColor: '#00281c',
	},
	{
		id: 'chamak',
		label: 'Chamak · چمک',
		// AI-painted Karachi tape-work: diagonal stripes + starburst medallions
		background: art('chamak', '#e4002b'),
		textColor: '#14100c',
		shadowColor: '#fff8ea00', // no shadow — the panel does the separating
		panel: { background: '#fff8ea', border: '#14100c' },
	},
];
