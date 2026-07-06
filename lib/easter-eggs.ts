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

/**
 * `vatreni` / `hrvatska` / `croatia` — the section plays the anthem: "Moja
 * Domovina" by Hrvatski Band Aid, the 1991 charity single ("My Homeland").
 * ID verified via open.spotify.com/oembed.
 */
export const VATRENI_SONG = {
	title: "Moja Domovina",
	artist: "Hrvatski Band Aid",
	spotifyTrackId: "5lYhnRrhgSsFjnG1FEVXvs",
} as const;

export const MODRIC = {
	headline: "Luka Modrić — #10",
	stats:
		"Ballon d'Or 2018 · 6× Champions League · Croatia's most-capped player",
	moment: "captained the 2018 World Cup final run",
	closer:
		"the other Luka. we share a first name and that's where the comparison ends (his favor).",
	petNote: "also: my cat is named after him. try `pets`.",
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
/** Her photo, everywhere it appears — `destiny` output plus the "terminal"
 * and "card" reveal styles. The konami/"classified" reveal is the one
 * exception: it uses `DESTINY_CLASSIFIED_PHOTO` (her in the Croatia jersey,
 * making a heart) instead — a distinct photo for the deepest-hidden reveal. */
export const DESTINY_PHOTO = "/images/destiny.jpg";
export const DESTINY_CLASSIFIED_PHOTO = "/images/destiny-classified.jpg";

/**
 * `destiny` — her section plays our song: "EVERYTHING HALLELUJAH - Acoustic"
 * by Justin Bieber, from SWAG Live From Coachella (Weekend I). ID verified
 * via open.spotify.com/oembed.
 */
export const DESTINY_SONG = {
	title: "EVERYTHING HALLELUJAH - Acoustic",
	artist: "Justin Bieber",
	album: "SWAG Live From Coachella (Weekend I)",
	spotifyTrackId: "638TcmE5UMW9IhXGs1as4u",
} as const;

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

/**
 * `pets` — pixel-art portraits of the household. Same technique as the
 * `vatreni` šahovnica and the `welcome` glyph banner: each grid is an array
 * of equal-length strings, one character per cell, mapped through a small
 * per-pet palette (`.` is always transparent). Only verified facts from
 * Luka: Modro + Vida are domestic shorthair kittens born apr 13, 2026 —
 * Modro darker-coated with dark paws, Vida lighter-coated with white paws
 * (her signature); Baby is a tricolor beagle, "best beagle alive."
 */
export type Pet = {
	id: string;
	name: string;
	/** Accent color for the name line — Destiny-style named-color exception,
	 * scoped to this one command. */
	nameColor: string;
	/** What the pet is, in plain terms — a faint identifier line, distinct
	 * from `caption`'s personality-driven copy. */
	species: string;
	caption: string;
	bornLine?: string;
	palette: Record<string, string>;
	/** Rows top-to-bottom, one character per cell, all rows equal length. */
	grid: readonly string[];
};

/** Shared silhouette for the two kittens — both are tabbies in real life
 * (photo-verified littermates), so the pose AND the stripe/white-chest
 * pattern are shared; only the palette (fur tone, stripe tone, eye color,
 * paw color — the distinguishing feature) differs between them.
 * `b` body, `t` stripe, `w` white chin/chest, `d` ear-notch shade,
 * `e` eye (green outer), `k` pupil (black, toward the nose), `p` nose,
 * `x` paw. */
const TABBY_KITTEN_GRID = [
	"...b........b...",
	"..bdb......bdb..",
	".bdbb......bbdb.",
	".bbtbbbttbbbtbb.",
	".bbekbbbbbbkebb.",
	".bbbbbbbbbbbbbb.",
	".tbbbbbppbbbbbt.",
	"..bbbbwwwwbbbb..",
	".bbtbbwwwwbbtbb.",
	"btbbtbwwwwbtbbtb",
	"bbtbbtbwwbtbbtbb",
	"btbbtbbbbbbtbbtb",
	"..xxxxx..xxxxx..",
	"...xxx....xxx...",
] as const;

/** Front-facing beagle — same paw/body technique as the kittens. `n` brown,
 * `s` the dark saddle/cap marking, `w` white (muzzle/chest/paws), `k` black
 * (nose + eyes). */
const BEAGLE_GRID = [
	".....ssssss.....",
	"..ssssssssssss..",
	"nnnssssssssssnnn",
	"nnnnnnnnnnnnnnnn",
	"nnnnnknnnnknnnnn",
	"nnnnnnwwwwnnnnnn",
	"nnnnwwwkkwwwnnnn",
	"nnnnwwwwwwwwnnnn",
	"nn.nwwwwwwwwn.nn",
	".n.nwwwwwwwwn.n.",
	".nnwwwwwwwwwwnn.",
	".nnwwwwwwwwwwnn.",
	"nnnwwwwwwwwwwnnn",
	"..wwwww..wwwww..",
	"...www....www...",
] as const;

export const PETS: readonly Pet[] = [
	{
		id: "modro",
		name: "modro",
		nameColor: "#6bc7f5",
		species: "domestic shorthair",
		caption:
			"soft boy, loves to eat, follows his brother's mischief. named after luka modrić.",
		bornLine: "born apr 13, 2026",
		palette: {
			".": "transparent",
			b: "#7c6f5d",
			t: "#453a2d",
			w: "#ece5d8",
			d: "#14171b",
			e: "#a3b060",
			k: "#0d0d0d",
			p: "#d99aa8",
			x: "#3a3227",
		},
		grid: TABBY_KITTEN_GRID,
	},
	{
		id: "vida",
		name: "vida",
		nameColor: "#efe6d8",
		species: "domestic shorthair",
		caption:
			"wild rascal — always jumping, always wrestling his brother. white paws. named after domagoj vida.",
		bornLine: "born apr 13, 2026",
		palette: {
			".": "transparent",
			b: "#9d8c76",
			t: "#4d4238",
			w: "#f4efe6",
			d: "#14171b",
			e: "#84bd6e",
			k: "#0d0d0d",
			p: "#d99aa8",
			x: "#f4efe6",
		},
		grid: TABBY_KITTEN_GRID,
	},
	{
		id: "baby",
		name: "baby",
		nameColor: "#c98a4b",
		species: "beagle",
		caption: "best beagle alive. she knows it.",
		bornLine: "born apr 30, 2021",
		palette: {
			".": "transparent",
			n: "#8a5a34",
			s: "#2a201c",
			w: "#f4efe6",
			k: "#171310",
		},
		grid: BEAGLE_GRID,
	},
] as const;
