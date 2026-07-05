"use client";

import { useEffect, useRef } from "react";
import {
	loadSpotifyIframeApi,
	type SpotifyEmbedController,
} from "@/components/terminal/spotify-iframe-api";

type SpotifyPlayerProps = {
	trackId: string;
	/** 152 is Spotify's standard track card; 80 is the compact bar. */
	height?: 152 | 80;
};

/**
 * The embedded Spotify track player, told to `play()` the moment it's
 * ready. Mounting happens inside a user gesture (running a command,
 * clicking the red light), so browsers generally allow the autoplay
 * through; if one blocks it, the visible player is a tap away. Shared by
 * `giveon` and the close-refused easter egg — CSP allowances for the
 * iFrame API live in next.config.ts.
 */
export function SpotifyPlayer({ trackId, height = 152 }: SpotifyPlayerProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const controllerRef = useRef<SpotifyEmbedController | null>(null);

	useEffect(() => {
		let cancelled = false;

		loadSpotifyIframeApi().then((api) => {
			if (cancelled || !containerRef.current) return;
			api.createController(
				containerRef.current,
				{
					uri: `spotify:track:${trackId}`,
					width: "100%",
					height,
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
	}, [trackId, height]);

	// Width is the parent's call — giveon caps it, the close alert fills.
	return <div ref={containerRef} className="w-full" />;
}
