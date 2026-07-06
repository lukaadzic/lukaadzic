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
import { UniverseOverlay } from "@/components/terminal/universe-overlay";
import { CLOSE_ALERT } from "@/lib/easter-eggs";

type TerminalWindowProps = {
	children: ReactNode;
};

const TITLE = "lukaadzic — -zsh — 80×24";
// Doesn't exist yet — MinimizeDock falls back to a green `L` mark via
// `onError` until this file is dropped into `public/images/`.
const KID_PHOTO_SRC = "/images/luka-kid.jpg";

function reducedMotion(): boolean {
	return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function TerminalWindow({ children }: TerminalWindowProps) {
	// Fullscreen is the only window mode now — the green traffic light used
	// to zoom this down to a floating windowed look (remembered per tab via
	// sessionStorage); it now opens the expanding-universe overlay instead
	// (below), so `data-mode` is a fixed literal, not state.
	const [shaking, setShaking] = useState(false);
	// The real minimize-to-dock. `flyingOut` plays the
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
	// The red light: a "don't leave." alert instead of a toast. closeAttempts
	// doubles as "has the alert ever been mounted" — the alert stays mounted
	// after the first open so its Spotify iframe (and the music) survives
	// dismissal.
	const [closeAttempts, setCloseAttempts] = useState(0);
	const [alertOpen, setAlertOpen] = useState(false);
	const [showStayNote, setShowStayNote] = useState(false);
	const shakeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
	const stayNoteTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const minimizeButtonRef = useRef<HTMLButtonElement>(null);
	const zoomButtonRef = useRef<HTMLButtonElement>(null);
	const skipRestoreFocusRef = useRef(true);
	const skipUniverseFocusRef = useRef(true);

	// Green light on the home page: "expand the universe" — his goals as a
	// constellation, full-viewport, dark. `universeOpen` is the overlay's
	// mount gate (like `dockOpen`), staying true through the exit crossfade.
	// `universeShrinking` plays the window frame's own zoom-out (scale+fade)
	// the instant the universe is requested; once that finishes,
	// `universeHidden` hides the frame the same way minimizing does
	// (`visibility: hidden`, never unmounted — the window, its state, and any
	// playing music all survive underneath). `universeRestoring` is the
	// counterpart to `restoring` above: it starts the frame's fade/scale back
	// in at the exact tick the overlay's own fade-out begins, a real
	// crossfade rather than a sequential swap.
	const [universeOpen, setUniverseOpen] = useState(false);
	const [universeShrinking, setUniverseShrinking] = useState(false);
	const [universeHidden, setUniverseHidden] = useState(false);
	const [universeRestoring, setUniverseRestoring] = useState(false);

	// Pending timers must not fire into an unmounted component.
	useEffect(() => {
		return () => {
			if (shakeTimeout.current) clearTimeout(shakeTimeout.current);
			if (stayNoteTimeout.current) clearTimeout(stayNoteTimeout.current);
		};
	}, []);

	const warmSpotify = useCallback(() => {
		// Cheap no-op once the script is cached — safe to call repeatedly.
		loadSpotifyIframeApi().catch(() => {
			// Blocked/offline: the click path just retries later, same as today.
		});
	}, []);

	// Warm the Spotify iFrame API during idle time, well before anyone's
	// touched the red light — so by the time "don't leave." opens, the
	// script is already cached and the embedded player boots instantly
	// instead of paying for a fresh script fetch after the popup appears.
	useEffect(() => {
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
	}, [warmSpotify]);

	function handleClose() {
		setShaking(false);
		// Force a reflow so retriggering the animation class works even if
		// clicked twice in quick succession.
		requestAnimationFrame(() => setShaking(true));
		if (shakeTimeout.current) clearTimeout(shakeTimeout.current);
		shakeTimeout.current = setTimeout(() => setShaking(false), 420);

		// The terminal can't let go: a macOS-style "don't leave." alert opens
		// with DON'T LEAVE already playing inside it.
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

	// Same idea, for the green light: once the universe overlay has actually
	// handed focus back (the frame's `visibility: hidden` lifted), it lands
	// on the green light — not on mount.
	useEffect(() => {
		if (skipUniverseFocusRef.current) {
			skipUniverseFocusRef.current = false;
			return;
		}
		if (!universeHidden) {
			zoomButtonRef.current?.focus();
		}
	}, [universeHidden]);

	function handleUniverseOpen() {
		// Don't stack with the close alert, and the green light isn't reachable
		// at all while minimized (the whole frame is `visibility: hidden`) —
		// belt-and-suspenders in case it's ever reachable another way.
		if (alertOpen || windowHidden || dockOpen) return;
		if (universeOpen || universeShrinking) return;
		setUniverseOpen(true);
		setUniverseShrinking(true);
		// The entrance animation is long finished by the time anyone can reach
		// this button — belt-and-suspenders, same as handleMinimize.
		setHasEntered(true);
		if (reducedMotion()) {
			setUniverseShrinking(false);
			setUniverseHidden(true);
		}
	}

	// The counterpart to handleUniverseOpen — called by the overlay the
	// instant an exit is requested (second Esc, once no star card is open),
	// not after any animation of its own. Same crossfade discipline as
	// handleRestore: unhiding the frame and starting its fade/scale back in
	// here, the same tick `universeRestoring` flips (which the overlay also
	// receives as `dismissing`, starting its own fade-out).
	function handleUniverseExitRequest() {
		if (universeRestoring) return;
		setUniverseHidden(false);
		setUniverseRestoring(true);
		if (reducedMotion()) {
			setUniverseRestoring(false);
			setUniverseOpen(false);
		}
	}

	// The overlay's own fade-out has actually finished (non-reduced-motion
	// path only — the reduced-motion branch above already dropped it).
	function handleUniverseExited() {
		setUniverseOpen(false);
	}

	return (
		<div
			data-mode="fullscreen"
			className={`${hasEntered ? "" : "terminal-window-in"} relative w-full terminal-window-frame mx-auto ${
				shaking ? "terminal-shake" : ""
			} ${flyingOut ? "terminal-minimize-fly" : ""} ${
				restoring ? "terminal-restore-in" : ""
			} ${universeShrinking ? "terminal-universe-out" : ""} ${
				universeRestoring ? "terminal-universe-in" : ""
			} ${
				(windowHidden && !restoring) || (universeHidden && !universeRestoring)
					? "terminal-window-hidden"
					: ""
			}`}
			onAnimationEnd={(event) => {
				if (event.animationName === "terminal-minimize-fly") {
					setFlyingOut(false);
					setWindowHidden(true);
					setDockOpen(true);
				} else if (event.animationName === "terminal-restore-in") {
					setRestoring(false);
				} else if (event.animationName === "terminal-universe-out") {
					setUniverseShrinking(false);
					setUniverseHidden(true);
				} else if (event.animationName === "terminal-universe-in") {
					setUniverseRestoring(false);
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
										stroke="#460804"
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
										stroke="#90591d"
										strokeWidth="1.3"
										strokeLinecap="round"
									/>
								</svg>
							</span>
						</button>
						<button
							ref={zoomButtonRef}
							type="button"
							aria-label="Expand the universe"
							onClick={handleUniverseOpen}
							className="relative flex h-3 w-3 items-center justify-center rounded-full bg-[#28c840] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.15)]"
						>
							<span className="select-none opacity-0 transition-opacity duration-150 group-hover:opacity-100">
								{/* macOS zoom glyph: two diagonal outward-pointing triangles.
								    This used to flip inward/outward with the floating<->
								    fullscreen toggle it drove; now that fullscreen is the
								    only window mode, it stays outward always — read poetically
								    as "expand the universe", which is exactly what clicking
								    it does. */}
								<svg
									aria-hidden="true"
									width="8"
									height="8"
									viewBox="0 0 85.4 85.4"
									className="block"
								>
									<path
										d="M31.2 20.8h26.7c3.6 0 6.5 2.9 6.5 6.5V54z"
										fill="#2a6218"
									/>
									<path
										d="M54.4 64.5H27.6c-3.6 0-6.5-2.9-6.5-6.5V31.2z"
										fill="#2a6218"
									/>
								</svg>
							</span>
						</button>
					</div>

					<p className="select-none truncate font-sans text-[13px] font-medium text-white/[0.55]">
						{TITLE}
					</p>

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

			<MinimizeDock
				kidPhotoSrc={KID_PHOTO_SRC}
				open={dockOpen}
				dismissing={restoring}
				onRequestRestore={handleRestore}
				onDismissed={handleDockDismissed}
			/>

			<UniverseOverlay
				open={universeOpen}
				dismissing={universeRestoring}
				onRequestExit={handleUniverseExitRequest}
				onExited={handleUniverseExited}
			/>
		</div>
	);
}
