"use client";

import { useEffect, useRef } from "react";
import { ExternalLink } from "@/components/shared/external-link";
import {
	loadSpotifyIframeApi,
	type SpotifyEmbedController,
} from "@/components/terminal/spotify-iframe-api";
import { BELOVED, type FeaturedTrack } from "@/lib/easter-eggs";

type GiveonOutputProps = {
	/** Picked at command-execution time by the caller (same pattern as
	 *  `date`) so it doesn't reshuffle on unrelated re-renders. */
	track: FeaturedTrack;
};

/**
 * `giveon` / `beloved` — a terminal "now playing" card that actually plays:
 * the official Spotify embed iFrame API, mounted and told to `play()` the
 * moment the command runs. That call happens inside a user gesture (running
 * the command), so browsers generally allow the autoplay through; if a
 * browser still blocks it, the visible player is one tap away. frame-src
 * for open.spotify.com is allowlisted in next.config.ts, alongside the
 * script-src additions the iFrame API itself needs.
 */
export function GiveonOutput({ track }: GiveonOutputProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const controllerRef = useRef<SpotifyEmbedController | null>(null);

	useEffect(() => {
		let cancelled = false;

		loadSpotifyIframeApi().then((api) => {
			if (cancelled || !containerRef.current) return;
			api.createController(
				containerRef.current,
				{
					uri: `spotify:track:${track.spotifyTrackId}`,
					width: "100%",
					height: 152,
				},
				(controller) => {
					if (cancelled) {
						controller.destroy();
						return;
					}
					controllerRef.current = controller;
					controller.addListener("ready", () => controller.play());
				},
			);
		});

		return () => {
			cancelled = true;
			controllerRef.current?.destroy();
			controllerRef.current = null;
		};
	}, [track.spotifyTrackId]);

	return (
		<div className="leading-relaxed">
			<p className="text-[#e0a458]">♫ now playing</p>
			<p className="mb-2 text-foreground">{track.title}</p>
			<div ref={containerRef} className="max-w-[420px]" />
			<p className="mt-1.5 text-faint">
				(if it's quiet, tap play — your browser is shy)
			</p>
			<p className="mt-2 text-faint">
				{BELOVED.title} — {BELOVED.artist} · {BELOVED.year}
			</p>
			<ExternalLink
				href={BELOVED.spotifyUrl}
				className="text-muted underline decoration-white/20 underline-offset-4 transition-colors duration-200 hover:text-accent"
			>
				open the album in spotify <span aria-hidden="true">↗</span>
			</ExternalLink>
		</div>
	);
}
