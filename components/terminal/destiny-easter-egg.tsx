"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
	DESTINY,
	DESTINY_CLASSIFIED_PHOTO,
	type DestinyRowTone,
} from "@/lib/easter-eggs";

export type DestinyStyle = "terminal" | "classified" | "card";

/** Fired to open the egg without prop-drilling through the command
 * registry or the konami listener below — this component is the only
 * thing listening. */
const OPEN_EVENT = "destiny:open";

/** External trigger — `commands.tsx` calls this after `cat /etc/loved-ones`
 * and `git log --oneline` finish revealing, and the konami listener in this
 * file calls it too, so there's exactly one way in. */
export function openDestiny(style: DestinyStyle) {
	document.dispatchEvent(
		new CustomEvent<DestinyStyle>(OPEN_EVENT, { detail: style }),
	);
}

const KONAMI_SEQUENCE = [
	"ArrowUp",
	"ArrowUp",
	"ArrowDown",
	"ArrowDown",
	"ArrowLeft",
	"ArrowRight",
	"ArrowLeft",
	"ArrowRight",
	"b",
	"a",
];

const PANEL_BASE =
	"close-alert-surface pointer-events-auto w-[350px] max-w-[calc(100vw-32px)] max-h-[85vh] overflow-y-auto p-4 font-mono text-[13px] leading-relaxed text-muted";

function toneClass(tone: DestinyRowTone): string {
	switch (tone) {
		case "pink":
			return "text-[#f0a6ca]";
		case "green":
			return "text-[#5fd75f]";
		case "amber":
			return "text-[#febc2e]";
		default:
			return "text-faint";
	}
}

/** The photo, with a graceful fallback: a missing/blocked file swaps to a
 * plain surface tint instead of a broken-image icon, so layout never
 * breaks. `className` carries all sizing so the fallback matches exactly. */
function DestinyPhoto({
	photoSrc,
	className,
}: {
	photoSrc: string;
	className: string;
}) {
	const [failed, setFailed] = useState(false);

	if (failed) {
		return (
			<div
				aria-hidden="true"
				className={`flex items-center justify-center bg-white/[0.04] text-faint ${className}`}
			>
				♡
			</div>
		);
	}

	return (
		// biome-ignore lint/performance/noImgElement: a single small local asset behind an easter egg — next/image's overhead isn't worth it here.
		<img
			src={photoSrc}
			alt="destiny"
			onError={() => setFailed(true)}
			className={className}
		/>
	);
}

function TrafficDots() {
	return (
		<div
			aria-hidden="true"
			className="absolute left-3 flex items-center gap-1.5"
		>
			<span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
			<span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
			<span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
		</div>
	);
}

/** "terminal" — a mini terminal window: real chrome pieces, the photo, then
 * a mono key/value block. The hint means what it says: this whole panel
 * closes on click, not just the backdrop. */
function TerminalReveal({ photoSrc }: { photoSrc: string }) {
	return (
		<div>
			<div className="relative -mx-4 -mt-4 mb-3 flex h-8 items-center justify-center rounded-t-xl border-white/10 border-b bg-gradient-to-b from-white/[0.07] to-black/[0.15]">
				<TrafficDots />
				<p className="select-none truncate px-10 font-sans text-[11px] text-white/[0.55]">
					{DESTINY.terminal.title}
				</p>
			</div>
			<DestinyPhoto
				photoSrc={photoSrc}
				className="h-[190px] w-full rounded-md object-cover"
			/>
			<dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
				{DESTINY.terminal.rows.map((row) => (
					<div key={row.key} className="contents">
						<dt className="text-faint">{row.key}:</dt>
						<dd className={toneClass(row.tone)}>{row.value}</dd>
					</div>
				))}
			</dl>
			<p className="mt-3 text-center text-[11px] text-faint">
				{DESTINY.terminal.hint}
			</p>
		</div>
	);
}

/** "classified" — a framed dossier: pink-bordered surface, a text-drawn
 * header, and a slightly desaturated photo. The one reveal style with its
 * own dedicated photo (`DESTINY_CLASSIFIED_PHOTO`) rather than the shared
 * `photoSrc` — Destiny in the Croatia jersey, making a heart. */
function ClassifiedReveal() {
	return (
		<div>
			<p aria-hidden="true" className="text-center text-[#f0a6ca] text-[12px]">
				{DESTINY.classified.header}
			</p>
			<div className="mt-2">
				<DestinyPhoto
					photoSrc={DESTINY_CLASSIFIED_PHOTO}
					className="h-[190px] w-full rounded-md object-cover [filter:contrast(1.05)_saturate(0.9)]"
				/>
			</div>
			<p className="mt-2 text-center text-[#f0a6ca]">
				{DESTINY.classified.caption}
			</p>
			<p className="mt-2 text-center text-[11px] text-faint">
				{DESTINY.classified.footer}
			</p>
		</div>
	);
}

