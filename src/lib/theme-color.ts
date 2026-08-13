const HEX_RE = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/;

export function normalizeHex(value?: string | null): string | null {
	if (!value) return null;
	const trimmed = value.trim();
	if (!HEX_RE.test(trimmed)) return null;
	if (trimmed.length === 4) {
		const [, r, g, b] = trimmed;
		return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
	}
	return trimmed.toLowerCase();
}

function hexToRgb(hex: string): [number, number, number] {
	const n = parseInt(hex.slice(1), 16);
	return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
	const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
	return `#${[r, g, b].map((c) => clamp(c).toString(16).padStart(2, '0')).join('')}`;
}

const WHITE: [number, number, number] = [255, 255, 255];
const BLACK: [number, number, number] = [0, 0, 0];

function mix(hex: string, target: [number, number, number], amount: number): string {
	const [r, g, b] = hexToRgb(hex);
	const [tr, tg, tb] = target;
	return rgbToHex(r + (tr - r) * amount, g + (tg - g) * amount, b + (tb - b) * amount);
}

const lighten = (hex: string, amount: number) => mix(hex, WHITE, amount);
const darken = (hex: string, amount: number) => mix(hex, BLACK, amount);

function relativeLuminance(hex: string): number {
	const channels = hexToRgb(hex).map((c) => {
		const s = c / 255;
		return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
	});
	return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastForeground(hex: string): string {
	return relativeLuminance(hex) > 0.5 ? '#0f172a' : '#ffffff';
}

function rgbTriplet(hex: string): string {
	const [r, g, b] = hexToRgb(hex);
	return `${r}, ${g}, ${b}`;
}

const DEFAULT_PRIMARY = '#ff5a36';

interface PrimaryVars {
	primary: string;
	hover: string;
	light: string;
	dark?: string;
	foreground: string;
	shadow: string;
	glow: string;
}

function buildPrimaryPalette(primaryHex?: string | null): { light: Required<PrimaryVars>; dark: PrimaryVars } {
	const base = normalizeHex(primaryHex) ?? DEFAULT_PRIMARY;
	const foreground = contrastForeground(base);

	const light: Required<PrimaryVars> = {
		primary: base,
		hover: darken(base, 0.12),
		light: lighten(base, 0.9),
		dark: darken(base, 0.28),
		foreground,
		shadow: `rgba(${rgbTriplet(base)}, 0.25)`,
		glow: `rgba(${rgbTriplet(base)}, 0.55)`,
	};

	const darkPrimary = lighten(base, 0.15);
	const dark: PrimaryVars = {
		primary: darkPrimary,
		hover: base,
		light: darken(base, 0.82),
		foreground,
		shadow: `rgba(${rgbTriplet(darkPrimary)}, 0.3)`,
		glow: `rgba(${rgbTriplet(darkPrimary)}, 0.55)`,
	};

	return { light, dark };
}

/**
 * Builds a CSS string (for injection into a <style> tag in the document <head>)
 * that overrides the primary/brand-secondary custom properties with values derived
 * from the whitelabel site settings API. Declarations use !important so they win
 * regardless of where Next.js places the compiled globals.css <link> in <head> —
 * this is what lets the color render correctly on the very first paint (no flicker),
 * since it's baked into the server-rendered HTML rather than applied after a client fetch.
 */
export function buildThemeStyleTag(primaryHex?: string | null, secondaryHex?: string | null): string {
	const { light, dark } = buildPrimaryPalette(primaryHex);
	const secondary = normalizeHex(secondaryHex);
	const secondaryVar = secondary ? `--brand-secondary:${secondary} !important;` : '';

	const rootVars = `--primary:${light.primary} !important;--primary-hover:${light.hover} !important;--primary-light:${light.light} !important;--primary-dark:${light.dark} !important;--primary-foreground:${light.foreground} !important;--shadow-primary:${light.shadow} !important;--shadow-primary-glow:${light.glow} !important;${secondaryVar}`;
	const darkVars = `--primary:${dark.primary} !important;--primary-hover:${dark.hover} !important;--primary-light:${dark.light} !important;--primary-foreground:${dark.foreground} !important;--shadow-primary:${dark.shadow} !important;--shadow-primary-glow:${dark.glow} !important;${secondaryVar}`;

	return `:root{${rootVars}}.dark{${darkVars}}`;
}
