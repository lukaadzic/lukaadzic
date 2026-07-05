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
