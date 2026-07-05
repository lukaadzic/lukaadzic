"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { CloseAlert } from "@/components/terminal/close-alert";
import { CLOSE_ALERT } from "@/lib/easter-eggs";

type TerminalWindowProps = {
	children: ReactNode;
	/**
	 * The 404 card is too small to fill the screen — it always floats, and
	 * the green light nudges its width like the old zoom behavior.
	 */
	floatingOnly?: boolean;
};

const TITLE = "lukaadzic — -zsh — 80×24";
const MODE_STORAGE_KEY = "terminal-window-mode";

export function TerminalWindow({
	children,
	floatingOnly = false,
}: TerminalWindowProps) {
	// Fullscreen is the default; the green traffic light zooms down to the
	// floating windowed look and back, remembered per tab.
	const [fullscreen, setFullscreen] = useState(!floatingOnly);
	const [maximized, setMaximized] = useState(false);
	const [shaking, setShaking] = useState(false);
	const [minimizing, setMinimizing] = useState(false);
	const [showNiceTry, setShowNiceTry] = useState(false);
	// Red light on the home page: a "don't leave." alert instead of a toast.
	// closeAttempts doubles as "has the alert ever been mounted" — the alert
	// stays mounted after the first open so its Spotify iframe (and the
	// music) survives dismissal.
	const [closeAttempts, setCloseAttempts] = useState(0);
	const [alertOpen, setAlertOpen] = useState(false);
	const [showStayNote, setShowStayNote] = useState(false);
	const shakeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
	const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
	const stayNoteTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);

	// Restore this tab's zoom choice (default: fullscreen on first visit).
	useEffect(() => {
		if (floatingOnly) return;
		try {
			if (window.sessionStorage.getItem(MODE_STORAGE_KEY) === "floating") {
				setFullscreen(false);
			}
		} catch {
			// sessionStorage unavailable (e.g. blocked) — keep the default.
		}
	}, [floatingOnly]);

	function handleClose() {
		setShaking(false);
		// Force a reflow so retriggering the animation class works even if
		// clicked twice in quick succession.
		requestAnimationFrame(() => setShaking(true));
		if (shakeTimeout.current) clearTimeout(shakeTimeout.current);
		shakeTimeout.current = setTimeout(() => setShaking(false), 420);

		// The 404 card keeps the plain toast. The home terminal can't let
		// go: a macOS-style "don't leave." alert opens with DON'T LEAVE
		// already playing inside it.
		if (floatingOnly) {
			setShowNiceTry(true);
			if (toastTimeout.current) clearTimeout(toastTimeout.current);
			toastTimeout.current = setTimeout(() => setShowNiceTry(false), 1400);
			return;
		}
		setCloseAttempts((attempts) => attempts + 1);
		setAlertOpen(true);
	}

	function handleAlertStay() {
		setAlertOpen(false);
		closeButtonRef.current?.focus();
	}

	function handleAlertGiveUp() {
		setAlertOpen(false);
		setShowStayNote(true);
		if (stayNoteTimeout.current) clearTimeout(stayNoteTimeout.current);
		stayNoteTimeout.current = setTimeout(() => setShowStayNote(false), 2400);
		closeButtonRef.current?.focus();
	}

	function handleMinimize() {
		if (minimizing) return;
		setMinimizing(true);
		// The reset normally happens on animationend, but reduced-motion
		// disables the keyframes entirely — reset immediately so the button
		// doesn't get stuck as a permanent no-op.
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			setMinimizing(false);
		}
	}

	function handleZoom() {
		if (floatingOnly) {
			setMaximized((prev) => !prev);
			return;
		}
		setFullscreen((prev) => {
			const next = !prev;
			try {
				window.sessionStorage.setItem(
					MODE_STORAGE_KEY,
					next ? "fullscreen" : "floating",
				);
			} catch {
				// Persistence is best-effort only.
			}
			return next;
		});
	}

	const frameClass = floatingOnly
		? `mx-auto transition-[max-width] duration-300 ease-out ${
				maximized ? "max-w-[960px]" : "max-w-[720px]"
			}`
		: "terminal-window-frame mx-auto";

	return (
		<div
			data-mode={
				floatingOnly ? undefined : fullscreen ? "fullscreen" : "floating"
			}
			className={`terminal-window-in relative w-full ${frameClass} ${
				shaking ? "terminal-shake" : ""
			} ${minimizing ? "terminal-minimize" : ""}`}
			onAnimationEnd={(event) => {
				if (event.animationName === "terminal-minimize") {
					setMinimizing(false);
				}
			}}
		>
			<div className="terminal-window-chrome">
				<div className="terminal-window-titlebar relative flex h-[38px] items-center justify-center bg-gradient-to-b from-white/[0.07] to-black/[0.15] px-3 backdrop-blur-sm">
					<div className="group absolute left-5 flex items-center gap-2">
						<button
							ref={closeButtonRef}
							type="button"
							aria-label="Close"
							onClick={handleClose}
							className="relative flex h-3 w-3 items-center justify-center rounded-full bg-[#ff5f57] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.15)]"
						>
							<span className="select-none text-[8px] leading-none text-black/60 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
								×
							</span>
						</button>
						<button
							type="button"
							aria-label="Minimize"
							onClick={handleMinimize}
							className="relative flex h-3 w-3 items-center justify-center rounded-full bg-[#febc2e] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.15)]"
						>
							<span className="select-none text-[8px] leading-none text-black/60 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
								−
							</span>
						</button>
						<button
							type="button"
							aria-label="Zoom"
							onClick={handleZoom}
							className="relative flex h-3 w-3 items-center justify-center rounded-full bg-[#28c840] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.15)]"
						>
							<span className="select-none text-[8px] leading-none text-black/60 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
								+
							</span>
						</button>
					</div>

					<p className="select-none truncate font-sans text-[13px] font-medium text-white/[0.55]">
						{TITLE}
					</p>

					{showNiceTry && (
						<span
							aria-hidden="true"
							className="terminal-toast absolute left-3 top-full mt-1.5 rounded-md bg-black/80 px-2 py-1 text-[11px] text-white/80"
						>
							nice try 🙂
						</span>
					)}

					{showStayNote && (
						<output className="terminal-toast absolute left-3 top-full z-30 mt-1.5 rounded-md bg-black/80 px-2 py-1 text-[11px] text-white/60">
							{CLOSE_ALERT.dismissNote}
						</output>
					)}
				</div>

				<div className="terminal-window-content p-4 sm:p-6">
					<div className="terminal-window-content-inner">{children}</div>
				</div>
			</div>

			{closeAttempts > 0 && (
				<CloseAlert
					open={alertOpen}
					attempt={closeAttempts}
					onStay={handleAlertStay}
					onGiveUp={handleAlertGiveUp}
				/>
			)}
		</div>
	);
}
