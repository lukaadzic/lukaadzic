/**
 * Content for the hidden easter-egg terminal commands (`giveon`/`beloved`,
 * `vatreni`/`hrvatska`/`croatia`, `modric`) — discoverable via `ls -la`.
 * Single source of truth, same rule as everything else in `lib/`: only
 * verified facts, never invented lyrics, quotes, or stats.
 */

export const BELOVED = {
	title: "Beloved",
	artist: "GIVĒON",
	year: 2025,
	spotifyUrl: "https://open.spotify.com/album/7pcBXbl1g198PNAxt44bHQ",
	tracks: [
		"MUD",
		"RATHER BE",
		"TWENTIES",
		"STRANGERS",
		"NUMB",
		"I CAN TELL",
		"DIAMONDS FOR YOUR PAIN",
		"KEEPER",
		"SIX:THIRTY",
		"BACKUP PLAN",
		"BLEEDING",
		"DON'T LEAVE",
		"AVALANCHE",
		"GOOD BAD UGLY",
	],
} as const;

/**
 * The tracks the `giveon` command actually plays, via official Spotify
 * track embeds (30s preview for everyone; full track for logged-in
 * Spotify users). IDs verified against open.spotify.com/oembed.
 */
export const FEATURED_TRACKS = [
	{ title: "STRANGERS", spotifyTrackId: "7jF5V0KISfBLyVO5eF4D1w" },
	{
		title: "REPLICA (feat. Sasha Keable)",
		spotifyTrackId: "2OfBeaRCWOB7AHOsePBlsN",
	},
] as const;

export type FeaturedTrack = (typeof FEATURED_TRACKS)[number];

/**
 * Red traffic light — the home terminal answers with a macOS-style alert
 * instead of closing, and plays "DON'T LEAVE" (a real Beloved track; the
 * title IS the joke). ID verified via open.spotify.com/oembed. All alert
 * copy below is original — never verbatim Giveon lyrics.
 */
export const CLOSE_TRACK = {
	title: "DON'T LEAVE",
	spotifyTrackId: "5gXD4exv3XSwYh4BFQ0phf",
} as const;

/** Copy for the "don't leave." alert dialog. */
export const CLOSE_ALERT = {
	title: "don't leave.",
	body: [
		"this terminal doesn't do goodbyes.",
		"giveon wrote a whole song about this. it's playing now.",
	],
	bodyRepeat: "still here. still playing.",
	stay: "stay",
	/** The `leave anyway` button loses its nerve, one click at a time. */
	leaveLabels: ["leave anyway", "you sure?", "…really?"],
	dismissNote: "fine. the song stays.",
} as const;

export const VATRENI = {
	heading: "Vatreni 🔥 — Hrvatska",
	summary: "2018 World Cup finalists · 2022 bronze",
	closer: "idemo!",
} as const;

export const MODRIC = {
	headline: "Luka Modrić — #10",
	stats:
		"Ballon d'Or 2018 · 6× Champions League · Croatia's most-capped player",
	moment: "captained the 2018 World Cup final run",
	closer:
		"the other Luka. we share a first name and that's where the comparison ends (his favor).",
} as const;

/**
 * `penalty` / `shootout` / `./penalty.sh` — trivia rotated in one line at a
 * time after each round of the shootout minigame. Only verified World Cup
 * shootout facts, same rule as everything else here.
 */
export const SHOOTOUT_HISTORY = [
	"2018 R16 vs Denmark: won 3-2 on pens. Subašić saved three. You were saying?",
	"2018 QF vs Russia: won 4-3 on pens. Rakitić scored the winner — same as he did against Denmark.",
	"2022 R16 vs Japan: won 3-1 on pens. Livaković saved three.",
	"2022 QF vs Brazil: won 4-2 on pens. Livaković saved from Rodrygo, Marquinhos hit the post, and Modrić was among the scorers.",
	"four straight World Cup shootout wins across 2018 and 2022. Croatia has never lost one.",
] as const;

/** End-state copy for the `penalty` minigame. Keeper facts matter:
 * Subašić kept goal in the 2018 shootouts, Livaković in the 2022 ones. */
export const PENALTY_END_MESSAGES = {
	win: "you out-shot the shootout GOATs. screenshot this, nobody will believe you.",
	loss: "Livaković remains a wall. Subašić owned 2018, Livaković owned 2022 — you're in good company.",
} as const;

/**
 * `cat /etc/loved-ones`, `git log --oneline`, and the konami code — a
 * hidden easter egg for Destiny. Same rule as the rest of this file:
 * content lives here, single source of truth, never invented facts.
 * `#f0a6ca` (a soft pink) is Destiny's color across every reveal style in
 * `destiny-easter-egg.tsx` — the one deliberate named-color exception in
 * the app, same idea as the green prompt.
 */
export const DESTINY = {
	lovedOnes: {
		intro: "reading /etc/loved-ones...",
		lines: [
			{
				text: "❤  destiny       — my sweet angel girl. the one.",
				pink: true,
			},
			{ text: "🐶  baby          — best beagle alive", pink: false },
			{
				text: "🐱  modro + vida  — kittens (born apr 13, 2026)",
				pink: false,
			},
		],
		note: "// destiny entry is read-only. cannot be edited or deleted.",
	},
	gitLog: [
		{
			hash: "f3a9d1e",
			message: "fix: finally got my life together",
			pink: false,
		},
		{
			hash: "c7b2a04",
			message: "add: destiny ♡  (best commit, no regrets)",
			pink: true,
		},
		{ hash: "91e3f7c", message: "feat: adopt modro + vida", pink: false },
		{
			hash: "b04d22a",
			message: "init: wharton + c4r + purm2026",
			pink: false,
		},
		{
			hash: "a1b2c3d",
			message: "chore: got baby (the beagle, not an actual baby)",
			pink: false,
		},
	],
	terminal: {
		title: "classified — destiny.txt",
		rows: [
			{ key: "name", value: "destiny", tone: "pink" },
			{ key: "status", value: "my sweet angel girl ♡", tone: "green" },
			{ key: "clearance", value: "level ∞", tone: "amber" },
			{ key: "note", value: "best thing in /etc/loved-ones", tone: "faint" },
		],
		hint: "click anywhere to close",
	},
	classified: {
		header: "╔═ CLASSIFIED ═╗",
		caption: "destiny — my angel girl",
		footer: "// you weren't supposed to find this",
	},
	card: {
		name: "Destiny",
		caption: "my sweet angel girl. the best easter egg on this site.",
		badge: "❤ /etc/loved-ones",
	},
} as const;

export type DestinyRowTone = (typeof DESTINY.terminal.rows)[number]["tone"];