/** "card" — a quiet polaroid-ish card: photo, name, caption, a small pill
 * badge. Still font-mono (the site's language) despite the original spec
 * asking for sans. */
function CardReveal({ photoSrc }: { photoSrc: string }) {
	return (
		<div>
			<DestinyPhoto
				photoSrc={photoSrc}
				className="h-[190px] w-full rounded-md object-cover"
			/>
			<p className="mt-3 text-[15px] text-foreground">{DESTINY.card.name}</p>
			<p className="mt-1 text-muted">{DESTINY.card.caption}</p>
			<span className="mt-3 inline-flex items-center gap-1 rounded-full border border-[#f0a6ca]/30 bg-[#f0a6ca]/[0.08] px-2.5 py-1 text-[#f0a6ca] text-[11px]">
				{DESTINY.card.badge}
			</span>
		</div>
	);
}

type DestinyEasterEggProps = {
	photoSrc: string;
};

/**
 * Mounted once in `app/page.tsx`. Renders nothing while closed; opening is
 * always external (`openDestiny`, called from `commands.tsx` or the konami
 * listener below) — never local state driven by this component's own UI.
 * Portals to `document.body` so it sits above the terminal window and the
 * "don't leave." alert, isolated from both.
 */
export function DestinyEasterEgg({ photoSrc }: DestinyEasterEggProps) {
	const [style, setStyle] = useState<DestinyStyle | null>(null);
	const dialogRef = useRef<HTMLDivElement>(null);
	const previouslyFocusedRef = useRef<HTMLElement | null>(null);
	const konamiProgressRef = useRef(0);

	useEffect(() => {
		function onOpen(event: Event) {
			setStyle((event as CustomEvent<DestinyStyle>).detail);
		}
		document.addEventListener(OPEN_EVENT, onOpen);
		return () => document.removeEventListener(OPEN_EVENT, onOpen);
	}, []);

	// The konami code — lives here so it's always listening, regardless of
	// what's on screen. The terminal input uses ArrowUp/Down for history and
	// happily types "b"/"a" as regular characters; that's fine, since this is
	// a separate `document` listener and the input's handler never calls
	// stopPropagation. No preventDefault here either, for the same reason —
	// history navigation keeps working right alongside this.
	useEffect(() => {
		function onKeyDown(event: KeyboardEvent) {
			const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
			const expected = KONAMI_SEQUENCE[konamiProgressRef.current];
			if (key === expected) {
				konamiProgressRef.current += 1;
				if (konamiProgressRef.current === KONAMI_SEQUENCE.length) {
					konamiProgressRef.current = 0;
					openDestiny("classified");
				}
			} else {
				konamiProgressRef.current = key === KONAMI_SEQUENCE[0] ? 1 : 0;
			}
		}
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, []);

	// Focus management: grab focus into the dialog on open, restore it to
	// whatever had it beforehand on close (including Esc).
	useEffect(() => {
		if (!style) return;
		previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
		const raf = requestAnimationFrame(() => dialogRef.current?.focus());

		function onKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				event.preventDefault();
				setStyle(null);
			}
		}
		document.addEventListener("keydown", onKeyDown);

		return () => {
			cancelAnimationFrame(raf);
			document.removeEventListener("keydown", onKeyDown);
			previouslyFocusedRef.current?.focus();
		};
	}, [style]);

	if (!style) return null;

	function close() {
		setStyle(null);
	}

	return createPortal(
		// biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click mirrors the site's other dialog (close-alert.tsx); Escape is the keyboard path.
		// biome-ignore lint/a11y/noStaticElementInteractions: decorative scrim, not a control.
		<div
			className="close-alert-backdrop fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
			onClick={close}
		>
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: only the "terminal" style wires an onClick here (its hint says "click anywhere to close"); Escape (handled above) is the keyboard path for all three. */}
			<div
				key={style}
				ref={dialogRef}
				role="dialog"
				aria-modal="true"
				aria-label="destiny"
				tabIndex={-1}
				onClick={
					style === "terminal" ? undefined : (event) => event.stopPropagation()
				}
				className={
					style === "classified"
						? `${PANEL_BASE} destiny-classified-surface`
						: PANEL_BASE
				}
			>
				{style === "terminal" && <TerminalReveal photoSrc={photoSrc} />}
				{style === "classified" && <ClassifiedReveal />}
				{style === "card" && <CardReveal photoSrc={photoSrc} />}
			</div>
		</div>,
		document.body,
	);
}
