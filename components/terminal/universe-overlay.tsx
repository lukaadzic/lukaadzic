"use client";

import {
	type MouseEvent as ReactMouseEvent,
	useEffect,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";
import { CosmosSky } from "@/components/terminal/cosmos-sky";
import {
	LINKS,
	STARS,
	type Star,
	UNIVERSE_HEADER,
	UNIVERSE_HINT,
} from "@/lib/universe";

type UniverseOverlayProps = {
	/** Mount gate — stays true through the exit crossfade below, same pattern
	 * as `MinimizeDock`'s `open`: it only goes false once `onExited` fires. */
	open: boolean;
	/** True the instant an exit is requested. Drives this overlay's own
	 * fade-out starting the exact same tick `terminal-window.tsx` starts the
	 * window frame's fade/scale back in — a real crossfade, not a sequential
	 * swap (same discipline as the minimize splash's restore). */
	dismissing: boolean;
	/** Fired on the second Esc (the first just closes an open star card) —
	 * no animation wait of its own. */
	onRequestExit: () => void;
	/** Fired once this overlay's own fade-out animation has actually
	 * finished, so the caller can unmount it (`open: false`). */
	onExited: () => void;
};

const DEFAULT_ACCENT = "#c7d0da";
const DEFAULT_SIZE = 3;

/** Maps a star's `labelSide` to the CSS class that positions its label —
 * "right" is the default base style (`.universe-star-label` itself), so it
 * needs no extra class. */
const LABEL_SIDE_CLASS: Record<string, string> = {
	left: "universe-star-label-left",
	top: "universe-star-label-top",
	bottom: "universe-star-label-bottom",
};

const STAR_START_MS = 260;
const STAR_STAGGER_MS = 70;
const LINE_START_MS = STAR_START_MS + STARS.length * STAR_STAGGER_MS + 200;
const LINE_STAGGER_MS = 90;

const CARD_WIDTH = 280;
const CARD_HEIGHT_ESTIMATE = 176;
const EDGE_MARGIN = 16;

/** Positions the star's card near the clicked star, clamped to the
 * viewport. Uses an estimated card height rather than a post-render
 * measure-and-reposition pass — the blurbs are short enough (1-2 sentences)
 * that the estimate is close, and the horizontal clamp (the axis most at
 * risk at 390px) is exact. */
function computeCardPosition(anchor: DOMRect): {
	left: number;
	top: number;
	width: number;
} {
	const vw = window.innerWidth;
	const vh = window.innerHeight;
	const width = Math.min(CARD_WIDTH, vw - EDGE_MARGIN * 2);
	const cx = anchor.left + anchor.width / 2;
	const cy = anchor.top + anchor.height / 2;

	let left = cx + 20;
	if (left + width + EDGE_MARGIN > vw) {
		left = cx - 20 - width;
	}
	left = Math.min(
		Math.max(left, EDGE_MARGIN),
		Math.max(EDGE_MARGIN, vw - width - EDGE_MARGIN),
	);

	let top = cy - CARD_HEIGHT_ESTIMATE / 2;
	top = Math.min(
		Math.max(top, EDGE_MARGIN),
		Math.max(EDGE_MARGIN, vh - CARD_HEIGHT_ESTIMATE - EDGE_MARGIN),
	);

	return { left, top, width };
}

const STAR_BY_ID = new Map(STARS.map((star) => [star.id, star]));

/**
 * "Expand the universe" — the green light's destination. His goals as a
 * constellation over the shared cosmos backdrop (`CosmosSky`, also used by
 * the minimize splash — one starfield for both eggs), the goal-stars from
 * `lib/universe.ts` connected by faint drawn-in lines, each one a real
 * `<button>` that opens a small site-surface card with its blurb. Portaled to
 * `document.body`, same pattern as `MinimizeDock` and `DestinyEasterEgg` —
 * mounted only while `open`, so `CosmosSky`'s random starfield regenerates
 * fresh each time the universe opens.
 */
export function UniverseOverlay({
	open,
	dismissing,
	onRequestExit,
	onExited,
}: UniverseOverlayProps) {
	const [activeId, setActiveId] = useState<string | null>(null);
	const [cardPos, setCardPos] = useState<{
		left: number;
		top: number;
		width: number;
	} | null>(null);
	const starButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

	// Fresh state each time the sky opens, focus lands on the first star —
	// the universe's counterpart to the minimize splash focusing its icon.
	useEffect(() => {
		if (!open) return;
		setActiveId(null);
		setCardPos(null);
		const first = STARS[0];
		if (first) starButtonRefs.current.get(first.id)?.focus();
	}, [open]);

	// Esc: closes an open card first; only exits the universe on a second
	// press with no card open. Refs so this listener never needs to
	// resubscribe as state changes mid-session.
	const activeIdRef = useRef(activeId);
	activeIdRef.current = activeId;
	const onRequestExitRef = useRef(onRequestExit);
	onRequestExitRef.current = onRequestExit;

	useEffect(() => {
		if (!open) return;
		function onKeyDown(event: KeyboardEvent) {
			if (event.key !== "Escape") return;
			event.preventDefault();
			if (activeIdRef.current) {
				setActiveId(null);
				return;
			}
			onRequestExitRef.current();
		}
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [open]);

	// The card's position was computed against a viewport that may no longer
	// exist after a resize/orientation change — simplest correct thing is to
	// close it rather than carry a stale position.
	useEffect(() => {
		if (!open || !activeId) return;
		function onResize() {
			setActiveId(null);
		}
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, [open, activeId]);

	if (!open) return null;

	function handleStarClick(
		star: Star,
		event: ReactMouseEvent<HTMLButtonElement>,
	) {
		const rect = event.currentTarget.getBoundingClientRect();
		setCardPos(computeCardPosition(rect));
		setActiveId(star.id);
	}

	// Same exit flow as Esc (see the keydown listener above): a card open
	// closes first, only a second tap with nothing open actually leaves.
	// Esc doesn't exist on phones, so this is the real, only-guaranteed-
	// reachable exit — the corner text used to be passive; now it's this.
	function handleExitTap() {
		if (activeId) {
			setActiveId(null);
			return;
		}
		onRequestExit();
	}

	const activeStar = activeId ? (STAR_BY_ID.get(activeId) ?? null) : null;

	return createPortal(
		<div
			className={`universe-overlay fixed inset-0 z-40 ${
				dismissing ? "universe-overlay-out" : ""
			}`}
			onAnimationEnd={(event) => {
				if (event.animationName === "universe-overlay-out") onExited();
			}}
		>
			<CosmosSky />

			<svg
				aria-hidden="true"
				className="universe-links absolute inset-0 h-full w-full"
				preserveAspectRatio="none"
				viewBox="0 0 100 100"
			>
				{LINKS.map(([fromId, toId], i) => {
					const from = STAR_BY_ID.get(fromId);
					const to = STAR_BY_ID.get(toId);
					if (!from || !to) return null;
					return (
						<line
							key={`${fromId}-${toId}`}
							x1={from.x}
							y1={from.y}
							x2={to.x}
							y2={to.y}
							pathLength={1}
							className="universe-line"
							style={{
								animationDelay: `${LINE_START_MS + i * LINE_STAGGER_MS}ms`,
							}}
						/>
					);
				})}
			</svg>

			<p
				className="universe-header universe-chrome-in absolute left-4 top-4 select-none font-mono text-[11px] text-faint sm:left-6 sm:top-6"
				style={{ animationDelay: "60ms" }}
			>
				{UNIVERSE_HEADER}
			</p>
			<button
				type="button"
				onClick={handleExitTap}
				aria-label="Return to earth"
				className="universe-exit-chip terminal-chip universe-chrome-in select-none font-mono text-[11px]"
				style={{ animationDelay: "140ms" }}
			>
				<span aria-hidden="true" className="universe-exit-esc text-faint">
					esc ·{" "}
				</span>
				{UNIVERSE_HINT}
			</button>

			{STARS.map((star, i) => (
				<button
					key={star.id}
					ref={(node) => {
						if (node) starButtonRefs.current.set(star.id, node);
						else starButtonRefs.current.delete(star.id);
					}}
					type="button"
					aria-label={`${star.label} — view`}
					aria-expanded={activeId === star.id}
					onClick={(event) => handleStarClick(star, event)}
					className="universe-star universe-star-in absolute"
					style={{
						left: `${star.x}%`,
						top: `${star.y}%`,
						animationDelay: `${STAR_START_MS + i * STAR_STAGGER_MS}ms`,
					}}
				>
					<span
						aria-hidden="true"
						className="universe-star-core"
						style={{
							width: star.size ?? DEFAULT_SIZE,
							height: star.size ?? DEFAULT_SIZE,
							background: star.accent ?? DEFAULT_ACCENT,
							boxShadow: `0 0 6px 1px ${star.accent ?? DEFAULT_ACCENT}, 0 0 16px 5px ${
								star.accent ?? DEFAULT_ACCENT
							}4d`,
						}}
					/>
					<span
						aria-hidden="true"
						className={`universe-star-label ${
							LABEL_SIDE_CLASS[star.labelSide ?? "right"] ?? ""
						}`}
					>
						{star.label}
					</span>
				</button>
			))}

			{activeStar && cardPos && (
				// biome-ignore lint/a11y/noStaticElementInteractions: click-anywhere-outside-the-card-to-close is the point of this layer; the card's own content isn't interactive beyond text, and Esc (global listener above) is the keyboard path.
				// biome-ignore lint/a11y/useKeyWithClickEvents: same — keyboard dismissal goes through the Esc listener, not this element.
				<div
					className="universe-card-backdrop fixed inset-0"
					onClick={(event) => {
						// Only the backdrop itself dismisses — clicks that land on
						// the card (bubbling up, since the card has no click
						// handler of its own) are ignored.
						if (event.target === event.currentTarget) setActiveId(null);
					}}
				>
					<div
						role="dialog"
						aria-label={activeStar.label}
						className="universe-card close-alert-surface universe-card-in pointer-events-auto absolute p-4 font-mono text-[13px] leading-relaxed"
						style={{
							left: cardPos.left,
							top: cardPos.top,
							width: cardPos.width,
							maxWidth: "calc(100vw - 32px)",
						}}
					>
						<h2
							className="text-[13px] font-semibold"
							style={{ color: activeStar.accent ?? "var(--color-foreground)" }}
						>
							{activeStar.label}
						</h2>
						<p className="mt-1.5 text-muted">{activeStar.blurb}</p>
						<p className="mt-3 text-[11px] text-faint">
							click anywhere to close
						</p>
					</div>
				</div>
			)}
		</div>,
		document.body,
	);
}
