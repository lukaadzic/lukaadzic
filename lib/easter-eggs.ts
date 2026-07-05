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
