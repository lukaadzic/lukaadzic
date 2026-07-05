"use client";

import { useEffect, useRef, useState } from "react";
import { SpotifyPlayer } from "@/components/terminal/spotify-player";
import { CLOSE_ALERT, CLOSE_TRACK } from "@/lib/easter-eggs";

type CloseAlertProps = {
	open: boolean;
	/** How many times the red light has been clicked this session — repeat
	 * visits get the shorter, more resigned body copy. */
	attempt: number;
	onStay: () => void;
	onGiveUp: () => void;
};

/**
 * The "don't leave." alert — the terminal's own quit-confirmation dialog,
 * heartbroken, with DON'T LEAVE already playing inside it. Styled to sit
 * inside the site's design language: mono type, window-chrome surface,
 * chip-styled buttons. Once mounted it never unmounts, only toggles
 * visibility: that keeps the Spotify iframe (and the music) alive after
 * the alert is dismissed. `leave anyway` loses its nerve twice before
 * giving up, and giving up just closes the alert — scripts can't close
 * the tab, so the joke is the honest behavior.
 */
export function CloseAlert({
	open,
	attempt,
	onStay,
	onGiveUp,
}: CloseAlertProps) {
	const [leaveClicks, setLeaveClicks] = useState(0);
	const stayRef = useRef<HTMLButtonElement>(null);
	const leaveRef = useRef<HTMLButtonElement>(null);

	// Each fresh open resets the leave button's nerve and takes focus.
	useEffect(() => {
		if (!open) return;
		setLeaveClicks(0);
		stayRef.current?.focus();
	}, [open]);

	// Esc = stay; Tab cycles between the two buttons (minimal focus trap).
	useEffect(() => {
		if (!open) return;
		function onKeyDown(event: globalThis.KeyboardEvent) {
			if (event.key === "Escape") {
				event.preventDefault();
				onStay();
			} else if (event.key === "Tab") {
				event.preventDefault();
				const next =
					document.activeElement === stayRef.current ? leaveRef : stayRef;
				next.current?.focus();
			}
		}
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [open, onStay]);

	function handleLeave() {
		if (leaveClicks >= CLOSE_ALERT.leaveLabels.length - 1) {
			onGiveUp();
			return;
		}
		setLeaveClicks((clicks) => clicks + 1);
	}

	const leaveLabel =
		CLOSE_ALERT.leaveLabels[
			Math.min(leaveClicks, CLOSE_ALERT.leaveLabels.length - 1)
		];
	const bodyLines = attempt > 1 ? [CLOSE_ALERT.bodyRepeat] : CLOSE_ALERT.body;

	return (
		<div
			className={open ? undefined : "invisible"}
			aria-hidden={open ? undefined : true}
		>
			{/* Dim the window only — absolute within the window frame, above
			    the sticky title bar (z-20). Esc covers keyboard dismissal. */}
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click mirrors macOS; Escape is the keyboard path. */}
			{/* biome-ignore lint/a11y/noStaticElementInteractions: same — decorative scrim, not a control. */}
			<div
				className={`absolute inset-0 z-40 bg-black/45 ${
					open ? "close-alert-backdrop" : ""
				}`}
				onClick={onStay}
			/>

			{/* The panel centers in the viewport so it never drifts off-screen
			    inside a page-height window. */}
			<div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
				<div
					role="alertdialog"
					aria-modal="true"
					aria-labelledby="close-alert-title"
					aria-describedby="close-alert-body"
					className={`close-alert-surface pointer-events-auto w-[360px] max-w-[calc(100vw-32px)] p-4 font-mono text-[13px] leading-relaxed ${
						open ? "close-alert-panel" : ""
					}`}
				>
					<h2
						id="close-alert-title"
						className="font-semibold text-[13px] text-foreground"
					>
						<span aria-hidden="true" className="mr-2 text-[14px]">
							💔
						</span>
						{CLOSE_ALERT.title}
					</h2>
					<div id="close-alert-body" className="mt-1.5 text-muted">
						{bodyLines.map((line, index) => (
							<p
								key={line}
								className={open ? "close-alert-line" : undefined}
								style={{ animationDelay: `${80 + index * 80}ms` }}
							>
								{line}
							</p>
						))}
					</div>

					<div className="mt-3">
						<SpotifyPlayer trackId={CLOSE_TRACK.spotifyTrackId} height={80} />
					</div>

					<div className="mt-3 flex gap-2">
						<button
							ref={leaveRef}
							type="button"
							onClick={handleLeave}
							className="terminal-chip penalty-chip flex-1"
						>
							{leaveLabel}
						</button>
						<button
							ref={stayRef}
							type="button"
							onClick={onStay}
							className="terminal-chip terminal-chip-accent penalty-chip flex-1"
						>
							{CLOSE_ALERT.stay}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
