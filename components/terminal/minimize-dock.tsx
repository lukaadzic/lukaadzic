"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type MinimizeDockProps = {
	kidPhotoSrc: string;
	isMinimized: boolean;
	onRestore: () => void;
};

const APP_NAME = "luka_early_build.app";
const RESTORE_HINT = "click anywhere to restore";
/** Width of the fake progress bar, in block characters. */
const PROGRESS_WIDTH = 10;
/** What reduced-motion holds the bar at, forever — no crawl, no stall. */
const REDUCED_MOTION_PERCENT = 47;
const PROGRESS_TICK_MS = 130;

function reducedMotion(): boolean {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Renders `compiling ▓▓▓▓▓░░░░░ 47%` for the given 0-99 percent. */
function progressLine(percent: number): string {
	const filled = Math.min(
		PROGRESS_WIDTH,
		Math.max(0, Math.round((percent / 100) * PROGRESS_WIDTH)),
	);
	const bar = "▓".repeat(filled) + "░".repeat(PROGRESS_WIDTH - filled);
	return `compiling ${bar} ${percent}%`;
}

/** The splash's photo, with a graceful fallback: a missing file swaps to a
 * plain site-surface tint with a green `L` instead of a broken-image icon,
 * same pattern as `DestinyPhoto` in destiny-easter-egg.tsx. */
function SplashPhoto({ src }: { src: string }) {
	const [failed, setFailed] = useState(false);

	if (failed) {
		return (
			<div
				aria-hidden="true"
				className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/[0.07] to-white/[0.02] font-mono text-[40px] text-[#5fd75f]"
			>
				L
			</div>
		);
	}

	return (
		// biome-ignore lint/performance/noImgElement: a single small local asset behind an easter egg — next/image's overhead isn't worth it here (same call as DestinyPhoto).
		<img
			src={src}
			alt=""
			onError={() => setFailed(true)}
			className="h-full w-full object-cover"
		/>
	);
}

/**
 * The full-viewport "still compiling" splash the yellow light minimizes the
 * terminal into — baby-Luka's icon centered over the wallpaper, boot-screen
 * style for `luka_early_build.app`, because the terminal really is still
 * running (its state and any playing music survive under
 * `visibility: hidden`). A tiny `setInterval` drives a fake compile progress
 * bar that crawls up, stalls near 99%, and drops back — it's v0.1, still
 * compiling, and it never finishes; that's the joke. Always mounted
 * (portaled to `document.body`, same pattern as `DestinyEasterEgg`) but
 * renders nothing while `isMinimized` is false — the terminal window itself
 * stays mounted throughout, so no state is ever lost. Clicking anywhere on
 * the splash (or Enter/Space on the focused icon, or Esc from anywhere)
 * sinks it back down before handing off to `onRestore`, which is what
 * actually flips the window visible again.
 */
export function MinimizeDock({
	kidPhotoSrc,
	isMinimized,
	onRestore,
}: MinimizeDockProps) {
	const buttonRef = useRef<HTMLButtonElement>(null);
	const exitingRef = useRef(false);
	const [exiting, setExiting] = useState(false);
	const [bouncing, setBouncing] = useState(false);
	const [percent, setPercent] = useState(12);

	// Fresh appearance each time the splash comes up, and focus lands on the
	// icon — the restore-side counterpart to the yellow light losing focus.
	useEffect(() => {
		if (!isMinimized) return;
		exitingRef.current = false;
		setExiting(false);
		setBouncing(false);
		setPercent(12);
		buttonRef.current?.focus();
	}, [isMinimized]);

	// The fake compile progress: crawls up, hangs near 99% for a few ticks,
	// then drops back to somewhere in the 50s/60s and climbs again — v0.1,
	// still compiling, never actually finishes. Reduced motion skips the
	// crawl entirely and just holds one static value.
	useEffect(() => {
		if (!isMinimized) return;
		if (reducedMotion()) {
			setPercent(REDUCED_MOTION_PERCENT);
			return;
		}
		let stall = 0;
		const id = setInterval(() => {
			setPercent((prev) => {
				if (prev >= 99) {
					stall += 1;
					if (stall <= 5) return 99;
					stall = 0;
					return 52 + Math.floor(Math.random() * 12);
				}
				const step =
					prev > 92
						? Math.random() < 0.35
							? 1
							: 0
						: 1 + Math.floor(Math.random() * 4);
				return Math.min(99, prev + step);
			});
		}, PROGRESS_TICK_MS);
		return () => clearInterval(id);
	}, [isMinimized]);

	// A ref mirror of the restore path so the Esc listener below can always
	// call the latest version without re-subscribing on every render.
	const beginRestoreRef = useRef<() => void>(() => {});
	beginRestoreRef.current = () => {
		if (exitingRef.current) return;
		if (reducedMotion()) {
			onRestore();
			return;
		}
		exitingRef.current = true;
		setExiting(true);
	};

	// Esc restores from anywhere while the splash is up, same as clicking it.
	useEffect(() => {
		if (!isMinimized) return;
		function onKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				event.preventDefault();
				beginRestoreRef.current();
			}
		}
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [isMinimized]);

	if (!isMinimized) return null;

	function handleBounce() {
		if (reducedMotion()) return;
		// Retrigger even if already mid-bounce, same reflow trick as the red
		// light's shake (terminal-window.tsx).
		setBouncing(false);
		requestAnimationFrame(() => setBouncing(true));
	}

	return createPortal(
		// biome-ignore lint/a11y/noStaticElementInteractions: click-anywhere-to-restore is the whole point of this full-viewport layer; the icon button underneath remains the keyboard-operable control (Enter/Space), and Esc is handled globally above.
		// biome-ignore lint/a11y/useKeyWithClickEvents: same reasoning — the button inside handles keyboard activation, and the global Esc listener above covers keyboard dismissal for this layer.
		<div
			className={`minimize-splash-wrap ${exiting ? "minimize-splash-out" : ""}`}
			onClick={() => beginRestoreRef.current()}
			onAnimationEnd={(event) => {
				if (event.animationName === "minimize-splash-out") {
					onRestore();
				}
			}}
		>
			<button
				ref={buttonRef}
				type="button"
				aria-label="restore the terminal"
				onMouseEnter={handleBounce}
				onAnimationEnd={(event) => {
					if (event.animationName === "minimize-splash-bounce") {
						setBouncing(false);
					}
				}}
				className={`minimize-splash-icon h-28 w-28 overflow-hidden rounded-[24px] border border-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_24px_48px_rgba(0,0,0,0.5),0_10px_20px_rgba(0,0,0,0.35)] ${
					bouncing ? "minimize-splash-bounce" : ""
				}`}
			>
				<SplashPhoto src={kidPhotoSrc} />
			</button>
			<p className="minimize-splash-name mt-4 font-mono text-[13px] text-foreground">
				{APP_NAME}
			</p>
			<p
				aria-hidden="true"
				className="minimize-splash-progress mt-2 min-w-[15ch] text-center font-mono text-[12px] text-muted"
			>
				{progressLine(percent)}
			</p>
			<p className="minimize-splash-hint mt-3 font-mono text-[11px] text-faint">
				{RESTORE_HINT}
			</p>
		</div>,
		document.body,
	);
}
