export const SITE = {
	name: "Luka Adzic",
	url: "https://lukaadzic.dev",
	title: "Luka Adzic's Portfolio",
	description:
		"Here's some stuff I've built, things I've worked on, and where to find me online.",
	keywords: [
		"Luka Adzic",
		"Luka Adzic Portfolio",
		"Luka Adzic Investment banking",
		"Luka Adzic Quant Trading",
		"Luka Adzic Projects",
		"Luka Adzic Startup",
		"Startup founder Luka Adzic",
		"Portfolio",
		"Programmer Luka Adzic",
		"Software Engineer Luka Adzic",
		"University of Pennsylvania Luka Adzic",
		"Luka Adzic GitHub",
		"Luka Adzic Twitter",
		"Luka Adzic Instagram",
		"Luka Adzic Facebook",
		"Luka Adzic Wharton",
		"Luka Adzic LinkedIn",
		"Personal Website",
		"Contact Luka Adzic",
	],
	email: "lukaadz@wharton.upenn.edu",
	tagline: "SWE @ C4R · Student @ Wharton · Philadelphia",
	work: "SWE @ Community for Rigor · AI research @ Wharton",
	school: "The Wharton School, UPenn",
	location: "Philadelphia, PA",
	roots: "Croatia 🇭🇷",
	focus: "finance · markets · code",
	// Matches `new Date(2005, 11, 7)` from the LiveAge calculation in app/page.tsx.
	// `month` is 0-indexed (JS Date constructor convention), so 11 = December.
	birthDate: {
		year: 2005,
		month: 11,
		day: 7,
	},
	githubUsername: "lukaadzic",
	resumePath: "/ADZIC_LUKA_RESUME.pdf",
	workLinks: {
		c4r: "https://www.c4r.io/",
		wharton: "https://www.wharton.upenn.edu/",
	},
} as const;

export type Site = typeof SITE;

/** One segment of a copy string that's rendered with some words linked out —
 * `href` marks the segments that become `ExternalLink`s, plain segments
 * render as text. `tagline` and `work` above stay plain strings for
 * text-only contexts (SEO block, `whoami`'s fallback); these part lists are
 * the single source for the linked renders in `welcome-output.tsx` and
 * `about-output.tsx`, so the org names never get hardcoded twice. */
export type CopyPart = { text: string; href?: string };

/** Renders as `SITE.tagline` — used by the pinned `welcome` greeting. */
export const TAGLINE_PARTS: readonly CopyPart[] = [
	{ text: "SWE @ " },
	{ text: "C4R", href: SITE.workLinks.c4r },
	{ text: " · Student @ " },
	{ text: "Wharton", href: SITE.workLinks.wharton },
	{ text: " · Philadelphia" },
];

/** Renders as `SITE.work` — used by the `about` card's `work` row. */
export const WORK_PARTS: readonly CopyPart[] = [
	{ text: "SWE @ " },
	{ text: "Community for Rigor", href: SITE.workLinks.c4r },
	{ text: " · AI research @ " },
	{ text: "Wharton", href: SITE.workLinks.wharton },
];
