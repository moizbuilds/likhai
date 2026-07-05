// Card themes: each pairs a background with text colors tuned to it.
// One source of truth — the studio, previews, and exports all read this list.
//
// The artwork is AI-painted once at build time (nano-banana-pro / z-image via
// Higgsfield), hand-curated, and shipped as static JPEGs in /static/art — no
// runtime image generation. `artUrl` is the single source of truth for the
// painting; `background` is derived from it so the card, the preview, and the
// PNG export can never disagree about which file to load.
export type CardTheme = {
	id: string;
	label: string;
	artUrl: string; // the painting; every consumer reads THIS, never a parsed string
	background: string; // derived CSS: the painting over an instant-paint fallback color
	// textColor/shadowColor drive the free-floating text. The 'plate' variant
	// paints its own colors, so they're optional and it omits them.
	textColor?: string;
	shadowColor?: string;
	// Busy backgrounds get a soft dark scrim behind the text so cream letters
	// stay legible over bright painted areas (e.g. gulab's magenta bloom).
	scrim?: boolean;
	// Busy backgrounds can instead get a hard painted panel (cartouche) — how
	// real trucks put poetry on top of chamak patti tape-work.
	panel?: { background: string; border: string };
	// 'plate' renders the text as a hand-painted truck number plate — bolts,
	// authority bands and all — instead of free-floating on the background.
	variant?: 'plate';
};

// Build a theme from its id so the JPEG path is written exactly ONCE. The
// trailing color is the instant-paint fallback the browser shows while the
// JPEG streams in, so the card never flashes white.
function theme(
	id: string,
	label: string,
	fallback: string,
	rest: Omit<CardTheme, 'id' | 'label' | 'artUrl' | 'background'>,
): CardTheme {
	const artUrl = `/art/theme-${id}.jpg`;
	return { id, label, artUrl, background: `url('${artUrl}') center / cover no-repeat ${fallback}`, ...rest };
}

export const CARD_THEMES: CardTheme[] = [
	// AI-painted truck tailgate: enamel plank bands with rivets — the plate
	// component bolts on top of it and paints its own text colors.
	theme('plate', 'Number Plate · نمبر پلیٹ', '#003c6b', { variant: 'plate' }),

	// night drive: AI-painted midnight panel, calm dark center for the text
	theme('raat', 'Raat · رات', '#0a0e24', { textColor: '#ffd100', shadowColor: '#000000' }),

	// AI-painted rose garland on deep red lacquer. The painting has a bright
	// magenta bloom in the upper-center, so cream text rides on a scrim.
	theme('gulab', 'Gulab · گلاب', '#a3001f', { textColor: '#fff8ea', shadowColor: '#4a000d', scrim: true }),

	// AI-painted twin peacocks pinned to the edges, wide calm emerald center
	theme('morr', 'Morr · مور', '#00663f', { textColor: '#fff8ea', shadowColor: '#00281c' }),

	// AI-painted Karachi tape-work: too busy for floating text, so it gets a
	// solid cream cartouche (no shadow needed — the panel does the separating).
	theme('chamak', 'Chamak · چمک', '#e4002b', {
		textColor: '#14100c',
		panel: { background: '#fff8ea', border: '#14100c' },
	}),
];
