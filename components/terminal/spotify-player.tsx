"use client";

import { useEffect, useRef, useState } from "react";
import {
	loadSpotifyIframeApi,
	type SpotifyEmbedController,
} from "@/components/terminal/spotify-iframe-api";

type SpotifyPlayerProps = {
	trackId: string;
	/** 152 is Spotify's standard track card; 80 is the compact bar. */
	height?: 152 | 80;
};

/** How long after `ready` we wait for `playback_started` before concluding
 * the browser (almost always iOS/mobile Safari) ate the autoplay gesture. */
const NUDGE_DELAY_MS = 1400;
const NUDGE_TEXT = "tap ▶ to play — your phone wants the honors.";

type NudgeState = "hidden" | "visible" | "leaving";

/**
 * The embedded Spotify track player, told to `play()` the moment it's
 * ready. Mounting happens inside a user gesture (running a command,
 * clicking the red light), so desktop browsers generally allow the
 * autoplay through — but the gesture doesn't reliably carry across the
 * cross-origin iframe boundary on mobile (iOS especially blocks it
 * outright; no workaround from the page side). If `playback_started`
 * still hasn't fired ~1.4s after `ready`, a small nudge line fades in
 * below the player asking for a tap — it never appears in the normal
 * desktop case, and fades back out if playback ends up starting late.
 * Shared by `giveon` and the close-refused easter egg; CSP allowances for
 * the iFrame API live in next.config.ts.
 */
export function SpotifyPlayer({ trackId, height = 152 }: SpotifyPlayerProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const controllerRef = useRef<SpotifyEmbedController | null>(null);
	const reducedRef = useRef(false);
	const [ready, setReady] = useState(false);
	const [nudgeState, setNudgeState] = useState<NudgeState>("hidden");

	useEffect(() => {
		reducedRef.current = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
	}, []);

	useEffect(() => {
		let cancelled = false;
		let retryTimeout: ReturnType<typeof setTimeout> | null = null;
		let nudgeTimeout: ReturnType<typeof setTimeout> | null = null;
		setReady(false);
		setNudgeState("hidden");

		loadSpotifyIframeApi()
			.then((api) => {
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
						// Autoplay: play on ready, and retry once shortly after —
						// some embeds swallow the first play() while still booting.
						let started = false;
						controller.addListener("playback_started", () => {
							started = true;
							if (cancelled) return;
							// Only ever relevant once the nudge is actually showing —
							// under reduced motion skip straight to hidden (instant),
							// otherwise play the fade-out first.
							setNudgeState((current) =>
								current === "hidden"
									? "hidden"
									: reducedRef.current
										? "hidden"
										: "leaving",
							);
						});
						controller.addListener("ready", () => {
							setReady(true);
							controller.play();
							retryTimeout = setTimeout(() => {
								if (!started && !cancelled) controller.play();
							}, 700);
							nudgeTimeout = setTimeout(() => {
								if (!started && !cancelled) setNudgeState("visible");
							}, NUDGE_DELAY_MS);
						});
					},
				);
			})
			.catch(() => {
				// Blocked/offline: the card simply stays empty — the terminal
				// keeps working, and the next invocation retries the script.
			});

		return () => {
			cancelled = true;
			if (retryTimeout) clearTimeout(retryTimeout);
			if (nudgeTimeout) clearTimeout(nudgeTimeout);
			controllerRef.current?.destroy();
			controllerRef.current = null;
		};
	}, [trackId, height]);

	return (
		<div>
			{/* Width is the parent's call — giveon caps it, the close alert
			    fills. Height is reserved up front (the iframe API mounts an
			    empty container, then injects the iframe later) so it never
			    pops the layout; opacity fades in once the embed reports
			    `ready` instead of popping in mid-render. */}
			<div
				ref={containerRef}
				className={`w-full transition-opacity duration-[240ms] ease-out motion-reduce:transition-none ${
					ready ? "opacity-100" : "opacity-0"
				}`}
				style={{ minHeight: height }}
			/>
			{nudgeState !== "hidden" && (
				<p
					className={`mt-1.5 font-mono text-[11px] text-faint ${
						reducedRef.current
							? ""
							: nudgeState === "leaving"
								? "spotify-nudge-out"
								: "spotify-nudge-in"
					}`}
					onAnimationEnd={() => {
						if (nudgeState === "leaving") setNudgeState("hidden");
					}}
				>
					<span className="text-[#e0a458]">♫</span> {NUDGE_TEXT}
				</p>
			)}
		</div>
	);
}
