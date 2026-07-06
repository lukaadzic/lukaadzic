"use client";

import {
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { CloseAlert } from "@/components/terminal/close-alert";
import { MinimizeDock } from "@/components/terminal/minimize-dock";
import { loadSpotifyIframeApi } from "@/components/terminal/spotify-iframe-api";
import { CLOSE_ALERT } from "@/lib/easter-eggs";

type TerminalWindowProps = {
	children: ReactNode;
	/**
	 * The `/404` page reuses this exact fullscreen chrome (same layout as the
	 * home page) but keeps its own old, simple traffic-light behaviors
	 * instead of the home page's dock/alert: red shakes + toasts, yellow
	 * does the old plain bounce-back, green is a no-op — there's no floating
	 * mode to zoom into on a page with no session engine, so there's nothing
	 * to remember per tab either.
	 */
	simpleControls?: boolean;
};

const TITLE = "lukaadzic — -zsh — 80×24";
const MODE_STORAGE_KEY = "terminal-window-mode";
// Doesn't exist yet — MinimizeDock falls back to a green `L` mark via
// `onError` until this file is dropped into `public/images/`.
const KID_PHOTO_SRC = "/images/luka-kid.jpg";

export function TerminalWindow({
	children,
	simpleControls = false,
}: TerminalWindowProps) {
	// Fullscreen is the default everywhere; the green traffic light zooms it
	// down to the floating windowed look and back on the home page,
	// remembered per tab. `/404` never leaves fullscreen (green is a no-op
	// there), so this just stays true for it.
	const [fullscreen, setFullscreen] = useState(true);
	const [shaking, setShaking] = useState(false);
	// The old bounce-back minimize — kept only for `/404`'s simple controls,
	// which has no desktop to dock an icon onto.
	const [minimizing, setMinimizing] = useState(false);
	// The real minimize-to-dock, home page only. `flyingOut` plays the
	// shrink-fly animation on the window frame; once that finishes,
	// `windowHidden` hides the frame and `dockOpen` mounts the splash.
	// Restoring used to be "wait for the splash's own fade-out to finish,
	// THEN unhide the window" — sequential, and the visible cause of the
	// restore jostle. Now `windowHidden` drops (and `restoring` starts the
	// window's fade-in) the instant a restore is requested, at the exact
	// same tick `dismissing` (== `restoring`, passed to `MinimizeDock`)
	// starts the splash's own fade-out — a real crossfade. `dockOpen` only
	// goes false once the splash's fade-out animation actually completes
	// (`handleDockDismissed`), independent of the window's own fade-in
	// timing, so the splash and window both stay mounted throughout the
	// blend instead of one popping out from under the other.
	const [flyingOut, setFlyingOut] = useState(false);
	const [dockOpen, setDockOpen] = useState(false);
	const [windowHidden, setWindowHidden] = useState(false);
	const [restoring, setRestoring] = useState(false);
	// True once the window's own entrance animation has finished — after
	// that, `terminal-window-in`/`-flat` is stripped from the frame's class
	// list for good. Left in place, it stays the highest-specificity
	// `animation` declaration once `restoring`'s class comes back off, and a
	// change in the winning `animation-name` restarts a CSS animation from
	// its `from` state even when the "to" state already matches — so every
	// restore was replaying the page-load fade-in (a real, reproduced
	// jostle) right after the crossfade had already finished.
	const [hasEntered, setHasEntered] = useState(false);
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
	const minimizeButtonRef = useRef<HTMLButtonElement>(null);
	const skipRestoreFocusRef = useRef(true);

	// Pending timers must not fire into an unmounted component.
	useEffect(() => {
		return () => {
			if (shakeTimeout.current) clearTimeout(shakeTimeout.current);
			if (toastTimeout.current) clearTimeout(toastTimeout.current);
			if (stayNoteTimeout.current) clearTimeout(stayNoteTimeout.current);
		};
	}, []);

	// Restore this tab's zoom choice (default: fullscreen on first visit).
	// `/404` has no floating mode to restore into, so it skips this entirely.
	useEffect(() => {
		if (simpleControls) return;
		try {
			if (window.sessionStorage.getItem(MODE_STORAGE_KEY) === "floating") {
				setFullscreen(false);
			}
		} catch {
			// sessionStorage unavailable (e.g. blocked) — keep the default.
		}
	}, [simpleControls]);

	// The 404 page never opens the "don't leave." alert, so it never needs
	// the Spotify iFrame API — only the home page warms it.
	const warmSpotify = useCallback(() => {
		if (simpleControls) return;
		// Cheap no-op once the script is cached — safe to call repeatedly.
		loadSpotifyIframeApi().catch(() => {
			// Blocked/offline: the click path just retries later, same as today.
		});
	}, [simpleControls]);

	// Warm the Spotify iFrame API during idle time, well before anyone's
	// touched the red light — so by the time "don't leave." opens, the
	// script is already cached and the embedded player boots instantly
	// instead of paying for a fresh script fetch after the popup appears.
	useEffect(() => {
		if (simpleControls) return;
		const idleWindow = window as Window & {
			requestIdleCallback?: (
				callback: IdleRequestCallback,
				options?: IdleRequestOptions,
			) => number;
			cancelIdleCallback?: (handle: number) => void;
		};

		if (typeof idleWindow.requestIdleCallback === "function") {
			const handle = idleWindow.requestIdleCallback(warmSpotify, {
				timeout: 3000,
			});
			return () => idleWindow.cancelIdleCallback?.(handle);
		}

		const timeout = setTimeout(warmSpotify, 2500);
		return () => clearTimeout(timeout);
	}, [simpleControls, warmSpotify]);

	function handleClose() {
		setShaking(false);
		// Force a reflow so retriggering the animation class works even if
		// clicked twice in quick succession.
		requestAnimationFrame(() => setShaking(true));
		if (shakeTimeout.current) clearTimeout(shakeTimeout.current);
		shakeTimeout.current = setTimeout(() => setShaking(false), 420);

		// The 404 page keeps the plain toast. The home terminal can't let
		// go: a macOS-style "don't leave." alert opens with DON'T LEAVE
		// already playing inside it.
		if (simpleControls) {
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
		// The 404 page keeps the old bounce-back — it has no desktop behind it
		// to dock an icon onto.
		if (simpleControls) {
			if (minimizing) return;
			setMinimizing(true);
			// The reset normally happens on animationend, but reduced-motion
			// disables the keyframes entirely — reset immediately so the button
			// doesn't get stuck as a permanent no-op.
			if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
				setMinimizing(false);
			}
			return;
		}

		if (flyingOut || dockOpen) return;
		setFlyingOut(true);
		// The entrance animation is long finished by the time anyone can
		// reach this button — belt-and-suspenders in case it somehow isn't.
		setHasEntered(true);
		// Same reduced-motion escape hatch as above: skip straight to the
		// hidden/docked state since the fly-out keyframes never play, so
		// `animationend` never fires to do it for us.
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			setFlyingOut(false);
			setWindowHidden(true);
			setDockOpen(true);
		}
	}

	// The counterpart to handleMinimize — called by the dock icon the
	// instant a restore is requested (click/Enter/Esc), not after any
	// animation of its own. Unhiding the window and starting its fade-in
	// here, in the same tick `restoring` flips (which `MinimizeDock` also
	// receives as `dismissing`, starting its own fade-out), is what makes
	// the two blend as one crossfade instead of playing back to back.
	// Guarded against double-firing (e.g. a stray Esc right after a click).
	function handleRestore() {
		if (restoring) return;
		setWindowHidden(false);
		setRestoring(true);
		// Reduced motion: instant swap, no crossfade to run at all — drop
		// the splash and settle the window in the same tick.
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			setRestoring(false);
			setDockOpen(false);
		}
	}

	// The splash's own fade-out has actually finished (non-reduced-motion
	// path only — the reduced-motion branch above already dropped it).
	function handleDockDismissed() {
		setDockOpen(false);
	}

	// Runs after the frame's `visibility: hidden` has actually been lifted,
	// so the yellow light is focusable again. Skips the initial mount, since
	// `windowHidden` starting as `false` shouldn't steal focus on page load.
	useEffect(() => {
		if (skipRestoreFocusRef.current) {
			skipRestoreFocusRef.current = false;
			return;
		}
		if (!windowHidden) {
			minimizeButtonRef.current?.focus();
		}
	}, [windowHidden]);

	function handleZoom() {
		// `/404` has no floating mode to zoom into — green is a no-op there.
		if (simpleControls) return;
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

	return (
		<div
			data-mode={fullscreen ? "fullscreen" : "floating"}
			className={`${hasEntered ? "" : "terminal-window-in"} relative w-full terminal-window-frame mx-auto ${
				shaking ? "terminal-shake" : ""
			} ${minimizing ? "terminal-minimize" : ""} ${
				flyingOut ? "terminal-minimize-fly" : ""
			} ${restoring ? "terminal-restore-in" : ""} ${
				windowHidden && !restoring ? "terminal-window-hidden" : ""
			}`}
			onAnimationEnd={(event) => {
				if (event.animationName === "terminal-minimize") {
					setMinimizing(false);
				} else if (event.animationName === "terminal-minimize-fly") {
					setFlyingOut(false);
					setWindowHidden(true);
					setDockOpen(true);
				} else if (event.animationName === "terminal-restore-in") {
					setRestoring(false);
				} else if (
					event.animationName === "terminal-window-in" ||
					event.animationName === "terminal-window-in-flat"
				) {
					setHasEntered(true);
				}
			}}
		>
			<div className="terminal-window-chrome">
				<div className="terminal-window-titlebar relative flex h-[38px] items-center justify-center bg-gradient-to-b from-white/[0.07] to-black/[0.15] px-3 backdrop-blur-sm">
					{/* biome-ignore lint/a11y/noStaticElementInteractions: passive intent-warm listener only (loads a script), not a control — the real interactive elements are the buttons inside. */}
					<div
						className="group absolute left-5 flex items-center gap-2"
						onPointerOver={warmSpotify}
						onFocus={warmSpotify}
					>
						<button
							ref={closeButtonRef}
							type="button"
							aria-label="Close"
							onClick={handleClose}
							className="relative flex h-3 w-3 items-center justify-center rounded-full bg-[#ff5f57] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.15)]"
						>
							<span className="select-none opacity-0 transition-opacity duration-150 group-hover:opacity-100">
								{/* macOS close: thin diagonal cross */}
								<svg
									aria-hidden="true"
									width="8"
									height="8"
									viewBox="0 0 8 8"
									className="block"
								>
									<path
										d="M1.7 1.7 L6.3 6.3 M6.3 1.7 L1.7 6.3"
										stroke="rgba(0,0,0,0.55)"
										strokeWidth="1.1"
										strokeLinecap="round"
									/>
								</svg>
							</span>
						</button>
						<button
							ref={minimizeButtonRef}
							type="button"
							aria-label="Minimize"
							onClick={handleMinimize}
							className="relative flex h-3 w-3 items-center justify-center rounded-full bg-[#febc2e] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.15)]"
						>
							<span className="select-none opacity-0 transition-opacity duration-150 group-hover:opacity-100">
								{/* macOS minimize: single horizontal bar */}
								<svg
									aria-hidden="true"
									width="8"
									height="8"
									viewBox="0 0 8 8"
									className="block"
								>
									<path
										d="M1.4 4 L6.6 4"
										stroke="rgba(0,0,0,0.55)"
										strokeWidth="1.3"
										strokeLinecap="round"
									/>
								</svg>
							</span>
						</button>
						<button
							type="button"
							aria-label="Zoom"
							onClick={handleZoom}
							className="relative flex h-3 w-3 items-center justify-center rounded-full bg-[#28c840] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.15)]"
						>
							<span className="select-none opacity-0 transition-opacity duration-150 group-hover:opacity-100">
								{/* macOS zoom: two diagonal fullscreen triangles — pointing
								    inward (exit) while fullscreen, outward (enter) while
								    floating, exactly like the real green light. */}
								<svg
									aria-hidden="true"
									width="8"
									height="8"
									viewBox="0 0 8 8"
									className="block"
								>
									{fullscreen ? (
										<>
											<path
												d="M4.2 3.8 L7.4 3.8 L4.2 0.6 Z"
												fill="rgba(0,0,0,0.55)"
											/>
											<path
												d="M3.8 4.2 L0.6 4.2 L3.8 7.4 Z"
												fill="rgba(0,0,0,0.55)"
											/>
										</>
									) : (
										<>
											<path
												d="M7.2 0.8 L7.2 4.2 L3.8 0.8 Z"
												fill="rgba(0,0,0,0.55)"
											/>
											<path
												d="M0.8 7.2 L0.8 3.8 L4.2 7.2 Z"
												fill="rgba(0,0,0,0.55)"
											/>
										</>
									)}
								</svg>
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

			{!simpleControls && (
				<MinimizeDock
					kidPhotoSrc={KID_PHOTO_SRC}
					open={dockOpen}
					dismissing={restoring}
					onRequestRestore={handleRestore}
					onDismissed={handleDockDismissed}
				/>
			)}
		</div>
	);
}
