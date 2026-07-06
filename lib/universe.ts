/**
 * Content for the "expanding universe" easter egg — the home page's green
 * traffic light now zooms all the way out into a dark cosmos of goal-stars
 * instead of toggling floating/fullscreen (`universe-overlay.tsx` renders
 * it, `terminal-window.tsx` opens it). Same rule as every other file in
 * `lib/`: single source of truth, only verified facts — ambitions are
 * phrased as trajectory, never invented achievements.
 *
 * luka: these are seed placeholders grounded in your real trajectory —
 * rewrite the labels/blurbs in your own words.
 */

export type Star = {
	id: string;
	/** Lowercase label rendered next to the star. */
	label: string;
	/** Position as a percentage of the sky, 0-100. Kept within safe bounds
	 * (roughly 8-92 on x, 10-85 on y) so labels never clip at 390px. */
	x: number;
	y: number;
	/** Core dot diameter in px. Defaults applied by `universe-overlay.tsx`
	 * when omitted. */
	size?: number;
	/** Glow/core color. Defaults to a muted white when omitted — only
	 * `destiny` and `hrvatska` get a named-color exception below. */
	accent?: string;
	/** 1-2 sentences, lowercase, shown in the star's card on click. */
	blurb: string;
};

/** A faint line drawn between two star ids — the constellation is roughly
 * chronological: roots, first thing built from zero, current work, the
 * ambition it's pointed at, and where that's headed. `destiny` is
 * deliberately unlinked — the fixed star everything else orbits, not a
 * waypoint on the trajectory. */
export const LINKS: readonly (readonly [string, string])[] = [
	["hrvatska", "maritime"],
	["maritime", "c4r"],
	["c4r", "agentic-ai"],
	["agentic-ai", "the-fund"],
];

export const STARS: readonly Star[] = [
	{
		id: "hrvatska",
		label: "hrvatska",
		x: 12,
		y: 72,
		accent: "#e0645a",
		blurb: "the roots. everything traces back here.",
	},
	{
		id: "maritime",
		label: "maritime@penn",
		x: 27,
		y: 44,
		blurb:
			"founded penn's first maritime club at 19. 100+ members. first of many things built from zero.",
	},
	{
		id: "c4r",
		label: "c4r",
		x: 47,
		y: 26,
		blurb:
			"teaching scientific rigor at scale, shipping the platform that does it.",
	},
	{
		id: "agentic-ai",
		label: "agentic ai",
		x: 66,
		y: 18,
		blurb:
			"already building it at wharton: agents that generate hypotheses and run analyses in statistical genetics.",
	},
	{
		id: "the-fund",
		label: "the fund",
		x: 85,
		y: 32,
		blurb:
			"markets since day one: a live trading system with real capital at 20. the ambition is obvious.",
	},
	{
		id: "destiny",
		label: "destiny",
		x: 50,
		y: 80,
		size: 4,
		accent: "#f0a6ca",
		blurb: "the fixed star. everything else orbits.",
	},
] as const;

export const UNIVERSE_HEADER = "luka@universe — the whole picture";
export const UNIVERSE_HINT = "esc to return to earth";
