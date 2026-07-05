"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type MinimizeDockProps = {
	kidPhotoSrc: string;
	isMinimized: boolean;
	onRestore: () => void;
};

function reducedMotion(): boolean {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** The dock icon's photo, with a graceful fallback: a missing file (the
 * photo hasn't been dropped into `public/` yet) swaps to a plain
 * site-surface tint with a green `L` instead of a broken-image icon, same
 * pattern as `DestinyPhoto` in destiny-easter-egg.tsx. */
function DockPhoto({ src }: { src: string }) {
	const [failed, setFailed] = useState(false);

	if (failed) {
		return (
			<div
				aria-hidden="true"
				className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/[0.07] to-white/[0.02] font-mono text-[26px] text-[#5fd75f]"
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
 * The macOS-dock-style icon the yellow light minimizes the terminal into.
 * Always mounted (portaled to `document.body`, same pattern as
 * `DestinyEasterEgg`) but renders nothing while `isMinimized` is false — the
 * terminal window itself stays mounted throughout, so no state is ever lost.
 * Clicking (or Enter/Space/Esc while this is up) plays a quick exit pop
 * before handing back to `onRestore`, which is what actually flips the
 * window visible again.
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
	const [tooltipVisible, setTooltipVisible] = useState(false);

	// Fresh appearance each time the dock comes up, and focus lands on the
	// icon — the restore-side counterpart to the yellow light losing focus.
	useEffect(() => {
		if (!isMinimized) return;
		exitingRef.current = false;
		setExiting(false);
		setBouncing(false);
		setTooltipVisible(false);
		buttonRef.current?.focus();
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

	// Esc restores from anywhere while the dock is up, same as clicking it.
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

	function handleMouseEnter() {
		setTooltipVisible(true);
		if (reducedMotion()) return;
		// Retrigger even if already mid-bounce, same reflow trick as the red
		// light's shake (terminal-window.tsx).
		setBouncing(false);
		requestAnimationFrame(() => setBouncing(true));
	}

	function handleAnimationEnd(event: React.AnimationEvent<HTMLButtonElement>) {
		if (event.animationName === "dock-icon-bounce") {
			setBouncing(false);
		} else if (event.animationName === "dock-icon-out") {
			onRestore();
		}
	}

	return createPortal(
		<div className="fixed bottom-6 left-6 z-30 flex flex-col items-center gap-1.5">
			<div className="relative">
				<div
					role="tooltip"
					id="minimize-dock-tooltip"
					className={`dock-tooltip ${tooltipVisible ? "dock-tooltip-visible" : ""}`}
				>
					<p className="text-foreground">luka.exe (early build)</p>
					<p>status: minimized</p>
					<p>version: 0.1 — still compiling</p>
				</div>
				<button
					ref={buttonRef}
					type="button"
					aria-label="restore the terminal"
					aria-describedby="minimize-dock-tooltip"
					onClick={() => beginRestoreRef.current()}
					onMouseEnter={handleMouseEnter}
					onMouseLeave={() => setTooltipVisible(false)}
					onFocus={() => setTooltipVisible(true)}
					onBlur={() => setTooltipVisible(false)}
					onAnimationEnd={handleAnimationEnd}
					className={`relative flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_10px_30px_rgba(0,0,0,0.45)] ${
						bouncing ? "dock-icon-bounce" : ""
					} ${exiting ? "dock-icon-out" : "dock-icon-in"}`}
				>
					<DockPhoto src={kidPhotoSrc} />
				</button>
			</div>
			<p
				aria-hidden="true"
				className="select-none font-mono text-[10px] text-faint"
			>
				luka_early_build.app
			</p>
			<p
				aria-hidden="true"
				className="select-none font-mono text-[9px]"
				style={{ color: "rgba(237, 237, 237, 0.28)" }}
			>
				click to restore
			</p>
		</div>,
		document.body,
	);
}
