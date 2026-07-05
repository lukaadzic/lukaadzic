"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type MinimizeDockProps = {
	kidPhotoSrc: string;
	isMinimized: boolean;
	onRestore: () => void;
};

const DOCK_LABEL = "luka_early_build.app — v0.1, still compiling";

function reducedMotion(): boolean {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** The dock icon's photo, with a graceful fallback: a missing file swaps to
 * a plain site-surface tint with a green `L` instead of a broken-image
 * icon, same pattern as `DestinyPhoto` in destiny-easter-egg.tsx. */
function DockPhoto({ src }: { src: string }) {
	const [failed, setFailed] = useState(false);

	if (failed) {
		return (
			<div
				aria-hidden="true"
				className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/[0.07] to-white/[0.02] font-mono text-[24px] text-[#5fd75f]"
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
 * The macOS-style dock the yellow light minimizes the terminal into: a
 * translucent bottom-center shelf holding exactly one app icon, with the
 * running-app indicator dot lit — because the terminal really is still
 * running (its state and any playing music survive under
 * `visibility: hidden`). Hover/focus floats the app-name pill above the
 * shelf, macOS-style; there's no permanent caption. Always mounted
 * (portaled to `document.body`, same pattern as `DestinyEasterEgg`) but
 * renders nothing while `isMinimized` is false — the terminal window itself
 * stays mounted throughout, so no state is ever lost. Clicking (or
 * Enter/Space/Esc while the dock is up) sinks the shelf back down before
 * handing back to `onRestore`, which is what actually flips the window
 * visible again.
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
	const [labelVisible, setLabelVisible] = useState(false);

	// Fresh appearance each time the dock comes up, and focus lands on the
	// icon — the restore-side counterpart to the yellow light losing focus.
	useEffect(() => {
		if (!isMinimized) return;
		exitingRef.current = false;
		setExiting(false);
		setBouncing(false);
		setLabelVisible(false);
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
		setLabelVisible(true);
		if (reducedMotion()) return;
		// Retrigger even if already mid-bounce, same reflow trick as the red
		// light's shake (terminal-window.tsx).
		setBouncing(false);
		requestAnimationFrame(() => setBouncing(true));
	}

	return createPortal(
		<div className="dock-wrap">
			<div
				className={`dock-shelf ${exiting ? "dock-shelf-out" : "dock-shelf-in"}`}
				onAnimationEnd={(event) => {
					if (event.animationName === "dock-shelf-out") {
						onRestore();
					}
				}}
			>
				<div
					role="tooltip"
					id="minimize-dock-label"
					className={`dock-label ${labelVisible ? "dock-label-visible" : ""}`}
				>
					{DOCK_LABEL}
				</div>
				<div className="flex flex-col items-center gap-[5px]">
					<button
						ref={buttonRef}
						type="button"
						aria-label="restore the terminal"
						aria-describedby="minimize-dock-label"
						onClick={() => beginRestoreRef.current()}
						onMouseEnter={handleMouseEnter}
						onMouseLeave={() => setLabelVisible(false)}
						onFocus={(event) => {
							// Keyboard focus only — the dock auto-focuses this button on
							// minimize, and a mouse-driven minimize shouldn't leave the
							// name pill stranded open like a stuck tooltip.
							if (event.target.matches(":focus-visible")) {
								setLabelVisible(true);
							}
						}}
						onBlur={() => setLabelVisible(false)}
						onAnimationEnd={(event) => {
							if (event.animationName === "dock-icon-bounce") {
								setBouncing(false);
							}
						}}
						className={`h-16 w-16 overflow-hidden rounded-[14px] shadow-[0_4px_12px_rgba(0,0,0,0.4)] ${
							bouncing ? "dock-icon-bounce" : ""
						}`}
					>
						<DockPhoto src={kidPhotoSrc} />
					</button>
					<span aria-hidden="true" className="dock-running-dot" />
				</div>
			</div>
		</div>,
		document.body,
	);
}
