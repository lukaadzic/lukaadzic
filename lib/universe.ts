/**
 * Content for the "expanding universe" easter egg — the home page's green
 * traffic light now zooms all the way out into a dark cosmos of stars
 * instead of toggling floating/fullscreen (`universe-overlay.tsx` renders
 * it, `terminal-window.tsx` opens it). Same rule as every other file in
 * `lib/`: single source of truth, only verified facts.
 *
 * This is Luka's real trajectory, chronological: roots, then the places he
 * grew up, then school, then what he's building now, ending on the
 * ambition it's all pointed at. `destiny` is the one deliberate exception —
 * not a waypoint, the fixed star everything else orbits.
 */

export type Star = {
	id: string;
	/** Lowercase label rendered next to the star. */
	label: string;
	/** Position as a percentage of the sky, 0-100. Kept within safe bounds
	 * (roughly 8-92 on x, 10-85 on y) so labels never clip at 390px. */
	x: number;
	y: number;
	/** Which side of the star the label sits on. Defaults to "right" in
	 * `universe-overlay.tsx` when omitted. Chosen per star (not derived from
	 * position) so the whole chain can be laid out without any label ever
	 * touching another label, a star, or a constellation line. */
	labelSide?: "left" | "right" | "top" | "bottom";
	/** Core dot diameter in px. Defaults applied by `universe-overlay.tsx`
	 * when omitted. `pennyone` is deliberately the largest — the endpoint of
	 * the chain. */
	size?: number;
	/** Glow/core color. Defaults to a muted white when omitted. `destiny`
	 * keeps the one reserved named-color exception (`#f0a6ca`); `roots` gets
	 * a subtle red tint for the homeland, `pennyone` a bright warm glow as
	 * the brightest star. */
	accent?: string;
	/** 1-2 sentences, lowercase, shown in the star's card on click. */
	blurb: string;
};

/** A faint line drawn between two star ids — the constellation is the real
 * chronological chain: roots, childhood abroad, school, current work, and
 * the ambition it's pointed at. `c4r` branches off `purm` instead of sitting
 * in-line — a real fork, not a straight line to Pennyone. `destiny` is
 * deliberately unlinked — the fixed star everything else orbits, not a
 * waypoint on the trajectory. */
export const LINKS: readonly (readonly [string, string])[] = [
	["roots", "china"],
	["china", "wharton"],
	["wharton", "sydney"],
	["sydney", "purm"],
	["purm", "pennyone"],
	["purm", "c4r"],
] as const;

export const STARS: readonly Star[] = [
	{
		id: "roots",
		label: "croatia · montenegro",
		x: 10,
		y: 82,
		labelSide: "right",
		accent: "#e0645a",
		blurb: "born to croatian x montenegrin parents. where everything starts.",
	},
	{
		id: "china",
		label: "china",
		x: 26,
		y: 68,
		labelSide: "right",
		blurb: "moved to china at 2. grew up between worlds.",
	},
	{
		id: "wharton",
		label: "wharton",
		x: 42,
		y: 54,
		labelSide: "right",
		blurb: "admitted early decision to wharton as an international student.",
	},
	{
		id: "sydney",
		label: "sydney",
		x: 58,
		y: 40,
		labelSide: "right",
		blurb:
			"penn grip, summer 2025 — quantitative research at the university of sydney.",
	},
	{
		id: "purm",
		label: "purm 2026",
		x: 74,
		y: 26,
		labelSide: "top",
		blurb: "purm research at wharton — agentic ai for statistical genetics.",
	},
	{
		id: "c4r",
		label: "c4r",
		x: 84,
		y: 44,
		labelSide: "bottom",
		blurb:
			"software engineer at community for rigor — teaching scientific rigor at scale.",
	},
	{
		id: "pennyone",
		label: "pennyone",
		x: 90,
		y: 12,
		labelSide: "left",
		size: 8,
		accent: "#ffe9b8",
		blurb: "building pennyone — the new generation of ai assistant.",
	},
	{
		id: "destiny",
		label: "destiny",
		x: 52,
		y: 78,
		labelSide: "right",
		size: 4,
		accent: "#f0a6ca",
		blurb: "the fixed star. everything else orbits.",
	},
] as const;

export const UNIVERSE_HEADER = "luka@universe — the whole picture";
/** The exit control's visible label (`universe-overlay.tsx` renders it as a
 * real tappable button, not passive text, since Esc doesn't exist on
 * phones) — desktop prefixes a faint "esc · " before it, kept inline in the
 * component since it's a keyboard affordance, not content. */
export const UNIVERSE_HINT = "return to earth";
