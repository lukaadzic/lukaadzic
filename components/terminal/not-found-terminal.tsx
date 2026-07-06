"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
	EMPTY_CELL,
	GOAL_BOTTOM,
	GOAL_TOP,
} from "@/components/terminal/penalty-game";
import { PromptLine } from "@/components/terminal/prompt-line";

/** Long requested paths get truncated so the typed `cd` line never wraps or
 * dominates the page — the whole point here is "this route doesn't exist,"
 * not the full path. */
const MAX_PATH_CHARS = 40;

/** Same per-char cadence as `WELCOME_CHAR_DELAY_MS` in terminal-session.tsx —
 * the only other place on the site types a command out loud. */
const TYPE_CHAR_DELAY_MS = 55;
const TYPE_START_DELAY_MS = 300;
const ERROR_REVEAL_DELAY_MS = 150;
/** The "shell pausing" beat — same value as terminal-session's
 * `BOOT_COMMAND_LEAVE_BEAT_MS` — held after the error line before the goal
 * art draws in. */
const CROSSBAR_BEAT_MS = 250;
const ART_SETTLE_MS = 300;
const LINE_GAP_MS = 150;
const CHIP_GAP_MS = 200;
const PROMPT_GAP_MS = 200;

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/** ±40% jitter, same formula as terminal-session's `jitter` — keeps the
 * typed `cd` line feeling human instead of metronomic. */
function jitter(baseMs: number): number {
	const factor = 1 + (Math.random() * 2 - 1) * 0.4;
	return Math.max(1, Math.round(baseMs * factor));
}

function truncatePath(path: string): string {
	if (path.length <= MAX_PATH_CHARS) return path;
	return `${path.slice(0, MAX_PATH_CHARS - 1)}…`;
}

/** The goalmouth: the same box-drawing frame + zone width as the `penalty`
 * minigame's `GoalFrame`, but the ball sails in ABOVE the crossbar (trailed
 * by a small dotted arc) instead of landing in a zone, and the keeper just
 * stands center, untroubled — nobody needed to save this one. */
function CrossbarFrame() {
	return (
		<div
			aria-hidden="true"
			className="select-none whitespace-pre font-mono leading-[1.35] text-foreground"
		>
			<div className="text-faint">
				{"      "}
				{"· ·"}
				{"  "}
				<span className="penalty-ball-in inline-block">⚽</span>
			</div>
			<div>{GOAL_TOP}</div>
			<div>
				{"│"}
				{EMPTY_CELL}
				{"│"}
				{EMPTY_CELL}
				{"│"}
				{EMPTY_CELL}
				{"│"}
			</div>
			<div>
				{"│"}
				{EMPTY_CELL}
				{"│"}
				{"  "}
				<span className="penalty-glove-in inline-block">🧤</span>
				{"   "}
				{"│"}
				{EMPTY_CELL}
				{"│"}
			</div>
			<div>{GOAL_BOTTOM}</div>
			<p className="sr-only">
				The shot sailed over the crossbar. Livaković stands untroubled in the
				center of the goal.
			</p>
		</div>
	);
}

type Phase = "typing" | "typed";

/** `/404` — a route that doesn't exist is a shot that missed the goal
 * entirely. A small, self-contained typed sequence (no input engine, no
 * session/registry — this page is a dead end, not a shell): the requested
 * path gets `cd`'d into, zsh complains, a beat passes, then the goal art
 * draws in with the ball sailing over the bar and Livaković standing calm,
 * followed by the verdict lines and a single `cd ~` chip home. */
export function NotFoundTerminal() {
	const pathname = usePathname();
	const displayPath = truncatePath(pathname);
	const command = `cd ${displayPath}`;

	const [phase, setPhase] = useState<Phase>("typing");
	const [typed, setTyped] = useState("");
	const [showError, setShowError] = useState(false);
	const [showArt, setShowArt] = useState(false);
	const [showLine1, setShowLine1] = useState(false);
	const [showLine2, setShowLine2] = useState(false);
	const [showChip, setShowChip] = useState(false);
	const [showPrompt, setShowPrompt] = useState(false);
	const [cursorBlink, setCursorBlink] = useState(true);
	const startedRef = useRef(false);

	// One small clock, strictly top to bottom, same discipline as the home
	// page's boot sequence — just without a `[data-booted]`/CSS-fallback
	// apparatus, since this page is small enough that a single JS effect is
	// plenty (there's no risk of CSS beats racing ahead of typing that
	// hasn't started, because every reveal here is state-driven, not
	// animation-delay-driven).
	useEffect(() => {
		if (startedRef.current) return;
		startedRef.current = true;

		const reduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;

		// Reduced motion: everything appears instantly, in the same order,
		// just without the movement/typing.
		if (reduced) {
			setCursorBlink(false);
			setTyped(command);
			setPhase("typed");
			setShowError(true);
			setShowArt(true);
			setShowLine1(true);
			setShowLine2(true);
			setShowChip(true);
			setShowPrompt(true);
			return;
		}

		(async () => {
			await sleep(TYPE_START_DELAY_MS);
			for (let i = 1; i <= command.length; i++) {
				setTyped(command.slice(0, i));
				await sleep(jitter(TYPE_CHAR_DELAY_MS));
			}
			setPhase("typed");

			await sleep(ERROR_REVEAL_DELAY_MS);
			setShowError(true);

			await sleep(CROSSBAR_BEAT_MS);
			setShowArt(true);

			await sleep(ART_SETTLE_MS);
			setShowLine1(true);

			await sleep(LINE_GAP_MS);
			setShowLine2(true);

			await sleep(CHIP_GAP_MS);
			setShowChip(true);

			await sleep(PROMPT_GAP_MS);
			setShowPrompt(true);
		})();
	}, [command]);

	return (
		<div className="terminal-session font-mono text-[13px] leading-relaxed sm:text-[14px]">
			<PromptLine
				input={typed}
				cursor={phase === "typing"}
				cursorBlink={cursorBlink}
			/>
			{showError && (
				<p className="mt-2 penalty-fade text-muted">
					zsh: no such file or directory: {displayPath}
				</p>
			)}
			{showArt && (
				<div className="mt-4 notfound-art-in">
					<CrossbarFrame />
				</div>
			)}
			{showLine1 && (
				<p className="mt-4 penalty-fade text-foreground">
					404 — that one went over the crossbar.
				</p>
			)}
			{showLine2 && (
				<p className="mt-1 penalty-fade text-muted">
					not even livaković saves routes that don&apos;t exist.
				</p>
			)}
			{showChip && (
				<div className="mt-5 penalty-fade">
					<Link
						href="/"
						className="terminal-chip terminal-chip-accent inline-flex"
					>
						cd ~
					</Link>
				</div>
			)}
			{showPrompt && (
				<div className="mt-5 penalty-fade">
					<PromptLine cursor cursorBlink={cursorBlink} />
				</div>
			)}
		</div>
	);
}
